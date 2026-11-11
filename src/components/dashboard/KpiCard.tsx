import type { FC } from 'react';
import {
  DollarSign,
  CreditCard,
  Wallet,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import type { KpiMetric } from '../../types';

interface KpiCardProps {
  metric: KpiMetric;
}

export const KpiCard: FC<KpiCardProps> = ({ metric }) => {
  const getIconConfig = () => {
    switch (metric.type) {
      case 'revenue':
        return {
          icon: DollarSign,
          color: 'text-indigo-600',
          bg: 'bg-indigo-50 border-indigo-100',
        };
      case 'expenses':
        return {
          icon: CreditCard,
          color: 'text-sky-600',
          bg: 'bg-sky-50 border-sky-100',
        };
      case 'profit':
        return {
          icon: Wallet,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50 border-emerald-100',
        };
      case 'outstanding':
        return {
          icon: Clock,
          color: 'text-amber-600',
          bg: 'bg-amber-50 border-amber-100',
        };
    }
  };

  const { icon: Icon, color, bg } = getIconConfig();
  const isPositiveGrowth = metric.percentageChange > 0;
  // For expenses & outstanding, a negative percentage change is actually good (saving / decreasing debt)
  const isHealthy =
    metric.type === 'expenses' || metric.type === 'outstanding'
      ? metric.percentageChange <= 0
      : metric.percentageChange >= 0;

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(metric.amount);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {metric.title}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${bg}`}>
          <Icon className={`w-4.5 h-4.5 ${color}`} />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold text-slate-900 tracking-tight">
          {formattedAmount}
        </div>

        <div className="mt-2.5 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-md ${isHealthy
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}
          >
            {isPositiveGrowth ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {Math.abs(metric.percentageChange)}%
          </span>
          <span className="text-xs text-slate-400 font-normal">
            {metric.comparisonText}
          </span>
        </div>
      </div>
    </div>
  );
};
