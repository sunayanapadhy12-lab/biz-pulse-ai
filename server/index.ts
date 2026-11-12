/// <reference types="node" />
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
import {
  getInvoice,
  getAllInvoices,
  saveInvoice,
  saveInvoicesBatch,
  getAllTransactions,
  saveTransaction,
  getTransactionByReference,
  savePayPalOrder,
  getPayPalOrder,
  markWebhookProcessed,
  isWebhookProcessed,
  settleInvoicePaymentAtomic,
} from './database.ts';
import type { InvoiceRecord, TransactionRecord } from './types.ts';

// Re-export types so external callers have access to data contracts
export type { InvoiceRecord, TransactionRecord } from './types.ts';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// ============================================================================
// Default Seed Invoices & Transactions (Mirrors initial business ledger)
// ============================================================================

export const defaultSeedInvoices: InvoiceRecord[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-088',
    customer: 'Vanguard Media Group',
    customerEmail: 'billing@vanguardmedia.co',
    issueDate: '2026-11-01',
    dueDate: '2026-11-15',
    amount: 2850.0,
    currency: 'USD',
    status: 'pending',
    items: [
      { id: '1', description: 'Monthly Executive Coffee Bar Service', quantity: 1, unitPrice: 1850 },
      { id: '2', description: 'VIP Pastry Box Assortment (Weekly)', quantity: 4, unitPrice: 250 },
    ],
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-087',
    customer: 'BioGenix Labs Inc.',
    customerEmail: 'ap@biogenixlabs.org',
    issueDate: '2026-10-22',
    dueDate: '2026-11-05',
    amount: 3200.0,
    currency: 'USD',
    status: 'overdue',
    items: [
      { id: '1', description: 'Symposium Breakfast & Lunch Service', quantity: 80, unitPrice: 40 },
    ],
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-086',
    customer: 'Crestline Architecture',
    customerEmail: 'finance@crestline.arch',
    issueDate: '2026-10-28',
    dueDate: '2026-11-12',
    amount: 1970.0,
    currency: 'USD',
    status: 'pending',
    items: [
      { id: '1', description: 'Artisan Bakery Delivery - Batch 4', quantity: 1, unitPrice: 1970 },
    ],
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2026-085',
    customer: 'Summit Ventures Capital',
    customerEmail: 'accounts@summitvc.io',
    issueDate: '2026-10-15',
    dueDate: '2026-10-30',
    amount: 4500.0,
    currency: 'USD',
    status: 'paid',
  },
  {
    id: 'inv-5',
    invoiceNumber: 'INV-2026-084',
    customer: 'NorthStar Coworking Hub',
    customerEmail: 'ops@northstarhub.com',
    issueDate: '2026-10-10',
    dueDate: '2026-10-24',
    amount: 1620.0,
    currency: 'USD',
    status: 'overdue',
  },
  {
    id: 'inv-6',
    invoiceNumber: 'INV-2026-083',
    customer: 'Pinnacle Law Partners',
    customerEmail: 'finance@pinnaclelaw.com',
    issueDate: '2026-10-05',
    dueDate: '2026-10-20',
    amount: 3760.0,
    currency: 'USD',
    status: 'paid',
  },
];

export const defaultSeedTransactions: TransactionRecord[] = [
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
    currency: 'USD',
    provider: 'PayPal Sandbox',
  },
];

/**
 * Ensures initial default data exists in Supabase on first run
 */
async function ensureInitialData(): Promise<void> {
  try {
    const existingInvoices = await getAllInvoices().catch(() => []);
    if (!existingInvoices || existingInvoices.length === 0) {
      console.log('[Supabase Init] Seeding initial business ledger invoices...');
      await saveInvoicesBatch(defaultSeedInvoices);
    }

    const existingTransactions = await getAllTransactions().catch(() => []);
    if (!existingTransactions || existingTransactions.length === 0) {
      console.log('[Supabase Init] Seeding initial ledger transaction...');
      await saveTransaction(defaultSeedTransactions[0]);
    }
  } catch (err) {
    console.warn('[Supabase Init Notice] Could not auto-seed default data:', err);
  }
}

