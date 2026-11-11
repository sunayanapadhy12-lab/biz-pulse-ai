import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import {
  createPayPalOrder,
  capturePayPalOrder,
  verifyWebhookSignature,
} from './paypalClient.ts';
import type { WebhookHeaders } from './paypalClient.ts';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// ============================================================================
// In-Memory Repository (Modular & replaceable with Supabase / SQL DB)
// ============================================================================

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  customer: string;
  customerEmail: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  currency?: string;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  paypalOrderId?: string;
  paypalCaptureId?: string;
  items?: Array<{ id: string; description: string; quantity: number; unitPrice: number }>;
}

export interface TransactionRecord {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'completed' | 'pending' | 'failed';
  reference: string;
  paymentMethod: string;
}

// Seed initial invoices mirroring business ledger
const invoicesStore: Map<string, InvoiceRecord> = new Map([
  [
    'inv-1',
    {
      id: 'inv-1',
      invoiceNumber: 'INV-2026-088',
      customer: 'Vanguard Media Group',
      customerEmail: 'billing@vanguardmedia.co',
      issueDate: '2026-11-01',
      dueDate: '2026-11-15',
      amount: 2850.0,
      status: 'pending',
      items: [
        { id: '1', description: 'Monthly Executive Coffee Bar Service', quantity: 1, unitPrice: 1850 },
        { id: '2', description: 'VIP Pastry Box Assortment (Weekly)', quantity: 4, unitPrice: 250 },
      ],
    },
  ],
  [
    'inv-2',
    {
      id: 'inv-2',
      invoiceNumber: 'INV-2026-087',
      customer: 'BioGenix Labs Inc.',
      customerEmail: 'ap@biogenixlabs.org',
      issueDate: '2026-10-22',
      dueDate: '2026-11-05',
      amount: 3200.0,
      status: 'overdue',
      items: [
        { id: '1', description: 'Symposium Breakfast & Lunch Service', quantity: 80, unitPrice: 40 },
      ],
    },
  ],
  [
    'inv-3',
    {
      id: 'inv-3',
      invoiceNumber: 'INV-2026-086',
      customer: 'Crestline Architecture',
      customerEmail: 'finance@crestline.arch',
      issueDate: '2026-10-28',
      dueDate: '2026-11-12',
      amount: 1970.0,
      status: 'pending',
      items: [
        { id: '1', description: 'Artisan Bakery Delivery - Batch 4', quantity: 1, unitPrice: 1970 },
      ],
    },
  ],
  [
    'inv-4',
    {
      id: 'inv-4',
      invoiceNumber: 'INV-2026-085',
      customer: 'Summit Ventures Capital',
      customerEmail: 'accounts@summitvc.io',
      issueDate: '2026-10-15',
      dueDate: '2026-10-30',
      amount: 4500.0,
      status: 'paid',
    },
  ],
  [
    'inv-5',
    {
      id: 'inv-5',
      invoiceNumber: 'INV-2026-084',
      customer: 'NorthStar Coworking Hub',
      customerEmail: 'ops@northstarhub.com',
      issueDate: '2026-10-10',
      dueDate: '2026-10-24',
      amount: 1620.0,
      status: 'overdue',
    },
  ],
  [
    'inv-6',
    {
      id: 'inv-6',
      invoiceNumber: 'INV-2026-083',
      customer: 'Pinnacle Law Partners',
      customerEmail: 'finance@pinnaclelaw.com',
      issueDate: '2026-10-05',
      dueDate: '2026-10-20',
      amount: 3760.0,
      status: 'paid',
    },
  ],
]);

// Ledger transactions store
const transactionsStore: Map<string, TransactionRecord> = new Map([
  [
    'tx-1',
    {
      id: 'tx-1',
      name: 'Apex Design Studio - Monthly Catering',
      category: 'Corporate Sales',
      date: 'Today, 10:45 AM',
      amount: 3450.0,
      type: 'income',
      status: 'completed',
      reference: 'TXN-90214',
      paymentMethod: 'Bank Transfer (ACH)',
    },
  ],
]);

// Anti-replay and idempotency tracking
const processedCaptures = new Set<string>();
const processedWebhookEventIds = new Set<string>();
const orderToInvoiceMap = new Map<string, { invoiceId: string; amount: number }>();

