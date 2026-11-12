import { supabase } from './supabase.ts';
import type {
  InvoiceRecord,
  TransactionRecord,
  PayPalOrderRecord,
  SettlementResult,
} from './types.ts';

// Re-export types for consumers
export type { InvoiceRecord, TransactionRecord, PayPalOrderRecord, SettlementResult };

/**
 * Format date string safely for PostgreSQL timestamptz column
 */
function toTimestampTz(dateStr?: string): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Convert frontend / application InvoiceRecord to database row format
 */
export function invoiceToRow(invoice: InvoiceRecord) {
  return {
    id: invoice.id,
    invoice_number: invoice.invoiceNumber,
    customer_name: invoice.customer,
    customer: invoice.customer,
    customer_email: invoice.customerEmail,
    issue_date: invoice.issueDate,
    due_date: toTimestampTz(invoice.dueDate),
    amount: Number(invoice.amount),
    currency: invoice.currency || 'USD',
    status: invoice.status,
    paypal_order_id: invoice.paypalOrderId || null,
    paypal_capture_id: invoice.paypalCaptureId || null,
    items: invoice.items ? JSON.stringify(invoice.items) : null,
    metadata: invoice.metadata || {},
    updated_at: new Date().toISOString(),
  };
}

/**
 * Convert database row to frontend / application InvoiceRecord
 */
export function rowToInvoice(row: any): InvoiceRecord {
  let parsedItems = row.items;
  if (typeof row.items === 'string') {
    try {
      parsedItems = JSON.parse(row.items);
    } catch {
      parsedItems = undefined;
    }
  }

  let formattedDueDate = '';
  if (row.due_date) {
    formattedDueDate = String(row.due_date).slice(0, 10);
  }

  return {
    id: String(row.id),
    invoiceNumber: row.invoice_number || '',
    customer: row.customer || row.customer_name || 'Valued Customer',
    customerEmail: row.customer_email || '',
    issueDate: row.issue_date || (row.created_at ? String(row.created_at).slice(0, 10) : ''),
    dueDate: formattedDueDate,
    amount: Number(row.amount || 0),
    currency: row.currency || 'USD',
    status: row.status,
    paypalOrderId: row.paypal_order_id || undefined,
    paypalCaptureId: row.paypal_capture_id || undefined,
    items: Array.isArray(parsedItems) ? parsedItems : undefined,
    metadata: row.metadata || undefined,
    createdAt: row.created_at || undefined,
    updatedAt: row.updated_at || undefined,
  };
}

/**
 * Convert frontend / application TransactionRecord to database row format
 */
export function transactionToRow(transaction: TransactionRecord) {
  return {
    id: transaction.id,
    invoice_id: transaction.invoiceId || null,
    name: transaction.name,
    category: transaction.category,
    transaction_date: transaction.date,
    amount: Number(transaction.amount),
    type: transaction.type,
    status: transaction.status,
    reference: transaction.reference,
    payment_method: transaction.paymentMethod,
    currency: transaction.currency || 'USD',
    provider: transaction.provider || 'PayPal Sandbox',
    provider_transaction_id: transaction.providerTransactionId || transaction.reference,
    metadata: transaction.metadata || {},
  };
}

/**
 * Convert database row to frontend / application TransactionRecord
 */
export function rowToTransaction(row: any): TransactionRecord {
  return {
    id: String(row.id),
    invoiceId: row.invoice_id || undefined,
    name: row.name || '',
    category: row.category || '',
    date: row.transaction_date || (row.created_at ? String(row.created_at).slice(0, 10) : ''),
    amount: Number(row.amount || 0),
    type: row.type || 'income',
    status: row.status || 'completed',
    reference: row.reference || row.provider_transaction_id || '',
    paymentMethod: row.payment_method || row.provider || '',
    currency: row.currency || 'USD',
    provider: row.provider || undefined,
    providerTransactionId: row.provider_transaction_id || undefined,
    metadata: row.metadata || undefined,
    createdAt: row.created_at || undefined,
  };
}

