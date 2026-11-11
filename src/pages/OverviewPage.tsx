import type { FC } from 'react';
import type {
  AiInsight,
  BizScoreBreakdown,
  BusinessAgent,
  Invoice,
  KpiMetric,
  MonthlyGoalData,
  PaymentReminder,
  Transaction,
  UserProfile,
} from '../types';
import { WelcomeBanner } from '../components/dashboard/WelcomeBanner';
import { KpiCard } from '../components/dashboard/KpiCard';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { CashFlowCard } from '../components/dashboard/CashFlowCard';
import { TransactionsList } from '../components/dashboard/TransactionsList';
import { InvoiceOverview } from '../components/dashboard/InvoiceOverview';
import { PaymentReminders } from '../components/dashboard/PaymentReminders';
import { AiInsights } from '../components/dashboard/AiInsights';
import { BizScoreCard } from '../components/dashboard/BizScoreCard';
import { MonthlyGoals } from '../components/dashboard/MonthlyGoals';
import { BusinessAgents } from '../components/dashboard/BusinessAgents';

interface OverviewPageProps {
  user: UserProfile;
  kpis: KpiMetric[];
  transactions: Transaction[];
  invoices: Invoice[];
  reminders: PaymentReminder[];
  insights: AiInsight[];
  bizScore: BizScoreBreakdown;
  monthlyGoal: MonthlyGoalData;
  agents: BusinessAgent[];
  onCreateInvoice: () => void;
  onRecordTransaction: () => void;
  onOpenAgent: (agent?: BusinessAgent | string) => void;
  onViewAllTransactions: () => void;
  onViewAllInvoices: () => void;
  onSendReminder: (reminder: PaymentReminder | Invoice) => void;
  onApplyInsight: (insight: AiInsight) => void;
}

export const OverviewPage: FC<OverviewPageProps> = ({
  user,
  kpis,
  transactions,
  invoices,
  reminders,
  insights,
  bizScore,
  monthlyGoal,
  agents,
  onCreateInvoice,
  onRecordTransaction,
  onOpenAgent,
  onViewAllTransactions,
  onViewAllInvoices,
  onSendReminder,
  onApplyInsight,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Welcome Section */}
      <WelcomeBanner
        user={user}
        onCreateInvoice={onCreateInvoice}
        onRecordTransaction={onRecordTransaction}
        onOpenAgent={onOpenAgent}
      />

      {/* 2. KPI Cards Row (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <KpiCard key={idx} metric={kpi} />
        ))}
      </div>

      {/* 3. Analytics & Cash Flow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue and Expense Velocity Chart (2 cols) */}
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>

        {/* Cash Flow & Liquidity Card (1 col) */}
        <div className="lg:col-span-1">
          <CashFlowCard onOpenAgent={() => onOpenAgent('cfo-agent')} />
        </div>
      </div>

      {/* 4. Transactions & Invoices Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions List with search & type filter */}
        <TransactionsList
          transactions={transactions}
          onViewAll={onViewAllTransactions}
        />

        {/* Invoice Collection Pipeline */}
        <InvoiceOverview
          invoices={invoices}
          onViewAllInvoices={onViewAllInvoices}
          onSendReminder={(inv) => onSendReminder(inv)}
        />
      </div>

      {/* 5. Payment Reminders & Monthly Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentReminders
          reminders={reminders}
          onTriggerReminder={(rem) => onSendReminder(rem)}
          onViewAll={() => onOpenAgent('cfo-agent')}
        />

        <MonthlyGoals
          goalData={monthlyGoal}
          onOpenAgent={() => onOpenAgent('growth-agent')}
        />
      </div>

      {/* 6. Biz Score & AI Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <BizScoreCard
            scoreData={bizScore}
            onExploreScore={() => onOpenAgent('cfo-agent')}
          />
        </div>

        <div className="lg:col-span-2">
          <AiInsights
            insights={insights}
            onActionClick={onApplyInsight}
          />
        </div>
      </div>

      {/* 7. AI Business Agents Row (4 Agents) */}
      <BusinessAgents
        agents={agents}
        onAskAgent={(agent) => onOpenAgent(agent)}
        onViewAllAgents={() => onOpenAgent()}
      />
    </div>
  );
};
