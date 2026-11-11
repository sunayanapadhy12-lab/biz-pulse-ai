import type { FC } from 'react';
import type { PaymentReminder } from '../types';
import { BellRing, Send } from 'lucide-react';

interface PaymentRemindersPageProps {
  reminders: PaymentReminder[];
  onTriggerReminder: (reminder: PaymentReminder) => void;
  onToggleAutoSend: (id: string) => void;
}

export const PaymentRemindersPage: FC<PaymentRemindersPageProps> = ({
  reminders,
  onTriggerReminder,
  onToggleAutoSend,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-amber-600">
            <BellRing className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Automated Cadence</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Scheduled Payment Reminders
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Proactive pre-due date nudges and overdue escalation sequences.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Auto-Cadence Running
          </span>
        </div>
      </div>

      {/* Reminders List Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
          Active Invoices in Reminder Sequence ({reminders.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase">
                <th className="py-2.5 px-3">Customer Entity</th>
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3">Due Date & Stage</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">Auto-Send</th>
                <th className="py-2.5 px-3 text-right">Instant Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reminders.map((rem) => {
                const isOverdue = rem.status === 'overdue';

                return (
                  <tr key={rem.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-slate-900">{rem.customer}</p>
                      <p className="text-[11px] text-slate-400">{rem.customerEmail}</p>
                    </td>

                    <td className="py-3.5 px-3 font-mono font-medium text-slate-700">
                      {rem.invoiceNumber}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            isOverdue
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {rem.daysLabel}
                        </span>
                        <span className="text-slate-400 text-[11px]">{rem.dueDate}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                      ${rem.amount.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => onToggleAutoSend(rem.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                          rem.autoSendEnabled
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {rem.autoSendEnabled ? 'Enabled' : 'Paused'}
                      </button>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => onTriggerReminder(rem)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-xl shadow-2xs transition-colors ${
                          isOverdue
                            ? 'bg-rose-600 hover:bg-rose-700'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        <Send className="w-3 h-3" />
                        {isOverdue ? 'Escalate Notice' : 'Send Reminder'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
