import type { FC } from 'react';
import type { CreditDebtItem } from '../types';
import { CreditCard, Sparkles } from 'lucide-react';

interface CreditDebtPageProps {
  creditItems: CreditDebtItem[];
  onConsolidateDebt: () => void;
}

export const CreditDebtPage: FC<CreditDebtPageProps> = ({
  creditItems,
  onConsolidateDebt,
}) => {
  const totalBalance = creditItems.reduce((acc, c) => acc + c.remainingBalance, 0);
  const totalMonthlyServicing = creditItems.reduce((acc, c) => acc + c.monthlyPayment, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 mb-1 text-indigo-600">
          <CreditCard className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Capital & Liabilities</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Credit Facilities & Debt Service
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Active business lines of credit, equipment leases, and trade supplier financing terms.
        </p>
      </div>

      {/* Summary KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Total Outstanding Principal</span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            ${totalBalance.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400">Across 3 credit facilities</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Monthly Debt Service Cost</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">
            ${totalMonthlyServicing.toLocaleString()}/mo
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Debt-to-income ratio: 4.0%</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Weighted Average Interest</span>
          <p className="text-2xl font-black text-slate-900 mt-1">5.4% APR</p>
          <span className="text-[11px] text-slate-400">Prime-minus benchmark</span>
        </div>
      </div>

      {/* Credit Facilities Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
          Active Credit Facilities & Vendor Terms
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase">
                <th className="py-2.5 px-3">Lender / Facility</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 text-right">Credit Limit</th>
                <th className="py-2.5 px-3 text-right">Balance Due</th>
                <th className="py-2.5 px-3 text-right">Rate (APR)</th>
                <th className="py-2.5 px-3 text-right">Monthly Payment</th>
                <th className="py-2.5 px-3">Next Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {creditItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-slate-900">{item.creditor}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 capitalize font-medium text-[11px]">
                      {item.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right text-slate-600">
                    ${item.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                    ${item.remainingBalance.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right font-semibold text-indigo-700">
                    {item.interestRate}%
                  </td>
                  <td className="py-3.5 px-3 text-right text-slate-800">
                    ${item.monthlyPayment.toLocaleString()}/mo
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                    {item.nextDueDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Recommendation Box */}
      <div className="p-5 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-indigo-900 text-sm block">CFO Debt Restructuring Advice</span>
            <p className="text-indigo-800 mt-0.5">
              Refinancing the equipment lease into your primary 6.8% line will eliminate monthly paperwork overhead and free up $340 in working capital.
            </p>
          </div>
        </div>
        <button
          onClick={onConsolidateDebt}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shrink-0 shadow-xs"
        >
          Model Refinancing
        </button>
      </div>
    </div>
  );
};
