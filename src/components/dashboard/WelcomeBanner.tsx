import type { FC } from 'react';
import { Plus, Receipt, Sparkles, Calendar } from 'lucide-react';
import type { UserProfile } from '../../types';

interface WelcomeBannerProps {
  user: UserProfile;
  onCreateInvoice: () => void;
  onRecordTransaction: () => void;
  onOpenAgent: (agentId?: string) => void;
}

const formattedDate = 'Tuesday, Nov 10, 2026';

export const WelcomeBanner: FC<WelcomeBannerProps> = ({
  user,
  onCreateInvoice,
  onRecordTransaction,
  onOpenAgent,
}) => {

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs relative overflow-hidden">
      {/* Decorative subtle ambient backdrop */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-50/70 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Welcome Text */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1.5">
            <span className="flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-normal">Pulse Gourmet Cafe & Roastery</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Good morning, {user.name.split(' ')[0]} 👋
          </h2>

          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            Your net margin grew <span className="font-semibold text-emerald-600">+18.9% MoM</span> with healthy cash reserves. Three client invoices ($4,820) are due this week, and your CFO Agent has flagged a $1,420 vendor discount opportunity.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onOpenAgent('cfo-agent')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/60 rounded-xl transition-all shadow-2xs group"
          >
            <Sparkles className="w-4 h-4 text-indigo-600 group-hover:rotate-12 transition-transform" />
            Ask CFO Agent
          </button>

          <button
            onClick={onRecordTransaction}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:border-slate-300"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            Record Transaction
          </button>

          <button
            onClick={onCreateInvoice}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm shadow-indigo-200 hover:shadow-indigo-300"
          >
            <Receipt className="w-4 h-4 text-white" />
            Create Invoice
          </button>
        </div>
      </div>
    </div>
  );
};