// ============================================================================
// Helper: Mark invoice paid and record credited transaction
// ============================================================================

function settleInvoice(
  invoice: InvoiceRecord,
  captureId: string,
  orderId?: string
): { invoice: InvoiceRecord; transaction: TransactionRecord } {
  invoice.status = 'paid';
  invoice.paypalCaptureId = captureId;
  if (orderId) invoice.paypalOrderId = orderId;
  invoicesStore.set(invoice.id, invoice);

  // Check if ledger transaction already exists for this capture
  let transaction: TransactionRecord | undefined;
  for (const tx of transactionsStore.values()) {
    if (tx.reference === captureId) {
      transaction = tx;
      break;
    }
  }

  if (!transaction) {
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(new Date());

    transaction = {
      id: `tx-pp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: `${invoice.customer} - #${invoice.invoiceNumber} Settlement`,
      category: 'Corporate Sales',
      date: `Today, ${formattedDate}`,
      amount: invoice.amount,
      type: 'income',
      status: 'completed',
      reference: captureId,
      paymentMethod: 'PayPal Sandbox',
    };
    transactionsStore.set(transaction.id, transaction);
  }

  return { invoice, transaction };
}

// ============================================================================
// API Endpoints
// ============================================================================

/**
 * Health check
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Biz Pulse AI PayPal Gateway',
    environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox',
    configured: Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Get all invoices
 */
app.get('/api/invoices', (_req: Request, res: Response) => {
  res.json(Array.from(invoicesStore.values()));
});

/**
 * POST /api/invoices
 * Registers newly created invoice in the backend repository.
 * Validates ID, invoice number, positive amount, currency ('USD'), and status.
 * Rejects duplicate invoice IDs to preserve data integrity.
 */
