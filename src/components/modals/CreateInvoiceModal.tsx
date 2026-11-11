import { useState, type FC, type FormEvent } from 'react';
import { Modal } from '../common/Modal';
import type { Invoice, InvoiceItem } from '../../types';
import { Plus, Trash2, Mail, User, Loader2 } from 'lucide-react';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveInvoice: (invoice: Invoice) => Promise<boolean> | void;
  nextInvoiceNumber?: string;
}

export const CreateInvoiceModal: FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSaveInvoice,
  nextInvoiceNumber = 'INV-2026-089',
}) => {
  const [customer, setCustomer] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(nextInvoiceNumber);
  const [dueDate, setDueDate] = useState('2026-11-24');
  const [status, setStatus] = useState<Invoice['status']>('pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 'item-1', description: 'Artisan Pastry Box Delivery & Corporate Catering', quantity: 2, unitPrice: 750 },
  ]);

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!customer.trim() || isSubmitting) return;

    setSubmitError('');
    const total = calculateTotal();
    const finalAmount = total > 0 ? total : 100;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNumber.trim() || nextInvoiceNumber,
      customer: customer.trim(),
      customerEmail: customerEmail.trim() || 'billing@clientcorp.com',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate,
      amount: finalAmount,
      currency: 'USD',
      status: status,
      items: items,
    };

    setIsSubmitting(true);
    try {
      const success = await onSaveInvoice(newInvoice);
      if (success !== false) {
        onClose();
        // Reset form
        setCustomer('');
        setCustomerEmail('');
        setItems([
          { id: 'item-1', description: 'Artisan Pastry Box Delivery & Corporate Catering', quantity: 2, unitPrice: 750 },
        ]);
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'Invoice registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Invoice"
      subtitle="Generate professional branded invoice with automated payment links"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Customer details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer / Company Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="e.g. Acme Tech Labs"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Billing Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="accounts@acmetech.com"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-100"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Invoice # & Due date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Invoice Reference #
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Invoice['status'])}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            >
              <option value="pending">Pending (Awaiting Payment)</option>
              <option value="draft">Draft (Unsent)</option>
              <option value="paid">Mark as Paid</option>
            </select>
          </div>
        </div>

        {/* Line Items Section */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Line Items
            </span>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Item description..."
                  value={item.description}
                  onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none text-center"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Price"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                  className="w-24 px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none text-right"
                />
                <span className="w-20 text-xs font-bold text-slate-800 text-right">
                  ${((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice Summary calculation */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Total Invoiced Amount</span>
          <span className="text-base font-extrabold text-slate-900">
            ${calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {submitError && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {submitError}
          </div>
        )}

        {/* Action buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm shadow-indigo-200 disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Registering with Backend...
              </>
            ) : (
              'Create & Dispatch Invoice'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
