import { useState, type FC } from 'react';
import { Bot, CheckCircle2, Zap, Play, AlertCircle } from 'lucide-react';

interface AiPaymentAgentPageProps {
  onRunSimulation: () => void;
}

export const AiPaymentAgentPage: FC<AiPaymentAgentPageProps> = ({ onRunSimulation }) => {
  const [autoDunningEnabled, setAutoDunningEnabled] = useState(true);
  const [channels, setChannels] = useState({
    email: true,
    whatsapp: true,
    sms: false,
  });

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
              <Bot className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              Autonomous Dunning Co-Pilot
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            AI Payment & Collections Agent
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            The AI Payment Agent proactively monitors unpaid invoices, personalizes collection tone based on client history, dispatches multi-channel payment links, and reconciles incoming bank settlements.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={onRunSimulation}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <Play className="w-4 h-4 fill-white" />
            Run Dunning Scan
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Total Recovered This Quarter</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">$18,420.00</p>
          <span className="text-[11px] text-slate-400">Recovered without manual escalation</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Days Sales Outstanding (DSO)</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">22.4 Days</p>
          <span className="text-[11px] text-emerald-600 font-medium">Reduced by 4.2 days this cycle</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">First-Reminder Settlement Rate</span>
          <p className="text-2xl font-black text-slate-900 mt-1">78.5%</p>
          <span className="text-[11px] text-slate-400">Settle within 48h of automated nudge</span>
        </div>
      </div>

      {/* Configuration & Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rules Config */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            Autonomous Policy Settings
          </h3>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
            <div>
              <p className="text-xs font-bold text-slate-900">Auto-Remind on Approaching Due Date</p>
              <p className="text-[11px] text-slate-500">Sends polite reminder 3 days before invoice due date</p>
            </div>
            <input
              type="checkbox"
              checked={autoDunningEnabled}
              onChange={(e) => setAutoDunningEnabled(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">Enabled Communication Channels</span>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.email}
                  onChange={(e) => setChannels({ ...channels, email: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                Email
              </label>
              <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.whatsapp}
                  onChange={(e) => setChannels({ ...channels, whatsapp: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                WhatsApp
              </label>
              <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.sms}
                  onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                SMS
              </label>
            </div>
          </div>

          <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900">
            <span className="font-bold block mb-0.5">AI Sentiment Guardrail</span>
            The agent automatically checks relationship length: corporate accounts with &gt;6 months tenure receive softer polite inquiries, while accounts past 15 days overdue receive formal settlement requests with updated statements.
          </div>
        </div>

        {/* Live Event Stream */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            Recent Autonomous Agent Actions
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Automated Reminder Dispatched</p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Sent friendly Net-15 notice to Vanguard Media Group for INV-2026-088 ($2,850).
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">Today at 9:00 AM • Email</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Overdue Escalation Notice</p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Second notice delivered to BioGenix Labs for INV-2026-087 ($3,200). Status: Opened by AP Manager.
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">Yesterday at 9:30 AM • WhatsApp</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
              <Zap className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Direct Deposit Reconciled</p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Horizon Tech Hub payment ($4,920) matched and marked as Paid automatically.
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">Nov 07, 2026 • Automated Match</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
