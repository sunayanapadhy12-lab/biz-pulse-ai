import { useState, type FC } from 'react';
import type { Invoice } from '../types';
import { Badge } from '../components/common/Badge';
import {
  Plus,
  Search,
  Send,
  CheckCircle2,
  Copy,
  CreditCard,
} from 'lucide-react';

interface InvoicesPageProps {
  invoices: Invoice[];
  onOpenCreateInvoice: () => void;
  onSendReminder: (invoice: Invoice) => void;
  onMarkAsPaid: (invoiceId: string) => void;
  onCopyInvoiceLink: (invoiceNumber: string) => void;
  onOpenPayPalPayment?: (invoice: Invoice) => void;
}

export const InvoicesPage: FC<InvoicesPageProps> = ({
  invoices,
  onOpenCreateInvoice,
  onSendReminder,
  onMarkAsPaid,
  onCopyInvoiceLink,
  onOpenPayPalPayment,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesSearch =
      inv.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const totalPending = invoices.filter((i) => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
  const totalOverdue = invoices.filter((i) => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* 4 Mini KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Total Billed</span>
          <p className="text-xl font-bold text-slate-900 mt-1">
            ${totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-400">{invoices.length} total invoices</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Collected Revenue</span>
          <p className="text-xl font-bold text-emerald-600 mt-1">
            ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">
            {totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0}% recovery rate
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Awaiting Settlement</span>
          <p className="text-xl font-bold text-amber-600 mt-1">
            ${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-400">Within payment terms</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Overdue Receivables</span>
          <p className="text-xl font-bold text-rose-600 mt-1">
            ${totalOverdue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-rose-600 font-medium">Action recommended</span>
        </div>
      </div>

      {/* Main Invoices Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client, invoice #, email..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {['all', 'paid', 'pending', 'overdue'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                    statusFilter === status
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <button
              onClick={onOpenCreateInvoice}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              New Invoice
            </button>
          </div>
        </div>

        {/* Invoices List */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Invoice #</th>
                <th className="py-3 px-3">Customer Entity</th>
                <th className="py-3 px-3">Issue Date</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No invoices found matching current filter.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-800">
                      {inv.invoiceNumber}
                    </td>

                    <td className="py-3.5 px-3">
                      <div>
                        <p className="font-semibold text-slate-900">{inv.customer}</p>
                        <p className="text-[11px] text-slate-400">{inv.customerEmail}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                      {inv.issueDate}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={
                          inv.status === 'overdue'
                            ? 'text-rose-600 font-semibold'
                            : 'text-slate-600'
                        }
                      >
                        {inv.dueDate}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                      ${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      {inv.status === 'paid' && (
                        <Badge variant="success" size="sm" dot>
                          Paid
                        </Badge>
                      )}
                      {inv.status === 'pending' && (
                        <Badge variant="warning" size="sm" dot>
                          Pending
                        </Badge>
                      )}
                      {inv.status === 'overdue' && (
                        <Badge variant="danger" size="sm" dot>
                          Overdue
                        </Badge>
                      )}
                      {inv.status === 'draft' && (
                        <Badge variant="neutral" size="sm" dot>
                          Draft
                        </Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.status !== 'paid' && onOpenPayPalPayment && (
                          <button
                            onClick={() => onOpenPayPalPayment(inv)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 rounded-lg transition-colors shadow-2xs"
                            title="Settle with PayPal Sandbox"
                          >
                            <CreditCard className="w-3 h-3" />
                            PayPal
                          </button>
                        )}

                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => onSendReminder(inv)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200/60"
                            title="Send payment reminder"
                          >
                            <Send className="w-3 h-3" />
                            Remind
                          </button>
                        )}

                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => onMarkAsPaid(inv.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200/60"
                            title="Mark invoice as paid"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Paid
                          </button>
                        )}

                        <button
                          onClick={() => onCopyInvoiceLink(inv.invoiceNumber)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Copy shareable payment link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
