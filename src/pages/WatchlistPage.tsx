import type { FC } from 'react';
import type { WatchlistItem } from '../types';
import { Badge } from '../components/common/Badge';
import { Eye, ArrowRight } from 'lucide-react';

interface WatchlistPageProps {
  watchlist: WatchlistItem[];
  onInvestigateItem: (item: WatchlistItem) => void;
}

export const WatchlistPage: FC<WatchlistPageProps> = ({
  watchlist,
  onInvestigateItem,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 mb-1 text-indigo-600">
          <Eye className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Early Warning Radar</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Financial & Operational Watchlist
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Automated radar tracking high-exposure debtors, volatile supplier pricing, and sector benchmarks.
        </p>
      </div>

      {/* Watchlist Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {watchlist.map((item) => {
          const isUrgent = item.flagLevel === 'urgent';
          const isWatch = item.flagLevel === 'watch';

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all bg-white flex flex-col justify-between shadow-2xs hover:shadow-md ${isUrgent
                ? 'border-rose-200 ring-1 ring-rose-100'
                : isWatch
                  ? 'border-amber-200 ring-1 ring-amber-100'
                  : 'border-slate-200/80'
                }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {item.type}
                  </span>

                  <Badge
                    variant={isUrgent ? 'danger' : isWatch ? 'warning' : 'neutral'}
                    size="sm"
                    dot
                  >
                    {isUrgent ? 'Action Required' : isWatch ? 'Monitoring' : 'Stable'}
                  </Badge>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                <p className="text-xs font-semibold text-slate-700 mt-1">{item.metric}</p>

                <div className="my-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    Current Metric Reading
                  </span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">
                    {item.value}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{item.note}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onInvestigateItem(item)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                >
                  Deep Dive Analysis <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
