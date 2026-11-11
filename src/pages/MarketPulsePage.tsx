import type { FC } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const MarketPulsePage: FC = () => {
  const commodities = [
    { name: 'Arabica Coffee Futures (KC)', price: '$2.18 / lb', change: -3.2, trend: 'down', impact: 'Favorable roasting margin' },
    { name: 'Organic Whole Dairy Milk', price: '$4.12 / gal', change: +1.4, trend: 'up', impact: 'Slight beverage cost pressure' },
    { name: 'Artisan Pastry Flour (T55)', price: '$0.84 / kg', change: +0.2, trend: 'stable', impact: 'Stable baking raw costs' },
    { name: 'Recycled Kraft Pulp (Packaging)', price: '$820 / ton', change: -4.8, trend: 'down', impact: 'Packaging savings window' },
  ];

  const localCafeBenchmarks = [
    { item: 'Oat Flat White (12oz)', localAvg: '$5.95', pulsePrice: '$5.75', variance: '-3.4%', note: 'Room for $0.30 price lift' },
    { item: 'Specialty Pourover (Single Origin)', localAvg: '$6.50', pulsePrice: '$6.50', variance: '0.0%', note: 'Optimal parity' },
    { item: 'Artisan Almond Croissant', localAvg: '$4.75', pulsePrice: '$4.95', variance: '+4.2%', note: 'Premium brand tolerance high' },
    { item: 'Cold Brew 16oz Can', localAvg: '$5.25', pulsePrice: '$5.00', variance: '-4.8%', note: 'Fastest moving retail SKU' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 mb-1 text-sky-600">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">External Market Telemetry</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Market Pulse & Commodity Intelligence
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time agricultural commodity price swings, regional inflation benchmarks, and competitor price positioning.
        </p>
      </div>

      {/* Commodity Prices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {commodities.map((c, i) => {
          const isUp = c.trend === 'up';
          return (
            <div key={i} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">{c.name}</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{c.price}</p>
              <div className="mt-2 flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-md ${
                    isUp
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {Math.abs(c.change)}%
                </span>
                <span className="text-[10px] text-slate-400">{c.impact}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Competitor Price Benchmark Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Regional District Competitor Benchmark (Downtown SF / SoMa)
            </h3>
            <p className="text-xs text-slate-500">Survey of 18 specialty cafes within a 2-mile radius</p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            Updated Yesterday
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase">
                <th className="py-2.5 px-3">Menu Offering</th>
                <th className="py-2.5 px-3 text-right">District Avg Price</th>
                <th className="py-2.5 px-3 text-right">Pulse Cafe Price</th>
                <th className="py-2.5 px-3 text-right">Variance</th>
                <th className="py-2.5 px-3">Strategic AI Opportunity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {localCafeBenchmarks.map((bench, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-slate-900">{bench.item}</td>
                  <td className="py-3.5 px-3 text-right text-slate-600">{bench.localAvg}</td>
                  <td className="py-3.5 px-3 text-right font-bold text-indigo-700">{bench.pulsePrice}</td>
                  <td className="py-3.5 px-3 text-right font-semibold text-slate-700">{bench.variance}</td>
                  <td className="py-3.5 px-3 text-slate-600">{bench.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