app.post('/api/invoices', (req: Request, res: Response): void => {
  try {
    const {
      id,
      invoiceNumber,
      customer,
      customerEmail,
      issueDate,
      dueDate,
      amount,
      currency,
      status,
      items,
    } = req.body;

    // Validate ID
    if (!id || typeof id !== 'string' || !id.trim()) {
      res.status(400).json({ error: 'Valid non-empty invoice ID is required' });
      return;
    }

    const trimmedId = id.trim();

    // Prevent duplicate invoice IDs
    if (invoicesStore.has(trimmedId)) {
      console.warn(`[Invoice Duplicate] Attempted duplicate registration for invoice ID "${trimmedId}"`);
      res.status(409).json({
        error: 'Duplicate invoice',
        message: `Invoice with ID "${trimmedId}" already exists in the backend repository.`,
      });
      return;
    }

    // Validate invoice number
    if (!invoiceNumber || typeof invoiceNumber !== 'string' || !invoiceNumber.trim()) {
      res.status(400).json({ error: 'Valid invoice number is required' });
      return;
    }

    // Validate amount
    const parsedAmount = typeof amount === 'number' ? amount : parseFloat(amount);
    if (isNaN(parsedAmount) || !isFinite(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ error: 'Invoice amount must be a positive number greater than zero' });
      return;
    }

    // Validate currency (USD only for this Sandbox integration)
    const invoiceCurrency = (currency || 'USD').toString().toUpperCase().trim();
    if (invoiceCurrency !== 'USD') {
      res.status(400).json({
        error: 'Invalid currency',
        message: `Currency "${currency}" is not supported. Only "USD" is permitted for this Sandbox integration.`,
      });
      return;
    }

    // Validate status
    const validStatuses = ['paid', 'pending', 'overdue', 'draft'];
    const invoiceStatus = (status || 'pending').toString().toLowerCase().trim();
    if (!validStatuses.includes(invoiceStatus)) {
      res.status(400).json({
        error: 'Invalid status',
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
      return;
    }

    const newInvoice: InvoiceRecord = {
      id: trimmedId,
      invoiceNumber: invoiceNumber.trim(),
      customer: (customer && typeof customer === 'string' ? customer.trim() : 'Valued Customer'),
      customerEmail: (customerEmail && typeof customerEmail === 'string' ? customerEmail.trim() : 'billing@clientcorp.com'),
      issueDate: (issueDate && typeof issueDate === 'string' ? issueDate.trim() : new Date().toISOString().split('T')[0]),
      dueDate: (dueDate && typeof dueDate === 'string' ? dueDate.trim() : new Date().toISOString().split('T')[0]),
      amount: Math.round(parsedAmount * 100) / 100,
      currency: 'USD',
      status: invoiceStatus as InvoiceRecord['status'],
      items: Array.isArray(items) ? items : undefined,
    };

    invoicesStore.set(trimmedId, newInvoice);

    console.log(
      `[Invoice Register] Registered invoice ${newInvoice.id} (#${newInvoice.invoiceNumber}) for "${newInvoice.customer}" - Amount: $${newInvoice.amount.toFixed(2)} USD, Status: ${newInvoice.status}`
    );

    res.status(201).json({
      success: true,
      message: 'Invoice registered successfully in backend repository',
      invoice: newInvoice,
    });
  } catch (error: any) {
    console.error('[Invoice Registration Error]', error);
    res.status(500).json({ error: 'Failed to register invoice', message: error?.message });
  }
});

/**
 * POST /api/invoices/sync
 * Safe synchronization mechanism for existing local / demo invoices.
 * Ensures the backend receives the exact invoice ID and amount before create-order is called.
 * Critical safety: Never overwrites an already-paid invoice or an invoice with an existing PayPal capture.
 */
app.post('/api/invoices/sync', (req: Request, res: Response): void => {
  try {
    const rawList = req.body?.invoices || (req.body?.invoice ? [req.body.invoice] : (Array.isArray(req.body) ? req.body : []));

    if (!Array.isArray(rawList) || rawList.length === 0) {
      res.status(400).json({ error: 'No invoices provided for synchronization' });
      return;
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const raw of rawList) {
      if (!raw || typeof raw.id !== 'string' || !raw.id.trim()) continue;

      const id = raw.id.trim();
      const existing = invoicesStore.get(id);

      // SAFETY: Do not overwrite an already-paid invoice or an invoice with an existing PayPal capture
      if (existing) {
        if (existing.status === 'paid' || existing.paypalCaptureId) {
          skipped++;
          console.log(`[Invoice Sync] Skipped overwrite of paid/captured invoice ${id} (#${existing.invoiceNumber})`);
          continue;
        }

        // Update mutable details safely while keeping status / amounts validated
        const parsedAmount = typeof raw.amount === 'number' ? raw.amount : parseFloat(raw.amount);
        if (!isNaN(parsedAmount) && parsedAmount > 0) {
          existing.amount = Math.round(parsedAmount * 100) / 100;
        }
        if (raw.customer) existing.customer = String(raw.customer).trim();
        if (raw.customerEmail) existing.customerEmail = String(raw.customerEmail).trim();
        if (raw.dueDate) existing.dueDate = String(raw.dueDate).trim();
        if (raw.status && ['pending', 'overdue', 'draft'].includes(raw.status)) {
          existing.status = raw.status;
        }
        if (Array.isArray(raw.items)) existing.items = raw.items;

        updated++;
      } else {
        // Register missing invoice into repository
        const parsedAmount = typeof raw.amount === 'number' ? raw.amount : parseFloat(raw.amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) continue;

        const newRecord: InvoiceRecord = {
          id,
          invoiceNumber: raw.invoiceNumber ? String(raw.invoiceNumber).trim() : `INV-${id}`,
          customer: raw.customer ? String(raw.customer).trim() : 'Valued Customer',
          customerEmail: raw.customerEmail ? String(raw.customerEmail).trim() : 'billing@clientcorp.com',
          issueDate: raw.issueDate ? String(raw.issueDate).trim() : new Date().toISOString().split('T')[0],
          dueDate: raw.dueDate ? String(raw.dueDate).trim() : new Date().toISOString().split('T')[0],
          amount: Math.round(parsedAmount * 100) / 100,
          currency: 'USD',
          status: raw.status && ['paid', 'pending', 'overdue', 'draft'].includes(raw.status) ? raw.status : 'pending',
          items: Array.isArray(raw.items) ? raw.items : undefined,
        };

        invoicesStore.set(id, newRecord);
        created++;
        console.log(`[Invoice Sync] Registered missing invoice ${id} (#${newRecord.invoiceNumber}) - Amount: $${newRecord.amount.toFixed(2)} USD`);
      }
    }

    res.json({
      success: true,
      created,
      updated,
      skipped,
      totalInvoices: invoicesStore.size,
    });
  } catch (error: any) {
    console.error('[Invoice Sync Error]', error);
    res.status(500).json({ error: 'Failed to synchronize invoices', message: error?.message });
  }
});

/**
 * Get all ledger transactions
 */
app.get('/api/transactions', (_req: Request, res: Response) => {
  res.json(Array.from(transactionsStore.values()));
});

/**
 * POST /api/paypal/create-order
 * Validates invoice from backend repository and creates PayPal Sandbox order.
 * Server strictly dictates order amount and currency ('USD') to prevent frontend tampering.
 */
app.post('/api/paypal/create-order', async (req: Request, res: Response): Promise<void> => {
  try {
    const { invoiceId } = req.body;

    if (!invoiceId || typeof invoiceId !== 'string') {
      res.status(400).json({ error: 'Valid invoiceId is required' });
      return;
    }

    const trimmedInvoiceId = invoiceId.trim();
    const invoice = invoicesStore.get(trimmedInvoiceId);

    if (!invoice) {
      console.warn(
        `[Create Order Error] Missing invoice: Invoice with ID "${trimmedInvoiceId}" not found in backend repository. Available repository IDs: [${Array.from(invoicesStore.keys()).join(', ')}]`
      );
      res.status(404).json({
        error: `Invoice with ID ${trimmedInvoiceId} not found in backend repository. Ensure the invoice is registered via POST /api/invoices before creating a PayPal order.`,
      });
      return;
    }

    if (invoice.status === 'paid') {
      console.warn(
        `[Create Order Error] Invoice ${invoice.id} (#${invoice.invoiceNumber}) has already been settled and paid.`
      );
      res.status(400).json({ error: 'Invoice has already been settled and paid' });
      return;
    }

    if (invoice.amount <= 0) {
      res.status(400).json({ error: 'Invoice amount must be greater than zero' });
      return;
    }

    // Server-enforced order creation: amount and currency strictly derived from backend repository
    const order = await createPayPalOrder({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      currency: 'USD',
      customerName: invoice.customer,
    });

    // Store association for verification
    orderToInvoiceMap.set(order.id, {
      invoiceId: invoice.id,
      amount: invoice.amount,
    });

    console.log(
      `[Create Order] PayPal Sandbox order ${order.id} created for Invoice ${invoice.id} (#${invoice.invoiceNumber}) - Verified Server Amount: $${invoice.amount.toFixed(2)} USD`
    );

    res.json({
      orderId: order.id,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      currency: 'USD',
    });
  } catch (error: any) {
    console.error('[Create Order Error]', error);
    res.status(500).json({
      error: 'Failed to create PayPal order',
      message: error?.message || 'Internal error',
    });
  }
});

/**
 * POST /api/paypal/capture-order
 * Captures approved order and performs strict server-side verification:
 * 1. Verifies order belongs to target invoice
 * 2. Verifies capture status is COMPLETED
 * 3. Verifies capture amount matches invoice amount
 * 4. Idempotently marks invoice as paid and adds transaction to ledger
 */
app.post('/api/paypal/capture-order', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, invoiceId } = req.body;

    if (!orderId || typeof orderId !== 'string') {
      res.status(400).json({ error: 'Valid orderId is required' });
      return;
    }

    // Verify invoice association
    const mapped = orderToInvoiceMap.get(orderId);
    const targetInvoiceId = invoiceId || mapped?.invoiceId;

    if (!targetInvoiceId) {
      res.status(400).json({ error: 'Unable to verify invoice associated with this order' });
      return;
    }

    const invoice = invoicesStore.get(targetInvoiceId);
    if (!invoice) {
      res.status(404).json({ error: `Invoice ${targetInvoiceId} not found` });
      return;
    }

    // Idempotency: If this order was already processed, return existing record
    if (processedCaptures.has(orderId) && invoice.status === 'paid') {
      let existingTx: TransactionRecord | undefined;
      for (const tx of transactionsStore.values()) {
        if (tx.reference === invoice.paypalCaptureId) {
          existingTx = tx;
          break;
        }
      }
      res.json({
        success: true,
        alreadyProcessed: true,
        captureId: invoice.paypalCaptureId,
        invoice,
        transaction: existingTx,
      });
      return;
    }

    // Execute capture on PayPal Sandbox API
    const captureResult = await capturePayPalOrder(orderId);

    // Verify capture outcome
    if (captureResult.status !== 'COMPLETED') {
      res.status(400).json({
        error: `Payment was not completed. Current status: ${captureResult.status}`,
        details: captureResult,
      });
      return;
    }

    const captureUnit = captureResult.purchase_units?.[0]?.payments?.captures?.[0];
    const captureId = captureUnit?.id || captureResult.id;
    const capturedAmountStr = captureUnit?.amount?.value;
    const capturedCurrency = captureUnit?.amount?.currency_code;

    // Verify currency and amount
    if (capturedCurrency && capturedCurrency !== 'USD') {
      res.status(400).json({ error: `Unexpected currency: ${capturedCurrency}` });
      return;
    }

    if (capturedAmountStr) {
      const capturedAmount = parseFloat(capturedAmountStr);
      if (Math.abs(capturedAmount - invoice.amount) > 0.01) {
        res.status(400).json({
          error: `Captured amount ($${capturedAmount}) does not match invoice ($${invoice.amount})`,
        });
        return;
      }
    }

    // Record capture in idempotency tracking
    processedCaptures.add(orderId);

    // Update state
    const { invoice: updatedInvoice, transaction: createdTx } = settleInvoice(
      invoice,
      captureId,
      orderId
    );

    console.log(
      `[Capture Order] Successfully captured and verified PayPal Sandbox order ${orderId}, Invoice ${invoice.id} (#${invoice.invoiceNumber}), Capture ID: ${captureId}`
    );

    res.json({
      success: true,
      captureId,
      status: 'COMPLETED',
      invoice: updatedInvoice,
      transaction: createdTx,
    });
  } catch (error: any) {
    console.error('[Capture Order Error]', error);
    res.status(500).json({
      error: 'Failed to capture and verify PayPal order',
      message: error?.message || 'Internal error',
    });
  }
});