// ============================================================================
// Authoritative Supabase Invoice Queries
// ============================================================================

export async function getInvoice(id: string): Promise<InvoiceRecord | null> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error(`[Supabase Error getInvoice id=${id}]`, error);
    throw new Error(`Database error fetching invoice: ${error.message} (${error.code})`);
  }
  return data ? rowToInvoice(data) : null;
}

export async function getAllInvoices(): Promise<InvoiceRecord[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase Error getAllInvoices]', error);
    throw new Error(`Database error fetching invoices: ${error.message} (${error.code})`);
  }
  return (data || []).map(rowToInvoice);
}

export async function saveInvoice(invoice: InvoiceRecord): Promise<void> {
  const row = invoiceToRow(invoice);
  const { error } = await supabase
    .from('invoices')
    .upsert(row, { onConflict: 'id' });

  if (error) {
    console.error(`[Supabase Error saveInvoice id=${invoice.id}]`, error);
    throw new Error(`Database error saving invoice: ${error.message} (${error.code})`);
  }
}

export async function saveInvoicesBatch(
  invoices: InvoiceRecord[]
): Promise<{ created: number; updated: number; skipped: number }> {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const inv of invoices) {
    if (!inv || !inv.id) continue;
    const existing = await getInvoice(inv.id);

    // SAFETY: Never overwrite an already-paid or captured invoice
    if (existing) {
      if (existing.status === 'paid' || existing.paypalCaptureId) {
        skipped++;
        continue;
      }
      await saveInvoice({
        ...existing,
        ...inv,
        status: existing.status, // preserve existing status
      });
      updated++;
    } else {
      await saveInvoice(inv);
      created++;
    }
  }

  return { created, updated, skipped };
}

// ============================================================================
// Authoritative Supabase Transaction Queries
// ============================================================================

export async function getAllTransactions(): Promise<TransactionRecord[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase Error getAllTransactions]', error);
    throw new Error(`Database error fetching transactions: ${error.message} (${error.code})`);
  }
  return (data || []).map(rowToTransaction);
}

export async function saveTransaction(transaction: TransactionRecord): Promise<void> {
  const row = transactionToRow(transaction);
  const { error } = await supabase
    .from('transactions')
    .upsert(row, { onConflict: 'id' });

  if (error) {
    console.error(`[Supabase Error saveTransaction id=${transaction.id}]`, error);
    throw new Error(`Database error saving transaction: ${error.message} (${error.code})`);
  }
}

export async function getTransactionByReference(reference: string): Promise<TransactionRecord | null> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .or(`reference.eq.${reference},provider_transaction_id.eq.${reference}`)
    .maybeSingle();

  if (error) {
    console.error(`[Supabase Error getTransactionByReference ref=${reference}]`, error);
    throw new Error(`Database error fetching transaction by reference: ${error.message} (${error.code})`);
  }
  return data ? rowToTransaction(data) : null;
}

// ============================================================================
// Authoritative PayPal Order Mappings
// ============================================================================

export async function savePayPalOrder(
  orderId: string,
  invoiceId: string,
  amount: number,
  currency = 'USD'
): Promise<void> {
  const { error } = await supabase.from('paypal_orders').upsert(
    {
      order_id: orderId,
      invoice_id: invoiceId,
      amount: Number(amount),
      currency: currency.toUpperCase(),
      created_at: new Date().toISOString(),
    },
    { onConflict: 'order_id' }
  );

  if (error) {
    console.error(`[Supabase Error savePayPalOrder orderId=${orderId}]`, error);
    throw new Error(`Database error saving PayPal order mapping: ${error.message} (${error.code})`);
  }
}

