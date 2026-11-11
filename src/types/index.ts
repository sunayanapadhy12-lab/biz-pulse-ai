export type NavigationTab =
  | 'overview'
  | 'transactions'
  | 'invoices'
  | 'ai-payment-agent'
  | 'payment-insights'
  | 'payment-reminders'
  | 'inventory'
  | 'credit-debt'
  | 'watchlist'
  | 'market-pulse'
  | 'ai-business-agents'
  | 'profile'
  | 'settings';

export type TimeRange = '7d' | '30d' | '12m';

export interface ChartDataPoint {
  date: string;
  revenue: number;
  expenses: number;
  netProfit: number;
}

export interface KpiMetric {
  title: string;
  amount: number;
  currency: string;
  percentageChange: number;
  comparisonText: string;
  isPositive: boolean;
  type: 'revenue' | 'expenses' | 'profit' | 'outstanding';
}

export interface Transaction {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'completed' | 'pending' | 'failed';
  reference: string;
  paymentMethod: string;
  paypalCaptureId?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  customerEmail: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  currency?: string;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  items?: InvoiceItem[];
  paypalOrderId?: string;
  paypalCaptureId?: string;
}

export interface PaymentReminder {
  id: string;
  customer: string;
  customerEmail: string;
  invoiceNumber: string;
  dueDate: string;
  amount: number;
  status: 'upcoming' | 'overdue';
  daysLabel: string;
  lastRemindedDate?: string;
  autoSendEnabled: boolean;
}

export interface AiInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'recommendation' | 'trend' | 'inventory';
  title: string;
  description: string;
  impact: string;
  badge: string;
  actionText: string;
  actionCategory: 'apply' | 'explore' | 'dismiss';
}

export interface BizScoreBreakdown {
  score: number;
  status: string;
  profitabilityScore: number;
  cashFlowScore: number;
  debtRatioScore: number;
  goalProgressScore: number;
  recommendation: string;
}

export interface MonthlyGoalData {
  revenueTarget: number;
  revenueCurrent: number;
  expenseLimit: number;
  expenseCurrent: number;
  daysRemainingInMonth: number;
  aiNudge: string;
}

export interface BusinessAgent {
  id: string;
  name: string;
  shortRole: string;
  description: string;
  capabilities: string[];
  sampleQuestions: string[];
  status: 'active' | 'learning' | 'ready';
  accentColor: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  targetTab?: NavigationTab;
}

export interface UserProfile {
  name: string;
  role: string;
  businessName: string;
  industry: string;
  email: string;
  phone: string;
  currency: string;
  plan: string;
  avatarInitials: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  reorderLevel: number;
  costPrice: number;
  sellingPrice: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

export interface CreditDebtItem {
  id: string;
  creditor: string;
  type: 'credit_line' | 'term_loan' | 'vendor_credit' | 'equipment_lease';
  totalAmount: number;
  remainingBalance: number;
  interestRate: number;
  monthlyPayment: number;
  nextDueDate: string;
  status: 'current' | 'grace_period' | 'warning';
}

export interface WatchlistItem {
  id: string;
  name: string;
  type: 'client' | 'supplier' | 'competitor' | 'benchmark';
  metric: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  note: string;
  flagLevel: 'normal' | 'watch' | 'urgent';
}

