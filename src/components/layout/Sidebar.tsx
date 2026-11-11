import type { FC, ComponentType } from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Receipt,
  Bot,
  Sparkles,
  BellRing,
  Package,
  CreditCard,
  Eye,
  TrendingUp,
  Cpu,
  UserCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  X,
} from 'lucide-react';
import type { NavigationTab, UserProfile } from '../../types';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  user: UserProfile;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: 'indigo' | 'emerald' | 'amber';
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'invoices', label: 'Invoices', icon: Receipt },
  { id: 'ai-payment-agent', label: 'AI Payment Agent', icon: Bot, badge: 'AI', badgeVariant: 'indigo' },
  { id: 'payment-insights', label: 'Payment Insights', icon: Sparkles },
  { id: 'payment-reminders', label: 'Payment Reminders', icon: BellRing, badge: '2 Due', badgeVariant: 'amber' },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'credit-debt', label: 'Credit & Debt', icon: CreditCard },
  { id: 'watchlist', label: 'Watchlist', icon: Eye },
  { id: 'market-pulse', label: 'Market Pulse', icon: TrendingUp },
  { id: 'ai-business-agents', label: 'AI Business Agents', icon: Cpu, badge: '4 Active', badgeVariant: 'emerald' },
  { id: 'profile', label: 'My Profile', icon: UserCheck },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  user,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-slate-200/80 flex flex-col transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Brand / Logo Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-base tracking-tight truncate">
                    Biz Pulse
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-sm border border-indigo-100">
                    AI
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 truncate">
                  Finance Intelligence
                </span>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg lg:hidden"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-indigo-50/80 text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-r-md" />
                )}

                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />

                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          item.badgeVariant === 'emerald'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                            : item.badgeVariant === 'amber'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200/50'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* User Card & Collapse toggle at bottom */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/60 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {user.avatarInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user.businessName}</p>
                </div>
              </div>

              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs"
                title={`${user.name} (${user.businessName})`}
              >
                {user.avatarInitials}
              </div>
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
