import { useEffect, useRef, type FC } from 'react';
import { User, Settings, CreditCard, HelpCircle, LogOut, ShieldCheck } from 'lucide-react';
import type { UserProfile, NavigationTab } from '../../types';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onNavigate: (tab: NavigationTab) => void;
  onLogout: () => void;
}

export const ProfileDropdown: FC<ProfileDropdownProps> = ({
  isOpen,
  onClose,
  user,
  onNavigate,
  onLogout,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-13 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/80 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header Profile preview */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-indigo-200 shrink-0">
            {user.avatarInitials}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 truncate">{user.name}</h4>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60">
          <span className="text-slate-600 font-medium truncate">{user.businessName}</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 shrink-0">
            <ShieldCheck className="w-3 h-3 text-indigo-600" />
            PRO
          </span>
        </div>
      </div>

      {/* Menu links */}
      <div className="p-1.5 text-xs">
        <button
          onClick={() => {
            onNavigate('profile');
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
        >
          <User className="w-4 h-4 text-slate-400" />
          <span>My Profile & Business Details</span>
        </button>

        <button
          onClick={() => {
            onNavigate('settings');
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Workspace Settings</span>
        </button>

        <button
          onClick={() => {
            onNavigate('credit-debt');
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
        >
          <CreditCard className="w-4 h-4 text-slate-400" />
          <span>Payment Methods & Billing</span>
        </button>

        <a
          href="#help"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('ai-business-agents');
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Ask AI Financial Support</span>
        </a>

        <div className="my-1 border-t border-slate-100" />

        <button
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