/**
 * POST /api/paypal/webhook
 * Handles asynchronous PayPal webhook notifications.
 * Cryptographically verifies signature and updates invoice status idempotently.
 */
app.post('/api/paypal/webhook', async (req: Request, res: Response): Promise<void> => {
  try {
    const headers = req.headers as WebhookHeaders;
    const event = req.body;

    if (!event || !event.event_type) {
      res.status(400).send('Invalid webhook payload');
      return;
    }

    // Prevent duplicate event replay
    if (event.id && processedWebhookEventIds.has(event.id)) {
      res.status(200).json({ status: 'Event already processed' });
      return;
    }

    // Verify cryptographic signature with PayPal
    const isValid = await verifyWebhookSignature(headers, event);
    if (!isValid) {
      console.warn('[Webhook Warning] Webhook signature verification failed');
      res.status(400).send('Invalid signature');
      return;
    }

    if (event.id) {
      processedWebhookEventIds.add(event.id);
    }

    const eventType: string = event.event_type;

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = event.resource;
      const captureId = resource.id;
      const invoiceId = resource.custom_id;

      if (invoiceId && invoicesStore.has(invoiceId)) {
        const invoice = invoicesStore.get(invoiceId)!;
        if (invoice.status !== 'paid') {
          settleInvoice(invoice, captureId);
          console.log(`[Webhook Success] Invoice ${invoice.invoiceNumber} marked as paid via webhook.`);
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('[Webhook Processing Error]', error);
    res.status(500).json({ error: error?.message || 'Webhook processing failed' });
  }
});

// Central error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal Server Error', message: err?.message });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Biz Pulse AI Backend] Server running on http://localhost:${PORT}`);
    console.log(`[Biz Pulse AI Backend] PayPal Environment: ${process.env.PAYPAL_ENVIRONMENT || 'sandbox'}`);
  });
}

export { app };
export default app;

