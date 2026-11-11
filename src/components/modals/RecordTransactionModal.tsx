import { useState, type FC, type FormEvent } from 'react';
import { Modal } from '../common/Modal';
import type { Transaction } from '../../types';
import { DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface RecordTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTransaction: (tx: Transaction) => void;
}

const expenseCategories = [
  'Raw Materials',
  'Inventory',
  'Packaging',
  'Utilities',
  'Payroll & Wages',
  'Logistics & Delivery',
  'Marketing & Ads',
  'Equipment & Maintenance',
  'Software Subscriptions',
];

const incomeCategories = [
  'Corporate Sales',
  'Catering Services',
  'Retail Store Sales',
  'Subscription Sales',
  'Consulting & Workshops',
  'Wholesale Distribution',
];

export const RecordTransactionModal: FC<RecordTransactionModalProps> = ({
  isOpen,
  onClose,
  onSaveTransaction,
}) => {
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Corporate Sales');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer (ACH)');
  const [status, setStatus] = useState<Transaction['status']>('completed');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!name.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      name: name.trim(),
      category: category,
      date: 'Today, Just now',
      amount: parsedAmount,
      type: type,
      status: status,
      reference: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      paymentMethod: paymentMethod,
    };

    onSaveTransaction(newTx);
    onClose();

    // Reset
    setName('');
    setAmount('');
  };

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Transaction"
      subtitle="Log direct income receipt or business operational expense"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle: Income vs Expense */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategory('Corporate Sales');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
              type === 'income'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
            Income / Inflow
          </button>
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setCategory('Raw Materials');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
              type === 'expense'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
            Expense / Outflow
          </button>
        </div>

        {/* Transaction Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description / Entity Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              type === 'income'
                ? 'e.g. Apex Studio - Catering Deposit'
                : 'e.g. Artisan Flour Mills - Bulk Grain Order'
            }
            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Amount (USD) *
          </label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-semibold bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Category & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            >
              <option value="Bank Transfer (ACH)">Bank Transfer (ACH)</option>
              <option value="Corporate Visa">Corporate Visa</option>
              <option value="Corporate Mastercard">Corporate Mastercard</option>
              <option value="Direct Deposit">Direct Deposit</option>
              <option value="Wire Transfer">Wire Transfer</option>
              <option value="Petty Cash">Petty Cash</option>
            </select>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Settlement Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Transaction['status'])}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
          >
            <option value="completed">Completed (Settled)</option>
            <option value="pending">Pending Clearing</option>
            <option value="failed">Flagged / Failed</option>
          </select>
        </div>

        {/* Action buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-5 py-2 text-xs font-semibold text-white rounded-xl transition-all shadow-sm ${
              type === 'income'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            }`}
          >
            Save Transaction
          </button>
        </div>
      </form>
    </Modal>
  );
};
