import type { FC } from 'react';
import { Award, ArrowRight, ShieldCheck } from 'lucide-react';
import type { BizScoreBreakdown } from '../../types';

interface BizScoreCardProps {
  scoreData: BizScoreBreakdown;
  onExploreScore?: () => void;
}

export const BizScoreCard: FC<BizScoreCardProps> = ({ scoreData, onExploreScore }) => {
  // Circular gauge math
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scoreData.score / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Biz Score™ Financial Index
              </h3>
              <p className="text-[11px] text-slate-400">Algorithmic credit & operating rating</p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
            Top 15%
          </span>
        </div>

        {/* Circular Indicator & Status */}
        <div className="mt-4 flex items-center gap-5">
          {/* Circular SVG Gauge */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-slate-100"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Progress stroke */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-indigo-600 transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            {/* Centered score text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-slate-900 leading-none">
                {scoreData.score}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">/ 100</span>
            </div>
          </div>

          <div className="min-w-0">
            <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {scoreData.status}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Calculated across operating margin, debt coverage ratio, receivable liquidity, and seasonal resilience.
            </p>
          </div>
        </div>

        {/* 4 Pillars Breakdown Meters */}
        <div className="mt-5 space-y-2.5">
          {/* Profitability */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">Profitability Margin</span>
              <span className="font-bold text-slate-900">{scoreData.profitabilityScore}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${scoreData.profitabilityScore}%` }}
                className="h-full bg-indigo-600 rounded-full"
              />
            </div>
          </div>

          {/* Cash Flow */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">Cash Flow Velocity</span>
              <span className="font-bold text-slate-900">{scoreData.cashFlowScore}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${scoreData.cashFlowScore}%` }}
                className="h-full bg-sky-500 rounded-full"
              />
            </div>
          </div>

          {/* Debt Ratio */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">Debt Service Coverage</span>
              <span className="font-bold text-slate-900">{scoreData.debtRatioScore}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${scoreData.debtRatioScore}%` }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
          </div>

          {/* Goal Progress */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">Monthly Goal Pace</span>
              <span className="font-bold text-slate-900">{scoreData.goalProgressScore}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${scoreData.goalProgressScore}%` }}
                className="h-full bg-amber-500 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* AI Recommendation callout */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-900">AI Recommendation:</strong> {scoreData.recommendation}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500">Benchmark vs Local Food & Bev</span>
        <button
          onClick={onExploreScore}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
        >
          View Full Audit <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
