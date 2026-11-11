import { useState, type FC } from 'react';
import { Modal } from '../common/Modal';
import type { BusinessAgent } from '../../types';
import { Bot, Send, RefreshCw } from 'lucide-react';

interface AgentChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAgent: BusinessAgent;
  allAgents: BusinessAgent[];
}

interface Message {
  sender: 'user' | 'agent';
  text: string;
  time: string;
  dataPoints?: { label: string; value: string }[];
}

export const AgentChatModal: FC<AgentChatModalProps> = ({
  isOpen,
  onClose,
  initialAgent,
  allAgents,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<BusinessAgent>(initialAgent);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  // Initial welcome message per agent
  const [conversation, setConversation] = useState<Message[]>([
    {
      sender: 'agent',
      text: `Hello Rishita! I'm your ${initialAgent.name}. I'm continuously analyzing Pulse Gourmet Cafe's financial ledger, cash flows, and operating ratios. How can I assist you today?`,
      time: 'Just now',
    },
  ]);

  const handleSelectAgent = (agent: BusinessAgent) => {
    setSelectedAgent(agent);
    setConversation([
      {
        sender: 'agent',
        text: `Connected to ${agent.name} (${agent.shortRole}). Ready to evaluate your metrics and answer specific business queries.`,
        time: 'Just now',
      },
    ]);
  };

  const generateAgentResponse = (query: string, agent: BusinessAgent): Message => {
    const qLower = query.toLowerCase();

    if (agent.id === 'cfo-agent') {
      if (qLower.includes('runway') || qLower.includes('cash')) {
        return {
          sender: 'agent',
          text: `Based on your liquid reserves of $84,930.50 and average monthly burn rate of $64,280 (offset by $128,450 recurring inflows), your **zero-revenue runway is 14.8 months**. Under stressed conditions with 30% lower revenue, you sustain a comfortable 22-month operating window.`,
          time: 'Just now',
          dataPoints: [
            { label: 'Available Balance', value: '$84,930' },
            { label: 'Safe Runway', value: '14.8 Mo' },
            { label: 'Net Margin', value: '49.9%' },
          ],
        };
      }
      return {
        sender: 'agent',
        text: `CFO Analysis: Your gross profit margin reached 54.8% this month (+2.4% above local specialty cafes). Consolidating your $14,200 line of credit with First Republic and taking the 9.5% packaging early-settlement rebate will liberate an additional $1,420/month into liquid reserves.`,
        time: 'Just now',
        dataPoints: [
          { label: 'Monthly Savings', value: '$1,420' },
          { label: 'DSO Average', value: '22.4 Days' },
        ],
      };
    }

    if (agent.id === 'growth-agent') {
      return {
        sender: 'agent',
        text: `Growth Analysis: Your "Executive Weekly Catering" offering delivers a **68% contribution margin**, compared to 48% on in-store walk-in pastry orders. Securing 2 additional corporate tech hub accounts this month will add $6,900 in recurring high-margin MRR.`,
        time: 'Just now',
        dataPoints: [
          { label: 'Catering Margin', value: '68%' },
          { label: 'Projected MRR', value: '+$6,900' },
        ],
      };
    }

    if (agent.id === 'inventory-agent') {
      return {
        sender: 'agent',
        text: `Inventory Alert: Ethiopian Yirgacheffe Arabica Beans (12kg remaining) and Barista Oat Milk cases (8 remaining) have breached safe reorder levels. I have drafted an auto-replenishment purchase order totaling $1,840 to avoid an estimated weekend lost sales exposure of $2,800.`,
        time: 'Just now',
        dataPoints: [
          { label: 'Draft PO', value: '$1,840' },
          { label: 'Lead Time', value: '2 Days' },
        ],
      };
    }

    // Default Market intel agent
    return {
      sender: 'agent',
      text: `Market Intelligence: Wholesale arabica futures dipped 3.2% this week, providing a favorable window to lock in Q1 2027 contract roasts. Nearby competitors in downtown have raised standard flat white pricing to $6.25, leaving room for a modest $0.35 menu price optimization with zero demand elasticity risk.`,
      time: 'Just now',
      dataPoints: [
        { label: 'Market Benchmark', value: '$6.25' },
        { label: 'Green Bean Futures', value: '-3.2%' },
      ],
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsg: Message = {
      sender: 'user',
      text: query,
      time: 'Just now',
    };

    setConversation((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    setTimeout(() => {
      const response = generateAgentResponse(query, selectedAgent);
      setConversation((prev) => [...prev, response]);
      setIsThinking(false);
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Biz Pulse AI Business Agents"
      subtitle="Interactive business guidance and scenario modeling"
      maxWidth="2xl"
    >
      <div className="flex flex-col h-[520px]">
        {/* Agent Selector Header */}
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 overflow-x-auto">
          {allAgents.map((agent) => {
            const isSelected = selectedAgent.id === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => handleSelectAgent(agent)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isSelected ? '#FFFFFF' : agent.accentColor }}
                />
                {agent.name}
              </button>
            );
          })}
        </div>

        {/* Chat / Message thread */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
          {conversation.map((msg, idx) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={idx}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs mt-0.5"
                    style={{ backgroundColor: selectedAgent.accentColor }}
                  >
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Optional structured data pills in agent responses */}
                  {msg.dataPoints && (
                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex flex-wrap gap-2">
                      {msg.dataPoints.map((dp, i) => (
                        <div
                          key={i}
                          className="bg-white px-2 py-1 rounded-md border border-slate-200 shadow-2xs text-xs"
                        >
                          <span className="text-slate-400 text-[10px] block">{dp.label}</span>
                          <strong className="text-slate-900">{dp.value}</strong>
                        </div>
                      ))}
                    </div>
                  )}

                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      isUser ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}

          {isThinking && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-10">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
              <span>{selectedAgent.name} is running financial simulations...</span>
            </div>
          )}
        </div>

        {/* Suggested Queries Chips */}
        <div className="py-2 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Suggested Queries for {selectedAgent.shortRole}
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
            {selectedAgent.sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/60 transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <div className="pt-2 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder={`Ask ${selectedAgent.name} any question regarding margins, runway, or pricing...`}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 pr-10"
            />
          </div>

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || isThinking}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors shrink-0"
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
