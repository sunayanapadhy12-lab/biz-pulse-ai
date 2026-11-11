import type { FC } from 'react';
import type { BusinessAgent } from '../types';
import { Bot, TrendingUp, Package, Compass, Sparkles, MessageSquare, ArrowRight } from 'lucide-react';

interface AiBusinessAgentsPageProps {
  agents: BusinessAgent[];
  onOpenAgent: (agent: BusinessAgent) => void;
}

export const AiBusinessAgentsPage: FC<AiBusinessAgentsPageProps> = ({
  agents,
  onOpenAgent,
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'cfo-agent':
        return Bot;
      case 'growth-agent':
        return TrendingUp;
      case 'inventory-agent':
        return Package;
      case 'market-intel-agent':
        return Compass;
      default:
        return Sparkles;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 mb-1 text-indigo-600">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">AI Executive Team</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Autonomous AI Business Agents
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Four specialized co-pilots configured with Pulse Gourmet Cafe's financial books, operational constraints, and supplier relationships to model decisions, audit burn rates, and draft orders.
        </p>
      </div>

      {/* Grid of 4 Detailed Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent) => {
          const Icon = getIcon(agent.id);

          return (
            <div
              key={agent.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all"
            >
              <div>
                {/* Agent Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: agent.accentColor }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{agent.name}</h3>
                      <p className="text-xs font-semibold text-slate-500">{agent.shortRole}</p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Analysis
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {agent.description}
                </p>

                {/* Key Capabilities */}
                <div className="mb-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Autonomous Capabilities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.capabilities.map((cap, i) => (
                      <span
                        key={i}
                        className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-700"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sample questions */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Popular Scenarios & Queries
                  </span>
                  <div className="space-y-1.5">
                    {agent.sampleQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="text-xs p-2 rounded-lg bg-slate-50/70 border border-slate-100 text-slate-600 flex items-center justify-between group cursor-pointer hover:bg-indigo-50/50 hover:text-indigo-800 transition-colors"
                        onClick={() => onOpenAgent(agent)}
                      >
                        <span className="truncate pr-2">"{q}"</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <button
                  onClick={() => onOpenAgent(agent)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  Launch Consultation with {agent.name}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
