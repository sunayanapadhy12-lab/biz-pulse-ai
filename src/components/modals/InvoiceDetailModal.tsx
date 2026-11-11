import type { FC } from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import type { Invoice } from '../../types';
import { Printer, Send, CheckCircle2, Copy, Building, Mail, CreditCard } from 'lucide-react';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSendReminder: (invoice: Invoice) => void;
  onMarkAsPaid: (invoiceId: string) => void;
  onCopyLink: (invoiceNumber: string) => void;
  onOpenPayPalPayment?: (invoice: Invoice) => void;
}

export const InvoiceDetailModal: FC<InvoiceDetailModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSendReminder,
  onMarkAsPaid,
  onCopyLink,
  onOpenPayPalPayment,
}) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const items = invoice.items && invoice.items.length > 0 ? invoice.items : [
    { id: '1', description: 'Artisan Pastry & Specialty Coffee Catering Services', quantity: 1, unitPrice: invoice.amount }
  ];

  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const tax = Math.round(subtotal * 0.085 * 100) / 100;
  const total = subtotal + tax;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoice ${invoice.invoiceNumber}`}
      subtitle={`Billing details for ${invoice.customer}`}
      maxWidth="xl"
    >
      <div className="space-y-6 print:p-0">
        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-slate-900 tracking-tight">
                  Pulse Gourmet Foods & Cafe
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100">
                  LLC
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">450 Mission Street, Suite 300</p>
              <p className="text-xs text-slate-500">San Francisco, CA 94105 • billing@pulsecafe.com</p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs font-mono font-bold text-slate-500 block">
                {invoice.invoiceNumber}
              </span>
              <div className="mt-1">
                {invoice.status === 'paid' && (
                  <Badge variant="success" size="sm" dot>
                    Paid in Full
                  </Badge>
                )}
                {invoice.status === 'pending' && (
                  <Badge variant="warning" size="sm" dot>
                    Awaiting Payment
                  </Badge>
                )}
                {invoice.status === 'overdue' && (
                  <Badge variant="danger" size="sm" dot>
                    Overdue
                  </Badge>
                )}
                {invoice.status === 'draft' && (
                  <Badge variant="neutral" size="sm" dot>
                    Draft
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Billed To & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Billed To
              </span>
              <p className="font-bold text-slate-900 text-sm">{invoice.customer}</p>
              <p className="text-slate-500 mt-0.5 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {invoice.customerEmail}
              </p>
              <p className="text-slate-500 flex items-center gap-1 mt-0.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                Corporate Client Account
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <div>
                <span className="text-slate-400">Issue Date: </span>
                <strong className="text-slate-700">{invoice.issueDate}</strong>
              </div>
              <div>
                <span className="text-slate-400">Due Date: </span>
                <strong className={invoice.status === 'overdue' ? 'text-rose-600 font-bold' : 'text-slate-900'}>
                  {invoice.dueDate}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">Terms: </span>
                <span className="text-slate-700 font-medium">Net 14 Days</span>
              </div>
            </div>
          </div>

          {/* Line items table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase">
                  <th className="py-2.5 px-2">Description</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-2 text-right">Unit Price</th>
                  <th className="py-2.5 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 px-2 font-medium text-slate-800">{item.description}</td>
                    <td className="py-2.5 px-2 text-center text-slate-600">{item.quantity}</td>
                    <td className="py-2.5 px-2 text-right text-slate-600">${item.unitPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-2 text-right font-bold text-slate-900">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Tax (8.5%):</span>
                <span className="font-semibold text-slate-800">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Total Due:</span>
                <span className="text-indigo-700 font-black">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Settlement Wire Instructions */}
          <div className="p-3 bg-white rounded-xl border border-slate-200/70 text-[11px] text-slate-500 space-y-1">
            <span className="font-bold text-slate-700 block">Electronic Payment Routing:</span>
            <p>First Republic Bank • Routing: 121000358 • Account: 4892019482 (Pulse Gourmet Foods LLC)</p>
          </div>
        </div>

        {/* Action Buttons (Excluded from print) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              Print / Save PDF
            </button>
            <button
              onClick={() => onCopyLink(invoice.invoiceNumber)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              Copy Payment Link
            </button>
          </div>

          <div className="flex items-center gap-2">
            {invoice.status !== 'paid' && onOpenPayPalPayment && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPayPalPayment(invoice);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-xs transition-colors"
                title="Settle invoice with PayPal Sandbox"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Pay with PayPal
              </button>
            )}

            {invoice.status !== 'paid' && (
              <button
                onClick={() => {
                  onMarkAsPaid(invoice.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-xl transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark as Paid
              </button>
            )}

            {invoice.status !== 'paid' && (
              <button
                onClick={() => {
                  onSendReminder(invoice);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-white" />
                Send 1-Click Reminder
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