// ============================================================================
// API Endpoints Router (Mounted on both /api and / for Vercel compatibility)
// ============================================================================

const apiRouter = express.Router();

/**
 * Health check
 */
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Biz Pulse AI PayPal Gateway',
    environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox',
    configured: Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
    database: 'supabase',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Get all invoices from Supabase
 */
apiRouter.get('/invoices', async (_req: Request, res: Response): Promise<void> => {
  try {
    let invoices = await getAllInvoices();
    if (!invoices || invoices.length === 0) {
      await ensureInitialData();
      invoices = await getAllInvoices();
    }
    res.json(invoices);
  } catch (error: any) {
    console.error('[Get Invoices Error]', error);
    res.status(500).json({ error: 'Failed to fetch invoices', message: error?.message });
  }
});

/**
 * POST /api/invoices
 * Registers newly created invoice in the Supabase repository.
 * Rejects duplicate invoice IDs to preserve data integrity.
 */
apiRouter.post('/invoices', async (req: Request, res: Response): Promise<void> => {
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
    const existing = await getInvoice(trimmedId);
    if (existing) {
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
      customer: customer && typeof customer === 'string' ? customer.trim() : 'Valued Customer',
      customerEmail:
        customerEmail && typeof customerEmail === 'string'
          ? customerEmail.trim()
          : 'billing@clientcorp.com',
      issueDate:
        issueDate && typeof issueDate === 'string'
          ? issueDate.trim()
          : new Date().toISOString().split('T')[0],
      dueDate:
        dueDate && typeof dueDate === 'string'
          ? dueDate.trim()
          : new Date().toISOString().split('T')[0],
      amount: Math.round(parsedAmount * 100) / 100,
      currency: 'USD',
      status: invoiceStatus as InvoiceRecord['status'],
      items: Array.isArray(items) ? items : undefined,
      metadata: {},
    };

    await saveInvoice(newInvoice);

    console.log(
      `[Invoice Register] Registered invoice ${newInvoice.id} (#${newInvoice.invoiceNumber}) for "${newInvoice.customer}" - Amount: $${newInvoice.amount.toFixed(2)} USD, Status: ${newInvoice.status}`
    );

    res.status(201).json({
      success: true,
      message: 'Invoice registered successfully in Supabase repository',
      invoice: newInvoice,
    });
  } catch (error: any) {
    console.error('[Invoice Registration Error]', error);
    res.status(500).json({ error: 'Failed to register invoice', message: error?.message });
  }
});

/**
 * POST /api/invoices/sync
 * Safe synchronization mechanism for initial local / demo invoices.
 * Ensures Supabase receives exact invoice IDs and amounts before create-order is called.
 * Critical safety: Never overwrites an already-paid invoice or one with an existing PayPal capture.
 */
apiRouter.post('/invoices/sync', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawList =
      req.body?.invoices ||
      (req.body?.invoice ? [req.body.invoice] : Array.isArray(req.body) ? req.body : []);

    if (!Array.isArray(rawList) || rawList.length === 0) {
      res.status(400).json({ error: 'No invoices provided for synchronization' });
      return;
    }

    const normalizedList: InvoiceRecord[] = [];
    for (const raw of rawList) {
      if (!raw || typeof raw.id !== 'string' || !raw.id.trim()) continue;
      const parsedAmount = typeof raw.amount === 'number' ? raw.amount : parseFloat(raw.amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) continue;

      normalizedList.push({
        id: raw.id.trim(),
        invoiceNumber: raw.invoiceNumber ? String(raw.invoiceNumber).trim() : `INV-${raw.id.trim()}`,
        customer: raw.customer ? String(raw.customer).trim() : 'Valued Customer',
        customerEmail: raw.customerEmail ? String(raw.customerEmail).trim() : 'billing@clientcorp.com',
        issueDate: raw.issueDate ? String(raw.issueDate).trim() : new Date().toISOString().split('T')[0],
        dueDate: raw.dueDate ? String(raw.dueDate).trim() : new Date().toISOString().split('T')[0],
        amount: Math.round(parsedAmount * 100) / 100,
        currency: 'USD',
        status:
          raw.status && ['paid', 'pending', 'overdue', 'draft'].includes(raw.status)
            ? raw.status
            : 'pending',
        items: Array.isArray(raw.items) ? raw.items : undefined,
        metadata: {},
      });
    }

    const batchResult = await saveInvoicesBatch(normalizedList);
    const allInvoices = await getAllInvoices();

    res.json({
      success: true,
      ...batchResult,
      totalInvoices: allInvoices.length,
    });
  } catch (error: any) {
    console.error('[Invoice Sync Error]', error);
    res.status(500).json({ error: 'Failed to synchronize invoices', message: error?.message });
  }
});

