import { useState, useEffect } from 'react';
import type {
  AiInsight,
  BusinessAgent,
  InventoryItem,
  Invoice,
  NavigationTab,
  NotificationItem,
  PaymentReminder,
  Transaction,
  UserProfile,
  WatchlistItem,
} from './types';
import {
  aiInsights,
  bizScoreData,
  businessAgents,
  currentUser,
  demoCreditDebt,
  demoInventory,
  demoWatchlist,
  initialInvoices,
  initialReminders,
  initialTransactions,
  kpiMetrics,
  monthlyGoalData,
  notificationsList,
} from './data/demoData';

// Layout components
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';

// Common components
import { ToastContainer, type ToastMessage } from './components/common/Toast';

// Modals
import { CreateInvoiceModal } from './components/modals/CreateInvoiceModal';
import { RecordTransactionModal } from './components/modals/RecordTransactionModal';
import { AgentChatModal } from './components/modals/AgentChatModal';
import { PayPalPaymentModal } from './components/modals/PayPalPaymentModal';

// Pages
import { OverviewPage } from './pages/OverviewPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { AiPaymentAgentPage } from './pages/AiPaymentAgentPage';
import { PaymentInsightsPage } from './pages/PaymentInsightsPage';
import { PaymentRemindersPage } from './pages/PaymentRemindersPage';
import { InventoryPage } from './pages/InventoryPage';
import { CreditDebtPage } from './pages/CreditDebtPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { MarketPulsePage } from './pages/MarketPulsePage';
import { AiBusinessAgentsPage } from './pages/AiBusinessAgentsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  // Navigation & Layout State
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Business Data State
  const [user, setUser] = useState<UserProfile>(currentUser);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [reminders, setReminders] = useState<PaymentReminder[]>(initialReminders);
  const [inventory, setInventory] = useState<InventoryItem[]>(demoInventory);
  const [notifications, setNotifications] = useState<NotificationItem[]>(notificationsList);
  const [creditDebt] = useState(demoCreditDebt);
  const [watchlist] = useState<WatchlistItem[]>(demoWatchlist);

  // Modals State
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isRecordTxOpen, setIsRecordTxOpen] = useState(false);
  const [isAgentChatOpen, setIsAgentChatOpen] = useState(false);
  const [selectedAgentForChat, setSelectedAgentForChat] = useState<BusinessAgent>(businessAgents[0]);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [isPayPalModalOpen, setIsPayPalModalOpen] = useState(false);

  // Toast System State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Safe initial synchronization of local invoices with backend repository
  useEffect(() => {
    const syncInvoicesWithBackend = async () => {
      try {
        const response = await fetch('/api/invoices/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoices: initialInvoices }),
        });
        if (response.ok) {
          const res = await response.json();
          console.log('[Backend Invoice Sync]', res);
        }
      } catch (err) {
        console.warn('[Backend Invoice Sync Notice] Backend server not reachable yet:', err);
      }
    };
    syncInvoicesWithBackend();
  }, []);

  const showToast = (title: string, message?: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, title, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Agent Chat Trigger
  const handleOpenAgent = (agentOrId?: BusinessAgent | string) => {
    if (typeof agentOrId === 'string') {
      const match = businessAgents.find((a) => a.id === agentOrId);
      if (match) setSelectedAgentForChat(match);
    } else if (agentOrId) {
      setSelectedAgentForChat(agentOrId);
    }
    setIsAgentChatOpen(true);
  };

  // Open PayPal Payment Checkout Modal
  const handleOpenPayPalPayment = (invoice: Invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setIsPayPalModalOpen(true);
  };

  // PayPal verified payment success callback (only called after backend verification!)
  const handlePayPalVerifiedSuccess = (updatedInvoice: Invoice, newTransaction?: Transaction) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv))
    );

    if (newTransaction) {
      setTransactions((prev) => [newTransaction, ...prev]);
    }

    setReminders((prev) =>
      prev.filter((rem) => rem.invoiceNumber !== updatedInvoice.invoiceNumber)
    );

    showToast(
      'PayPal Settlement Verified',
      `Payment of $${updatedInvoice.amount.toLocaleString()} for Invoice #${updatedInvoice.invoiceNumber} verified and credited to general ledger.`
    );
  };

  // Add new Invoice and register with backend repository
  const handleSaveInvoice = async (newInvoice: Invoice): Promise<boolean> => {
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to register invoice with backend');
      }

      const registeredInvoice: Invoice = data.invoice || newInvoice;
      setInvoices((prev) => [registeredInvoice, ...prev]);

      showToast(
        'Invoice Created & Synchronized',
        `Invoice #${registeredInvoice.invoiceNumber} for ${registeredInvoice.customer} ($${registeredInvoice.amount.toLocaleString()}) registered in backend repository.`
      );
      return true;
    } catch (err: any) {
      console.error('[Invoice Registration Error]', err);
      showToast(
        'Invoice Registration Failed',
        err.message || 'Could not synchronize invoice with backend server.',
        'error'
      );
      return false;
    }
  };

  // Add new Transaction
  const handleSaveTransaction = (newTx: Transaction) => {
    setTransactions([newTx, ...transactions]);
    showToast(
      'Transaction Recorded',
      `${newTx.type === 'income' ? 'Received' : 'Paid'} $${newTx.amount.toLocaleString()} - ${newTx.name}`
    );
  };

  // Send Reminder Action
  const handleSendReminder = (target: PaymentReminder | Invoice) => {
    const customer = 'customer' in target ? target.customer : '';
    const invoiceNumber = 'invoiceNumber' in target ? target.invoiceNumber : '';
    showToast(
      'Payment Reminder Dispatched',
      `Sent email & WhatsApp 1-click payment link to ${customer} for invoice ${invoiceNumber}.`
    );
  };

  // Mark invoice as paid
  const handleMarkAsPaid = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: 'paid' } : inv))
    );
    showToast('Invoice Updated', 'Invoice has been marked as fully settled.');
  };

  // Copy invoice link
  const handleCopyInvoiceLink = (invoiceNum: string) => {
    showToast(
      'Payment Link Copied',
      `Direct settlement link for ${invoiceNum} copied to your clipboard.`,
      'info'
    );
  };

  // Apply AI Insight
  const handleApplyInsight = (insight: AiInsight) => {
    if (insight.type === 'opportunity') {
      showToast(
        'Early Payment Scheduled',
        'Packaging invoice scheduled for Net-10 payment. $1,420 cash discount captured.'
      );
    } else if (insight.type === 'risk') {
      showToast(
        'Dunning Sequence Activated',
        'AI Payment Agent dispatched polite payment reminders to overdue accounts.'
      );
    } else if (insight.type === 'inventory') {
      showToast(
        'Replenishment Drafted',
        'Inventory purchase order drafted for Arabica beans & oat milk.'
      );
    } else {
      handleOpenAgent('growth-agent');
    }
  };

  // Run dry run simulation
  const handleRunDunningScan = () => {
    showToast(
      'Dunning Scan Completed',
      'AI Payment Agent scanned 6 invoices. 2 upcoming reminders dispatched without manual intervention.'
    );
  };

  // Export CSV
   
  // Export CSV
  const handleExportCsv = () => {
    try {
      const headers = [
        'Transaction ID',
        'Name',
        'Category',
        'Date',
        'Amount',
        'Type',
        'Status',
        'Reference',
        'Payment Method',
        'PayPal Capture ID',
      ];

      const escapeCsv = (value: string | number | undefined) => {
        const text = String(value ?? '');
        return `"${text.replace(/"/g, '""')}"`;
      };

      const rows = transactions.map((tx) => [
        tx.id,
        tx.name,
        tx.category,
        tx.date,
        tx.amount,
        tx.type,
        tx.status,
        tx.reference,
        tx.paymentMethod,
        tx.paypalCaptureId ?? '',
      ]);

      const csvContent = [
        headers.map(escapeCsv).join(','),
        ...rows.map((row) => row.map(escapeCsv).join(',')),
      ].join('\r\n');

      const blob = new Blob(['\uFEFF', csvContent], {
        type: 'text/csv;charset=utf-8;',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'Biz-Pulse-Transactions.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.setTimeout(() => URL.revokeObjectURL(url), 1000);

      showToast(
        'Ledger Exported',
        `Successfully downloaded ${transactions.length} transactions to CSV.`
      );
    } catch (error) {
      console.error('CSV export failed:', error);
      showToast('Export Failed', 'Unable to download the transaction CSV.');
    }
  };

   
 // Toggle Reminder Auto-Send
  const handleToggleAutoSend = (id: string) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, autoSendEnabled: !r.autoSendEnabled } : r
      )
    );
    showToast('Reminder Preference Updated', 'Autonomous dunning rule changed.');
  };

  // Draft Inventory PO
  const handleDraftPo = (item: InventoryItem) => {
    setInventory((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, stock: i.stock + 50, status: 'in-stock' } : i))
    );
    showToast(
      'Purchase Order Fulfilled',
      `Auto-drafted PO for 50 units of ${item.name} ($${(item.costPrice * 50).toLocaleString()}). Stock status updated to In Stock.`
    );
  };

  // Mark all notifications read
  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Notifications Marked Read', 'All alerts cleared from drawer.', 'info');
  };

  // Save profile
  const handleSaveProfile = (updated: UserProfile) => {
    setUser(updated);
    showToast('Profile Saved', 'Company credentials and contact information updated.');
  };

  // Save Settings
  const handleSaveSettings = () => {
    showToast('Settings Saved', 'Workspace preferences and reporting parameters updated.');
  };

  // Logout demo
  const handleLogout = () => {
    showToast('Signed Out (Demo)', 'To protect your session, please log in again.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] flex flex-col antialiased">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Collapsible / Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        user={user}
      />

      {/* Main Content Area: dynamically adjusted for sidebar width */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Navigation Bar */}
        <TopBar
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          user={user}
          notifications={notifications}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onSelectTab={setActiveTab}
          onOpenCreateInvoice={() => setIsCreateInvoiceOpen(true)}
          onOpenRecordTransaction={() => setIsRecordTxOpen(true)}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          onLogout={handleLogout}
        />

        {/* Dynamic Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewPage
              user={user}
              kpis={kpiMetrics}
              transactions={transactions}
              invoices={invoices}
              reminders={reminders}
              insights={aiInsights}
              bizScore={bizScoreData}
              monthlyGoal={monthlyGoalData}
              agents={businessAgents}
              onCreateInvoice={() => setIsCreateInvoiceOpen(true)}
              onRecordTransaction={() => setIsRecordTxOpen(true)}
              onOpenAgent={handleOpenAgent}
              onViewAllTransactions={() => setActiveTab('transactions')}
              onViewAllInvoices={() => setActiveTab('invoices')}
              onSendReminder={handleSendReminder}
              onApplyInsight={handleApplyInsight}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsPage
              transactions={transactions}
              onOpenRecordTransaction={() => setIsRecordTxOpen(true)}
              onExportCsv={handleExportCsv}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoicesPage
              invoices={invoices}
              onOpenCreateInvoice={() => setIsCreateInvoiceOpen(true)}
              onSendReminder={handleSendReminder}
              onMarkAsPaid={handleMarkAsPaid}
              onCopyInvoiceLink={handleCopyInvoiceLink}
              onOpenPayPalPayment={handleOpenPayPalPayment}
            />
          )}

          {activeTab === 'ai-payment-agent' && (
            <AiPaymentAgentPage onRunSimulation={handleRunDunningScan} />
          )}

          {activeTab === 'payment-insights' && <PaymentInsightsPage />}

          {activeTab === 'payment-reminders' && (
            <PaymentRemindersPage
              reminders={reminders}
              onTriggerReminder={handleSendReminder}
              onToggleAutoSend={handleToggleAutoSend}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryPage
              inventory={inventory}
              onDraftPurchaseOrder={handleDraftPo}
            />
          )}

          {activeTab === 'credit-debt' && (
            <CreditDebtPage
              creditItems={creditDebt}
              onConsolidateDebt={() => handleOpenAgent('cfo-agent')}
            />
          )}

          {activeTab === 'watchlist' && (
            <WatchlistPage
              watchlist={watchlist}
              onInvestigateItem={() => handleOpenAgent('cfo-agent')}
            />
          )}

          {activeTab === 'market-pulse' && <MarketPulsePage />}

          {activeTab === 'ai-business-agents' && (
            <AiBusinessAgentsPage
              agents={businessAgents}
              onOpenAgent={handleOpenAgent}
            />
          )}

          {activeTab === 'profile' && (
            <ProfilePage user={user} onSaveProfile={handleSaveProfile} />
          )}

          {activeTab === 'settings' && (
            <SettingsPage onSaveSettings={handleSaveSettings} />
          )}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <CreateInvoiceModal
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
        onSaveInvoice={handleSaveInvoice}
        nextInvoiceNumber={`INV-2026-0${89 + invoices.length - 6}`}
      />

      <RecordTransactionModal
        isOpen={isRecordTxOpen}
        onClose={() => setIsRecordTxOpen(false)}
        onSaveTransaction={handleSaveTransaction}
      />

      <AgentChatModal
        isOpen={isAgentChatOpen}
        onClose={() => setIsAgentChatOpen(false)}
        initialAgent={selectedAgentForChat}
        allAgents={businessAgents}
      />

      <PayPalPaymentModal
        isOpen={isPayPalModalOpen}
        onClose={() => setIsPayPalModalOpen(false)}
        invoice={selectedInvoiceForPayment}
        onPaymentSuccess={handlePayPalVerifiedSuccess}
      />
    </div>
  );
}

export default App;
