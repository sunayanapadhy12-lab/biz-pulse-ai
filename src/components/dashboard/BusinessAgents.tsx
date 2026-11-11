import type { FC } from 'react';
import { Bot, ArrowRight, Cpu, TrendingUp, Package, Compass, Sparkles } from 'lucide-react';
import type { BusinessAgent } from '../../types';

interface BusinessAgentsProps {
  agents: BusinessAgent[];
  onAskAgent: (agent: BusinessAgent) => void;
  onViewAllAgents?: () => void;
}

export const BusinessAgents: FC<BusinessAgentsProps> = ({
  agents,
  onAskAgent,
  onViewAllAgents,
}) => {
  const getAgentIcon = (id: string) => {
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
        return Cpu;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              AI Business Executive Agents
            </h3>
            <p className="text-xs text-slate-500">Autonomous co-pilots fine-tuned for your financial operations</p>
          </div>
        </div>

        {onViewAllAgents && (
          <button
            onClick={onViewAllAgents}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 self-start sm:self-auto"
          >
            Agent Command Center <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent) => {
          const Icon = getAgentIcon(agent.id);

          return (
            <div
              key={agent.id}
              className="p-4 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/50 hover:border-slate-300 transition-all flex flex-col justify-between shadow-2xs group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-2xs"
                    style={{ backgroundColor: agent.accentColor }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {agent.name}
                </h4>
                <p className="text-[11px] font-medium text-slate-400 mb-2">
                  {agent.shortRole}
                </p>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {agent.description}
                </p>

                {/* Capabilities pills */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {agent.capabilities.slice(0, 2).map((cap, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onAskAgent(agent)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100/90 border border-indigo-200/60 rounded-xl transition-all shadow-2xs group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Ask Agent
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
