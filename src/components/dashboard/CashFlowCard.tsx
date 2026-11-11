import type { FC } from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet, Sparkles } from 'lucide-react';

interface CashFlowCardProps {
  onOpenAgent?: () => void;
}

export const CashFlowCard: FC<CashFlowCardProps> = ({ onOpenAgent }) => {
  const availableBalance = 84930.5;
  const monthlyInflow = 128450.0;
  const monthlyOutflow = 64280.0;
  const netCashFlow = monthlyInflow - monthlyOutflow;
  const runwayMonths = 14.8;
  const inflowRatio = Math.round((monthlyInflow / (monthlyInflow + monthlyOutflow)) * 100);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Cash Liquidity & Runway
              </h3>
              <p className="text-[11px] text-slate-400">Available bank balances & burn buffer</p>
            </div>
          </div>

          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Healthy
          </span>
        </div>

        {/* Available Balance Big Display */}
        <div className="mt-4">
          <span className="text-xs font-medium text-slate-500">Total Liquid Reserves</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-slate-500">USD</span>
          </div>
        </div>

        {/* Inflow vs Outflow comparison meters */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              Inflow: <strong className="text-slate-900">${monthlyInflow.toLocaleString()}</strong>
            </span>
            <span className="text-slate-600 font-medium flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
              Outflow: <strong className="text-slate-900">${monthlyOutflow.toLocaleString()}</strong>
            </span>
          </div>

          {/* Segmented ratio bar */}
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${inflowRatio}%` }}
              className="bg-emerald-500 rounded-l-full transition-all duration-500"
              title={`Inflow ${inflowRatio}%`}
            />
            <div
              style={{ width: `${100 - inflowRatio}%` }}
              className="bg-rose-400 rounded-r-full transition-all duration-500"
              title={`Outflow ${100 - inflowRatio}%`}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{inflowRatio}% Inflow Ratio</span>
            <span className="text-emerald-600 font-semibold">+${netCashFlow.toLocaleString()} Net Buffer</span>
          </div>
        </div>

        {/* Runway & Forecast summary box */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Estimated Zero-Revenue Runway</span>
            <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
              {runwayMonths} Months
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-800">Forecast:</strong> Next 30 days project a net positive surplus of <span className="font-semibold text-emerald-600">+$14,200</span> driven by confirmed recurring catering contracts and stable utility obligations.
          </p>
        </div>
      </div>

      {/* Footer prompt */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          Model stress-test scenarios
        </span>
        <button
          onClick={onOpenAgent}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Run AI Stress Test &rarr;
        </button>
      </div>
    </div>
  );
};
