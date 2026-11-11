import type { FC } from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import type { Transaction } from '../../types';
import { ArrowDownLeft, ArrowUpRight, Copy, CheckCircle2, Trash2 } from 'lucide-react';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onCopyReference: (ref: string) => void;
  onDeleteTransaction?: (id: string) => void;
}

export const TransactionDetailModal: FC<TransactionDetailModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onCopyReference,
  onDeleteTransaction,
}) => {
  if (!transaction) return null;

  const isIncome = transaction.type === 'income';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Receipt & Audit Log"
      subtitle={`Reference ${transaction.reference}`}
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Top Amount Banner */}
        <div
          className={`p-5 rounded-2xl border flex items-center justify-between ${
            isIncome
              ? 'bg-emerald-50/60 border-emerald-200/80'
              : 'bg-rose-50/60 border-rose-200/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                isIncome
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-rose-600 text-white shadow-xs'
              }`}
            >
              {isIncome ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {isIncome ? 'Credit / Inflow Amount' : 'Debit / Outflow Amount'}
              </span>
              <p
                className={`text-2xl font-black tracking-tight ${
                  isIncome ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {isIncome ? '+' : '-'}${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div>
            {transaction.status === 'completed' && (
              <Badge variant="success" size="md" dot>
                Settled
              </Badge>
            )}
            {transaction.status === 'pending' && (
              <Badge variant="warning" size="md" dot>
                Clearing
              </Badge>
            )}
            {transaction.status === 'failed' && (
              <Badge variant="danger" size="md" dot>
                Flagged
              </Badge>
            )}
          </div>
        </div>

        {/* Transaction Metadata Grid */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Payee / Description</span>
            <span className="font-bold text-slate-900 text-right max-w-xs truncate">{transaction.name}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Accounting Category</span>
            <span className="inline-block px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-semibold text-[11px]">
              {transaction.category}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Timestamp</span>
            <span className="font-semibold text-slate-800">{transaction.date}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Settlement Rail</span>
            <span className="font-semibold text-slate-800">{transaction.paymentMethod}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Audit Reference</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
              <span>{transaction.reference}</span>
              <button
                onClick={() => onCopyReference(transaction.reference)}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                title="Copy reference code"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Ledger Reconciliation Tag */}
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            General Ledger Status: Reconciled & Synced
          </span>
          <span className="text-slate-400 font-mono">GL-8910</span>
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          {onDeleteTransaction ? (
            <button
              onClick={() => {
                onDeleteTransaction(transaction.id);
                onClose();
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Void Entry
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </Modal>
  );
};