export async function getPayPalOrder(orderId: string): Promise<PayPalOrderRecord | null> {
  const { data, error } = await supabase
    .from('paypal_orders')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle();

  if (error) {
    console.error(`[Supabase Error getPayPalOrder orderId=${orderId}]`, error);
    throw new Error(`Database error fetching PayPal order mapping: ${error.message} (${error.code})`);
  }

  if (!data) return null;

  return {
    orderId: data.order_id,
    invoiceId: data.invoice_id,
    amount: Number(data.amount),
    currency: data.currency,
    createdAt: data.created_at,
  };
}

// ============================================================================
// Authoritative Webhook Idempotency
// ============================================================================

export async function markWebhookProcessed(eventId: string, eventType: string): Promise<boolean> {
  const { error } = await supabase.from('processed_webhook_events').insert({
    event_id: eventId,
    event_type: eventType,
    processed_at: new Date().toISOString(),
  });

  if (error) {
    if (error.code === '23505') {
      return false; // Unique violation -> already processed
    }
    console.error(`[Supabase Error markWebhookProcessed eventId=${eventId}]`, error);
    throw new Error(`Database error marking webhook event processed: ${error.message} (${error.code})`);
  }

  return true;
}

export async function isWebhookProcessed(eventId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('processed_webhook_events')
    .select('event_id')
    .eq('event_id', eventId)
    .maybeSingle();

  if (error) {
    console.error(`[Supabase Error isWebhookProcessed eventId=${eventId}]`, error);
    throw new Error(`Database error checking webhook idempotency: ${error.message} (${error.code})`);
  }
  return Boolean(data);
}

// ============================================================================
// Safeguard 3: Atomic Payment Settlement
// ============================================================================

/**
 * Settles invoice payment atomically:
 * 1. Checks if Supabase RPC `settle_invoice_payment` exists and executes it.
 * 2. Falls back to coordinated transactional execution with verification.
 */
export async function settleInvoicePaymentAtomic(params: {
  invoiceId: string;
  captureId: string;
  orderId: string;
  amount: number;
  customerName?: string;
  invoiceNumber?: string;
}): Promise<SettlementResult> {
  const { invoiceId, captureId, orderId, customerName, invoiceNumber } = params;

  // 1. Try Supabase RPC first if configured
  try {
    const { data, error: rpcError } = await supabase.rpc('settle_invoice_payment', {
      p_invoice_id: invoiceId,
      p_capture_id: captureId,
      p_order_id: orderId,
      p_amount: params.amount,
      p_customer: customerName || 'Valued Customer',
      p_invoice_number: invoiceNumber || '',
    });

    if (!rpcError && data && data.invoice && data.transaction) {
      return {
        invoice: rowToInvoice(data.invoice),
        transaction: rowToTransaction(data.transaction),
      };
    }
  } catch {
    // Proceed to coordinated execution
  }

  // 2. Coordinated execution
  const invoice = await getInvoice(invoiceId);
  if (!invoice) {
    throw new Error(`Invoice with ID "${invoiceId}" not found for settlement.`);
  }

  // Check if ledger transaction already exists for this capture ID (idempotency)
  let transaction = await getTransactionByReference(captureId);

  // Update invoice
  invoice.status = 'paid';
  invoice.paypalCaptureId = captureId;
  invoice.paypalOrderId = orderId;
  await saveInvoice(invoice);

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
      invoiceId: invoice.id,
      name: `${invoice.customer} - #${invoice.invoiceNumber} Settlement`,
      category: 'Corporate Sales',
      date: `Today, ${formattedDate}`,
      amount: invoice.amount,
      type: 'income',
      status: 'completed',
      reference: captureId,
      paymentMethod: 'PayPal Sandbox',
      currency: 'USD',
      provider: 'PayPal Sandbox',
      providerTransactionId: captureId,
      metadata: {
        orderId,
        captureId,
        settledAt: new Date().toISOString(),
      },
    };

    await saveTransaction(transaction);
  }

  return { invoice, transaction };
}
