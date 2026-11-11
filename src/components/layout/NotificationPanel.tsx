import { useEffect, useRef, type FC } from 'react';
import { CheckCheck, Bell, AlertCircle, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import type { NotificationItem, NavigationTab } from '../../types';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onSelectNotification: (tab?: NavigationTab) => void;
}

export const NotificationPanel: FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectNotification,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-13 w-84 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600" />
          <h4 className="text-sm font-semibold text-slate-900">Notifications</h4>
          {unreadCount > 0 && (
            <span className="text-[11px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Body List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No new notifications
          </div>
        ) : (
          notifications.map((item) => {
            const isAlert = item.type === 'alert' || item.type === 'warning';
            const isSuccess = item.type === 'success';

            return (
              <div
                key={item.id}
                onClick={() => {
                  onSelectNotification(item.targetTab);
                  onClose();
                }}
                className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                  !item.read ? 'bg-indigo-50/30' : ''
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isAlert && <AlertCircle className="w-4 h-4 text-amber-500" />}
                  {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  {!isAlert && !isSuccess && <Info className="w-4 h-4 text-indigo-500" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs font-semibold ${!item.read ? 'text-slate-900' : 'text-slate-700'}`}>
                      {item.title}
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.message}</p>
                  {item.targetTab && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 font-medium mt-1.5 hover:underline">
                      View details <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 text-center">
        <span className="text-[11px] text-slate-400">
          Connected to Biz Pulse AI Live Stream
        </span>
      </div>
    </div>
  );
};
