import { useState, type FC } from 'react';
import { Settings, Save } from 'lucide-react';

interface SettingsPageProps {
  onSaveSettings: () => void;
}

export const SettingsPage: FC<SettingsPageProps> = ({ onSaveSettings }) => {
  const [currency, setCurrency] = useState('USD ($)');
  const [fiscalYearStart, setFiscalYearStart] = useState('January 1');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [dunningWhatsapp, setDunningWhatsapp] = useState(true);
  const [aiAutonomousDrafts, setAiAutonomousDrafts] = useState(true);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 mb-1 text-indigo-600">
          <Settings className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Preferences & Controls</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          System Settings & Workspace Configurations
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure financial reporting periods, currency localization, and AI autonomous permissions.
        </p>
      </div>

      {/* Financial Defaults */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
          Financial & Accounting Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Base Reporting Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
            >
              <option value="USD ($)">USD - United States Dollar ($)</option>
              <option value="CAD ($)">CAD - Canadian Dollar ($)</option>
              <option value="EUR (€)">EUR - Euro (€)</option>
              <option value="GBP (£)">GBP - British Pound (£)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fiscal Year Commencement
            </label>
            <select
              value={fiscalYearStart}
              onChange={(e) => setFiscalYearStart(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
            >
              <option value="January 1">January 1 (Calendar Year)</option>
              <option value="April 1">April 1 (Q2 Standard)</option>
              <option value="July 1">July 1 (Fiscal Mid-Year)</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI Automation Permissions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
          Autonomous Agent Guardrails
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
            <div>
              <p className="text-xs font-bold text-slate-900">Auto-Draft Vendor Purchase Orders</p>
              <p className="text-[11px] text-slate-500">
                Inventory Agent generates pending POs when stock falls below safety buffer
              </p>
            </div>
            <input
              type="checkbox"
              checked={aiAutonomousDrafts}
              onChange={(e) => setAiAutonomousDrafts(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
            <div>
              <p className="text-xs font-bold text-slate-900">WhatsApp Automated Payment Reminders</p>
              <p className="text-[11px] text-slate-500">
                Allow AI to send verified 1-click payment links directly to corporate billing managers
              </p>
            </div>
            <input
              type="checkbox"
              checked={dunningWhatsapp}
              onChange={(e) => setDunningWhatsapp(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
            <div>
              <p className="text-xs font-bold text-slate-900">Daily Morning Briefing Email</p>
              <p className="text-[11px] text-slate-500">
                Receive CFO burn summary and cash flow runway projection at 7:00 AM
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onSaveSettings}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Workspace Settings
          </button>
        </div>
      </div>
    </div>
  );
};
