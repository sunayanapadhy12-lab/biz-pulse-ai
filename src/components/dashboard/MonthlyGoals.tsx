import type { FC } from 'react';
import { Target, Sparkles } from 'lucide-react';
import type { MonthlyGoalData } from '../../types';

interface MonthlyGoalsProps {
  goalData: MonthlyGoalData;
  onOpenAgent?: () => void;
}

export const MonthlyGoals: FC<MonthlyGoalsProps> = ({ goalData, onOpenAgent }) => {
  const revenuePercent = Math.min(
    100,
    Math.round((goalData.revenueCurrent / goalData.revenueTarget) * 100)
  );
  const expensePercent = Math.min(
    100,
    Math.round((goalData.expenseCurrent / goalData.expenseLimit) * 100)
  );

  const revenueShortfall = goalData.revenueTarget - goalData.revenueCurrent;
  const expenseRemaining = goalData.expenseLimit - goalData.expenseCurrent;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Monthly Financial Targets
              </h3>
              <p className="text-[11px] text-slate-400">
                {goalData.daysRemainingInMonth} days remaining in November cycle
              </p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
            {revenuePercent}% of Goal
          </span>
        </div>

        {/* 2 Targets: Revenue & Expense */}
        <div className="mt-4 space-y-4">
          {/* Revenue Target */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline text-xs">
              <span className="font-semibold text-slate-800">
                Gross Revenue Milestone ($140k Target)
              </span>
              <span className="font-bold text-indigo-700">
                ${goalData.revenueCurrent.toLocaleString()} / ${goalData.revenueTarget.toLocaleString()}
              </span>
            </div>

            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${revenuePercent}%` }}
                className="h-full bg-indigo-600 rounded-full transition-all duration-700"
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{revenuePercent}% Achieved</span>
              <span>${revenueShortfall.toLocaleString()} remaining to target</span>
            </div>
          </div>

          {/* Expense Limit */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline text-xs">
              <span className="font-semibold text-slate-800">
                Monthly Operating Expense Budget ($70k Ceiling)
              </span>
              <span className="font-bold text-slate-700">
                ${goalData.expenseCurrent.toLocaleString()} / ${goalData.expenseLimit.toLocaleString()}
              </span>
            </div>

            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${expensePercent}%` }}
                className={`h-full rounded-full transition-all duration-700 ${
                  expensePercent > 90 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{expensePercent}% Budget Utilized</span>
              <span className="text-emerald-600 font-semibold">
                ${expenseRemaining.toLocaleString()} safe buffer
              </span>
            </div>
          </div>
        </div>

        {/* AI-Generated Nudge */}
        <div className="mt-4 p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100/80 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-indigo-900 block mb-0.5">AI Smart Nudge</span>
            <p className="text-indigo-800 leading-relaxed">{goalData.aiNudge}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500">Auto-adjust targets quarterly</span>
        <button
          onClick={onOpenAgent}
          className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors flex items-center gap-1"
        >
          Model Goal Scenarios &rarr;
        </button>
      </div>
    </div>
  );
};
