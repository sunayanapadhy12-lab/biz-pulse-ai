import type { FC } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Package,
  ArrowRight,
} from 'lucide-react';
import type { AiInsight } from '../../types';

interface AiInsightsProps {
  insights: AiInsight[];
  onActionClick: (insight: AiInsight) => void;
}

export const AiInsights: FC<AiInsightsProps> = ({ insights, onActionClick }) => {
  const getIconAndColor = (type: AiInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return {
          icon: Lightbulb,
          color: 'text-amber-600',
          bg: 'bg-amber-50 border-amber-100',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/60',
        };
      case 'risk':
        return {
          icon: AlertTriangle,
          color: 'text-rose-600',
          bg: 'bg-rose-50 border-rose-100',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/60',
        };
      case 'recommendation':
        return {
          icon: Sparkles,
          color: 'text-indigo-600',
          bg: 'bg-indigo-50 border-indigo-100',
          badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
        };
      case 'trend':
        return {
          icon: TrendingUp,
          color: 'text-sky-600',
          bg: 'bg-sky-50 border-sky-100',
          badgeClass: 'bg-sky-50 text-sky-700 border-sky-200/60',
        };
      case 'inventory':
        return {
          icon: Package,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50 border-emerald-100',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              AI Strategic Insights & Opportunities
            </h3>
            <p className="text-xs text-slate-500">Autonomous analysis of your financial health & supply chain</p>
          </div>
        </div>

        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
          5 Insights Generated
        </span>
      </div>

      {/* Grid of Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {insights.map((insight) => {
          const { icon: Icon, color, bg, badgeClass } = getIconAndColor(insight.type);

          return (
            <div
              key={insight.id}
              className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-slate-50/90 transition-all flex flex-col justify-between group hover:border-slate-300"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeClass}`}>
                    {insight.badge}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {insight.title}
                </h4>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {insight.description}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800">
                  {insight.impact}
                </span>

                <button
                  onClick={() => onActionClick(insight)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  {insight.actionText}
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
