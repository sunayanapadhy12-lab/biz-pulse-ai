import type { FC } from 'react';
import { Sparkles } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const PaymentInsightsPage: FC = () => {
  const agingBuckets = [
    { label: 'Current (0-30 Days)', amount: 41380, count: 6, percentage: 89.5, color: 'bg-emerald-500' },
    { label: '31-60 Days', amount: 3200, count: 1, percentage: 6.9, color: 'bg-amber-400' },
    { label: '61-90 Days', amount: 1620, count: 1, percentage: 3.6, color: 'bg-rose-500' },
    { label: '90+ Days (Severe)', amount: 0, count: 0, percentage: 0.0, color: 'bg-slate-300' },
  ];

  const topClientsReliability = [
    { name: 'Horizon Tech Hub', score: 98, avgPayDays: '6 days', status: 'Excellent', totalVolume: '$24,500' },
    { name: 'Apex Design Studio', score: 94, avgPayDays: '8 days', status: 'Excellent', totalVolume: '$18,900' },
    { name: 'Vanguard Media Group', score: 86, avgPayDays: '14 days', status: 'Good', totalVolume: '$12,400' },
    { name: 'BioGenix Labs Inc.', score: 62, avgPayDays: '35 days', status: 'Requires Follow-up', totalVolume: '$9,200' },
    { name: 'NorthStar Coworking Hub', score: 54, avgPayDays: '41 days', status: 'Requires Follow-up', totalVolume: '$6,400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 mb-1 text-indigo-600">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Payment Intelligence</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Receivables Aging & Cash Acceleration Analytics
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Track debtor aging schedules, average time-to-settle, and AI credit reliability ratings across your client accounts.
        </p>
      </div>

      {/* Aging Analysis Cards */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Accounts Receivable Aging Buckets</h3>
            <p className="text-xs text-slate-500">Distribution of uncollected customer invoices</p>
          </div>
          <span className="text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-full">
            Total Outstanding: $46,200
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
          {agingBuckets.map((bucket, idx) => (
            <div
              key={idx}
              style={{ width: `${bucket.percentage}%` }}
              className={`${bucket.color} transition-all duration-500`}
              title={`${bucket.label}: $${bucket.amount}`}
            />
          ))}
        </div>

        {/* Grid of Buckets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {agingBuckets.map((b, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-xs font-semibold text-slate-500">{b.label}</span>
              <p className="text-lg font-bold text-slate-900 mt-1">${b.amount.toLocaleString()}</p>
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                <span>{b.count} Invoices</span>
                <span className="font-semibold">{b.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client Reliability Score Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
          Client Payment Reliability & DSO Index
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase">
                <th className="py-2.5 px-3">Client Entity</th>
                <th className="py-2.5 px-3">Reliability Score</th>
                <th className="py-2.5 px-3">Avg Settlement Speed</th>
                <th className="py-2.5 px-3">Annual Volume</th>
                <th className="py-2.5 px-3 text-right">Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topClientsReliability.map((client, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900">{client.name}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${client.score}%` }}
                          className={`h-full rounded-full ${
                            client.score > 80
                              ? 'bg-emerald-500'
                              : client.score > 60
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                      </div>
                      <span className="font-bold text-slate-800">{client.score}/100</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{client.avgPayDays}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{client.totalVolume}</td>
                  <td className="py-3 px-3 text-right">
                    <Badge
                      variant={
                        client.score > 80
                          ? 'success'
                          : client.score > 60
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {client.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
