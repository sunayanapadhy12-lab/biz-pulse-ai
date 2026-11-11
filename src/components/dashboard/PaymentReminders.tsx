import type { FC } from 'react';
import { BellRing, Send, Mail } from 'lucide-react';
import type { PaymentReminder } from '../../types';

interface PaymentRemindersProps {
  reminders: PaymentReminder[];
  onTriggerReminder: (reminder: PaymentReminder) => void;
  onViewAll?: () => void;
}

export const PaymentReminders: FC<PaymentRemindersProps> = ({
  reminders,
  onTriggerReminder,
  onViewAll,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Payment Reminders & Escalations
              </h3>
              <p className="text-[11px] text-slate-400">AI-scheduled recovery reminders</p>
            </div>
          </div>

          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
            {reminders.length} Active
          </span>
        </div>

        {/* Reminders List */}
        <div className="mt-4 space-y-3">
          {reminders.map((reminder) => {
            const isOverdue = reminder.status === 'overdue';

            return (
              <div
                key={reminder.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isOverdue
                    ? 'bg-rose-50/40 border-rose-200/70'
                    : 'bg-slate-50/70 border-slate-200/70'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {reminder.customer}
                      </p>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isOverdue
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}
                      >
                        {reminder.daysLabel}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1">
                      {reminder.invoiceNumber} • Due <strong className="text-slate-700">{reminder.dueDate}</strong>
                    </p>

                    {reminder.lastRemindedDate && (
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Last notified: {reminder.lastRemindedDate}
                      </p>
                    )}
                  </div>

                  {/* Amount & Action Button */}
                  <div className="text-right shrink-0">
                    <span className="text-sm font-extrabold text-slate-900 block">
                      ${reminder.amount.toLocaleString()}
                    </span>

                    <button
                      onClick={() => onTriggerReminder(reminder)}
                      className={`mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all shadow-2xs ${
                        isOverdue
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      <Send className="w-3 h-3" />
                      <span>{isOverdue ? 'Escalate' : 'Send'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer prompt */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500">Autonomous WhatsApp & Email cadence</span>
        <span className="text-indigo-600 font-semibold cursor-pointer hover:underline" onClick={onViewAll}>
          Configure Cadence &rarr;
        </span>
      </div>
    </div>
  );
};
