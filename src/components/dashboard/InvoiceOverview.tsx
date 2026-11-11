import type { FC } from 'react';
import type { Invoice } from '../../types';
import { Badge } from '../common/Badge';
import { Receipt, Send, CheckCircle2, AlertCircle, Clock, ArrowRight } from 'lucide-react';

interface InvoiceOverviewProps {
  invoices: Invoice[];
  onViewAllInvoices: () => void;
  onSendReminder: (invoice: Invoice) => void;
}

export const InvoiceOverview: FC<InvoiceOverviewProps> = ({
  invoices,
  onViewAllInvoices,
  onSendReminder,
}) => {
  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const paidInvoices = invoices.filter((i) => i.status === 'paid');
  const pendingInvoices = invoices.filter((i) => i.status === 'pending');
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue');

  const totalPaid = paidInvoices.reduce((acc, inv) => acc + inv.amount, 0);
  const totalPending = pendingInvoices.reduce((acc, inv) => acc + inv.amount, 0);
  const totalOverdue = overdueInvoices.reduce((acc, inv) => acc + inv.amount, 0);

  const collectionRate = totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0;
  const pendingRate = totalInvoiced > 0 ? Math.round((totalPending / totalInvoiced) * 100) : 0;
  const overdueRate = totalInvoiced > 0 ? Math.round((totalOverdue / totalInvoiced) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 border border-sky-100">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Invoice Collection Pipeline
              </h3>
              <p className="text-[11px] text-slate-400">Aging receivables & payment cycles</p>
            </div>
          </div>

          <button
            onClick={onViewAllInvoices}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
          >
            All Invoices <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2.5 my-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mb-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Paid
            </div>
            <p className="text-sm font-bold text-slate-900">
              ${totalPaid.toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-400">{collectionRate}% of total</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1 text-[11px] text-amber-700 font-semibold mb-0.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Pending
            </div>
            <p className="text-sm font-bold text-slate-900">
              ${totalPending.toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-400">{pendingRate}% of total</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1 text-[11px] text-rose-700 font-semibold mb-0.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              Overdue
            </div>
            <p className="text-sm font-bold text-rose-600">
              ${totalOverdue.toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-400">{overdueRate}% of total</span>
          </div>
        </div>

        {/* Multi-segmented Collection Progress Bar */}
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-600">Collection Recovery Rate</span>
            <span className="font-bold text-indigo-700">{collectionRate}% Paid</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${collectionRate}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Paid: ${collectionRate}%`}
            />
            <div
              style={{ width: `${pendingRate}%` }}
              className="bg-amber-400 transition-all duration-500"
              title={`Pending: ${pendingRate}%`}
            />
            <div
              style={{ width: `${overdueRate}%` }}
              className="bg-rose-500 transition-all duration-500"
              title={`Overdue: ${overdueRate}%`}
            />
          </div>
        </div>

        {/* Recent Invoices Mini-List */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Key Accounts Requiring Attention
          </span>

          <div className="divide-y divide-slate-100">
            {invoices.slice(0, 3).map((inv) => (
              <div
                key={inv.id}
                className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/60 rounded-lg px-1 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{inv.customer}</p>
                  <p className="text-[11px] text-slate-400">
                    {inv.invoiceNumber} • Due {inv.dueDate}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="font-bold text-slate-900">
                    ${inv.amount.toLocaleString()}
                  </span>

                  {inv.status === 'paid' && (
                    <Badge variant="success" size="sm">
                      Paid
                    </Badge>
                  )}
                  {inv.status === 'pending' && (
                    <Badge variant="warning" size="sm">
                      Pending
                    </Badge>
                  )}
                  {inv.status === 'overdue' && (
                    <button
                      onClick={() => onSendReminder(inv)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-semibold border border-rose-200 hover:bg-rose-100 transition-colors"
                      title="Send automated 1-click reminder"
                    >
                      <Send className="w-3 h-3" />
                      Remind
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Average Days Sales Outstanding (DSO)</span>
        <span className="font-bold text-slate-800">22.4 Days</span>
      </div>
    </div>
  );
};