/**
 * Get all ledger transactions from Supabase
 */
apiRouter.get('/transactions', async (_req: Request, res: Response): Promise<void> => {
  try {
    let transactions = await getAllTransactions();
    if (!transactions || transactions.length === 0) {
      await ensureInitialData();
      transactions = await getAllTransactions();
    }
    res.json(transactions);
  } catch (error: any) {
    console.error('[Get Transactions Error]', error);
    res.status(500).json({ error: 'Failed to fetch transactions', message: error?.message });
  }
});

/**
 * POST /api/transactions
 * Persists a manually created or newly logged transaction in Supabase
 */
apiRouter.post('/transactions', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, name, category, date, amount, type, status, reference, paymentMethod, invoiceId } =
      req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'Valid transaction name is required' });
      return;
    }

    const parsedAmount = typeof amount === 'number' ? amount : parseFloat(amount);
    if (isNaN(parsedAmount) || !isFinite(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ error: 'Transaction amount must be a positive number' });
      return;
    }

    const txId = id && typeof id === 'string' && id.trim() ? id.trim() : `tx-${Date.now()}`;
    const newTx: TransactionRecord = {
      id: txId,
      invoiceId: invoiceId || undefined,
      name: name.trim(),
      category: category && typeof category === 'string' ? category.trim() : 'Corporate Sales',
      date: date && typeof date === 'string' ? date.trim() : 'Today, Just now',
      amount: Math.round(parsedAmount * 100) / 100,
      type: type === 'expense' ? 'expense' : 'income',
      status: status === 'pending' || status === 'failed' ? status : 'completed',
      reference:
        reference && typeof reference === 'string'
          ? reference.trim()
          : `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      paymentMethod:
        paymentMethod && typeof paymentMethod === 'string'
          ? paymentMethod.trim()
          : 'Bank Transfer (ACH)',
      currency: 'USD',
      provider: 'PayPal Sandbox',
      metadata: {},
    };

    await saveTransaction(newTx);

    res.status(201).json({
      success: true,
      message: 'Transaction saved to Supabase general ledger',
      transaction: newTx,
    });
  } catch (error: any) {
    console.error('[Save Transaction Error]', error);
    res.status(500).json({ error: 'Failed to save transaction', message: error?.message });
  }
});

/**
 * POST /api/paypal/create-order
 * Validates invoice from Supabase repository and creates PayPal Sandbox order.
 * Server strictly dictates order amount and currency ('USD') to prevent frontend tampering.
 */
apiRouter.post('/paypal/create-order', async (req: Request, res: Response): Promise<void> => {
  try {
    const { invoiceId } = req.body;

    if (!invoiceId || typeof invoiceId !== 'string') {
      res.status(400).json({ error: 'Valid invoiceId is required' });
      return;
    }

    const trimmedInvoiceId = invoiceId.trim();
    const invoice = await getInvoice(trimmedInvoiceId);

    if (!invoice) {
      console.warn(
        `[Create Order Error] Missing invoice: Invoice with ID "${trimmedInvoiceId}" not found in Supabase.`
      );
      res.status(404).json({
        error: `Invoice with ID ${trimmedInvoiceId} not found in backend repository. Ensure the invoice is registered before creating a PayPal order.`,
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

    // Server-enforced order creation: amount and currency strictly derived from Supabase repository
    const order = await createPayPalOrder({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      currency: 'USD',
      customerName: invoice.customer,
    });

    // Store association in Supabase for verification
    await savePayPalOrder(order.id, invoice.id, invoice.amount, 'USD');

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
 * 1. Verifies order belongs to target invoice via Supabase mapping
 * 2. Verifies capture status is COMPLETED
 * 3. Verifies capture amount matches invoice amount
 * 4. Atomically marks invoice as paid and adds transaction to ledger in Supabase
 */
apiRouter.post('/paypal/capture-order', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, invoiceId } = req.body;

    if (!orderId || typeof orderId !== 'string') {
      res.status(400).json({ error: 'Valid orderId is required' });
      return;
    }

    const trimmedOrderId = orderId.trim();

    // Verify invoice association from Supabase
    const savedOrder = await getPayPalOrder(trimmedOrderId);
    const targetInvoiceId = invoiceId || savedOrder?.invoiceId;

    if (!targetInvoiceId) {
      res.status(400).json({ error: 'Unable to verify invoice associated with this order' });
      return;
    }

    const invoice = await getInvoice(targetInvoiceId);
    if (!invoice) {
      res.status(404).json({ error: `Invoice ${targetInvoiceId} not found in Supabase repository` });
      return;
    }

    // Idempotency: If this order was already processed, return existing record
    if (
      invoice.status === 'paid' &&
      (invoice.paypalOrderId === trimmedOrderId || invoice.paypalCaptureId)
    ) {
      const existingTx = invoice.paypalCaptureId
        ? await getTransactionByReference(invoice.paypalCaptureId)
        : null;

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
    const captureResult = await capturePayPalOrder(trimmedOrderId);

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

    // Atomic update in Supabase
    const { invoice: updatedInvoice, transaction: createdTx } = await settleInvoicePaymentAtomic({
      invoiceId: invoice.id,
      captureId,
      orderId: trimmedOrderId,
      amount: invoice.amount,
      customerName: invoice.customer,
      invoiceNumber: invoice.invoiceNumber,
    });

    console.log(
      `[Capture Order] Successfully captured and verified PayPal Sandbox order ${trimmedOrderId}, Invoice ${invoice.id} (#${invoice.invoiceNumber}), Capture ID: ${captureId}`
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
apiRouter.post('/paypal/webhook', async (req: Request, res: Response): Promise<void> => {
  try {
    const headers = req.headers as WebhookHeaders;
    const event = req.body;

    if (!event || !event.event_type) {
      res.status(400).send('Invalid webhook payload');
      return;
    }

    // Durable idempotency check in Supabase
    if (event.id) {
      const alreadyProcessed = await isWebhookProcessed(event.id);
      if (alreadyProcessed) {
        res.status(200).json({ status: 'Event already processed' });
        return;
      }
    }

    // Verify cryptographic signature with PayPal
    const isValid = await verifyWebhookSignature(headers, event);
    if (!isValid) {
      console.warn('[Webhook Warning] Webhook signature verification failed');
      res.status(400).send('Invalid signature');
      return;
    }

    if (event.id) {
      await markWebhookProcessed(event.id, event.event_type);
    }

    const eventType: string = event.event_type;

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = event.resource;
      const captureId = resource.id;
      const invoiceId = resource.custom_id;

      if (invoiceId) {
        const invoice = await getInvoice(invoiceId);
        if (invoice && invoice.status !== 'paid') {
          await settleInvoicePaymentAtomic({
            invoiceId: invoice.id,
            captureId,
            orderId: resource.supplementary_data?.related_ids?.order_id || 'webhook',
            amount: invoice.amount,
            customerName: invoice.customer,
            invoiceNumber: invoice.invoiceNumber,
          });
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
apiRouter.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal Server Error', message: err?.message });
});

// Mount router on both /api (standard) and / (for Vercel rewrites where /api is stripped)
app.use('/api', apiRouter);
app.use('/', apiRouter);

if (process.env.NODE_ENV !== 'test' && process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`[Biz Pulse AI Backend] Server running on http://localhost:${PORT}`);
    console.log(`[Biz Pulse AI Backend] PayPal Environment: ${process.env.PAYPAL_ENVIRONMENT || 'sandbox'}`);
  });
}

export { app };
export default app;
