import { useState, type FC } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { ChartDataPoint, TimeRange } from '../../types';
import { chartData7d, chartData30d, chartData12m } from '../../data/demoData';
import { ArrowUpRight } from 'lucide-react';

interface RevenueChartProps {
  onPeriodChange?: (range: TimeRange) => void;
}

const formatCurrency = (val: number) => {
  if (val >= 1000) {
    return `$${(val / 1000).toFixed(0)}k`;
  }
  return `$${val}`;
};

// Custom Recharts Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const revenue = payload.find((p: any) => p.dataKey === 'revenue')?.value || 0;
    const expenses = payload.find((p: any) => p.dataKey === 'expenses')?.value || 0;
    const profit = revenue - expenses;

    return (
      <div className="bg-white/95 backdrop-blur-xs p-3.5 rounded-xl shadow-lg border border-slate-200 text-xs">
        <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1">
          {label}
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-indigo-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              Revenue:
            </span>
            <span className="font-bold text-slate-900">${revenue.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-rose-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Expenses:
            </span>
            <span className="font-bold text-slate-900">${expenses.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100">
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              Net Profit:
            </span>
            <span className="font-bold text-emerald-700">${profit.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const RevenueChart: FC<RevenueChartProps> = ({ onPeriodChange }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const getChartData = (): ChartDataPoint[] => {
    switch (timeRange) {
      case '7d':
        return chartData7d;
      case '30d':
        return chartData30d;
      case '12m':
        return chartData12m;
    }
  };

  const handleRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    if (onPeriodChange) onPeriodChange(range);
  };

  const currentData = getChartData();

  // Calculate totals for currently selected period
  const totalRevenue = currentData.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalExpenses = currentData.reduce((acc, curr) => acc + curr.expenses, 0);
  const netMargin = Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 100);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col">
      {/* Header with Title and Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Revenue & Expense Velocity
            </h3>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <ArrowUpRight className="w-3 h-3" />
              {netMargin}% Margin
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time cash generation compared against operational burn rate
          </p>
        </div>

        {/* Time period switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => handleRangeChange('7d')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              timeRange === '7d'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => handleRangeChange('30d')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              timeRange === '30d'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => handleRangeChange('12m')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              timeRange === '12m'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            12 Months
          </button>
        </div>
      </div>

      {/* Analytics KPI mini pills */}
      <div className="grid grid-cols-3 gap-3 py-4 text-xs">
        <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
          <span className="text-slate-500 text-[11px] font-medium">Period Revenue</span>
          <p className="text-base font-bold text-slate-900 mt-0.5">
            ${totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
          <span className="text-slate-500 text-[11px] font-medium">Period Expenses</span>
          <p className="text-base font-bold text-slate-900 mt-0.5">
            ${totalExpenses.toLocaleString()}
          </p>
        </div>
        <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/70">
          <span className="text-emerald-800 text-[11px] font-medium">Net Surplus</span>
          <p className="text-base font-bold text-emerald-700 mt-0.5">
            +${(totalRevenue - totalExpenses).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Chart container */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={currentData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
            />
            <Area
              type="monotone"
              name="Revenue"
              dataKey="revenue"
              stroke="#4F46E5"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#revenueGradient)"
            />
            <Area
              type="monotone"
              name="Expenses"
              dataKey="expenses"
              stroke="#EF4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#expenseGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
