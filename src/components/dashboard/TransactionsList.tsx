import { useState, type FC } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  ArrowRight,
} from 'lucide-react';
import type { Transaction } from '../../types';
import { Badge } from '../common/Badge';

interface TransactionsListProps {
  transactions: Transaction[];
  onViewAll: () => void;
  onSelectTransaction?: (tx: Transaction) => void;
}

export const TransactionsList: FC<TransactionsListProps> = ({
  transactions,
  onViewAll,
  onSelectTransaction,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [localSearch, setLocalSearch] = useState('');

  const filtered = transactions.filter((tx) => {
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesSearch =
      tx.name.toLowerCase().includes(localSearch.toLowerCase()) ||
      tx.category.toLowerCase().includes(localSearch.toLowerCase()) ||
      tx.reference.toLowerCase().includes(localSearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Recent Transactions
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated bank feed and manual transaction logs
          </p>
        </div>

        <button
          onClick={onViewAll}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors self-start sm:self-auto"
        >
          View full ledger
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-3">
        {/* Type pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterType === 'all'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterType === 'income'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterType === 'expense'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Expenses
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Filter list..."
            className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* List / Table */}
      <div className="overflow-x-auto -mx-5 sm:mx-0">
        <table className="w-full text-left border-collapse min-w-[540px]">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 px-3">Transaction</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No transactions found matching your criteria.
                </td>
              </tr>
            ) : (
              filtered.slice(0, 5).map((tx) => {
                const isIncome = tx.type === 'income';

                return (
                  <tr
                    key={tx.id}
                    onClick={() => onSelectTransaction && onSelectTransaction(tx)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : 'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                            {tx.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {tx.reference} • {tx.paymentMethod}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {tx.category}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {tx.date}
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap font-bold">
                      <span className={isIncome ? 'text-emerald-600' : 'text-slate-800'}>
                        {isIncome ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      {tx.status === 'completed' && (
                        <Badge variant="success" size="sm" dot>
                          Completed
                        </Badge>
                      )}
                      {tx.status === 'pending' && (
                        <Badge variant="warning" size="sm" dot>
                          Pending
                        </Badge>
                      )}
                      {tx.status === 'failed' && (
                        <Badge variant="danger" size="sm" dot>
                          Failed
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
