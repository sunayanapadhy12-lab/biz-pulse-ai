export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

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
  items?: InvoiceItem[];
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionRecord {
  id: string;
  invoiceId?: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'completed' | 'pending' | 'failed';
  reference: string;
  paymentMethod: string;
  currency?: string;
  provider?: string;
  providerTransactionId?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
}

export interface PayPalOrderRecord {
  orderId: string;
  invoiceId: string;
  amount: number;
  currency: string;
  createdAt?: string;
}

export interface ProcessedWebhookEventRecord {
  eventId: string;
  eventType: string;
  processedAt?: string;
}

export interface SettlementResult {
  invoice: InvoiceRecord;
  transaction: TransactionRecord;
}

