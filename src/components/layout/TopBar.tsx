import { useState, type FC } from 'react';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  Plus,
} from 'lucide-react';
import type { NavigationTab, UserProfile, NotificationItem } from '../../types';
import { NotificationPanel } from './NotificationPanel';
import { ProfileDropdown } from './ProfileDropdown';

interface TopBarProps {
  activeTab: NavigationTab;
  onOpenMobileSidebar: () => void;
  user: UserProfile;
  notifications: NotificationItem[];
  onMarkAllNotificationsRead: () => void;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenCreateInvoice: () => void;
  onOpenRecordTransaction: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLogout: () => void;
}

const pageTitles: Record<NavigationTab, { title: string; subtitle: string }> = {
  overview: { title: 'Business Overview', subtitle: 'Real-time financial telemetry & AI guidance' },
  transactions: { title: 'Transactions Ledger', subtitle: 'Income, operating expenses, and banking flows' },
  invoices: { title: 'Invoice Management', subtitle: 'B2B billing, collections, and aging analysis' },
  'ai-payment-agent': { title: 'AI Payment Agent', subtitle: 'Automated collections and reconciliation' },
  'payment-insights': { title: 'Payment Insights', subtitle: 'Deep pattern analytics and DSO trends' },
  'payment-reminders': { title: 'Payment Reminders', subtitle: 'Scheduled reminders & overdue escalations' },
  inventory: { title: 'Inventory & Stock', subtitle: 'Ingredient levels, margins, and stockout alerts' },
  'credit-debt': { title: 'Credit & Debt Management', subtitle: 'Lines of credit, vendor terms, and payback cycles' },
  watchlist: { title: 'Financial Watchlist', subtitle: 'Key accounts, high-risk receivables & benchmarks' },
  'market-pulse': { title: 'Market Pulse', subtitle: 'Commodity prices, local benchmarks & economic indices' },
  'ai-business-agents': { title: 'AI Business Agents', subtitle: 'Specialized autonomous agents for your company' },
  profile: { title: 'Company & Founder Profile', subtitle: 'Pulse Gourmet Foods & Cafe credentials' },
  settings: { title: 'System Settings', subtitle: 'Preferences, notifications, and security' },
};

export const TopBar: FC<TopBarProps> = ({
  activeTab,
  onOpenMobileSidebar,
  user,
  notifications,
  onMarkAllNotificationsRead,
  onSelectTab,
  onOpenCreateInvoice,
  onOpenRecordTransaction,
  searchQuery,
  onSearchChange,
  onLogout,
}) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const currentInfo = pageTitles[activeTab] || {
    title: 'Biz Pulse AI',
    subtitle: 'Financial Intelligence',
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-18 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
            {currentInfo.title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block truncate">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search transactions, clients, invoices, agents..."
            className="w-full pl-9 pr-14 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-xl border border-slate-200/80 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 font-mono shadow-2xs pointer-events-none">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Right: Quick actions, notifications, user menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick Action Buttons */}
        <div className="hidden xl:flex items-center gap-2">
          <button
            onClick={onOpenRecordTransaction}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            Record Transaction
          </button>
          <button
            onClick={onOpenCreateInvoice}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            Create Invoice
          </button>
        </div>

        {/* Live Sync Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-100/80 text-[11px] font-medium text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Sync</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              setIsProfileOpen(false);
            }}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Open notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full" />
            )}
          </button>

          <NotificationPanel
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            notifications={notifications}
            onMarkAllAsRead={onMarkAllNotificationsRead}
            onSelectNotification={(tab) => {
              if (tab) onSelectTab(tab);
            }}
          />
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationOpen(false);
            }}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200/60"
            aria-label="User profile menu"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              {user.avatarInitials}
            </div>

            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                Pulse Cafe Ltd
              </p>
            </div>

            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          <ProfileDropdown
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            user={user}
            onNavigate={onSelectTab}
            onLogout={onLogout}
          />
        </div>
      </div>
    </header>
  );
};
