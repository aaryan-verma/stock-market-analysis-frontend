import { X, Layout, Sun, Moon, Monitor, ArrowDownUp } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { Button } from './common/Button';
import { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { 
    theme, 
    toggleTheme, 
    dashboardLayout, 
    updateDashboardLayout,
    defaultDates,
    updateDefaultDates
  } = useSettings();
  
  const [activeTab, setActiveTab] = useState<'appearance' | 'components' | 'data'>('appearance');

  const layoutOptions = [
    { key: 'showChart', label: 'Technical Chart', description: 'Display technical analysis chart' },
    { key: 'showOHLC', label: 'OHLC Display', description: 'Show Open-High-Low-Close price information' },
    { key: 'showInterpretation', label: 'Analysis Interpretation', description: 'Show detailed analysis interpretation' },
    { key: 'showNews', label: 'News Feed', description: 'Display relevant stock news' },
  ];

  const timeframeOptions = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
  const dateRangeOptions = ['1 month', '3 months', '6 months', '1 year', '3 years'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col" style={{ height: '550px' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Two column layout */}
        <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
          {/* Sidebar / Tabs */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-700 p-2 flex-shrink-0">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('appearance')}
                className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                  activeTab === 'appearance' 
                    ? 'bg-slate-700/80 text-white' 
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <Monitor className="w-5 h-5" />
                <span>Appearance</span>
              </button>
              
              <button
                onClick={() => setActiveTab('components')}
                className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                  activeTab === 'components' 
                    ? 'bg-slate-700/80 text-white' 
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <Layout className="w-5 h-5" />
                <span>Dashboard Layout</span>
              </button>
              
              <button
                onClick={() => setActiveTab('data')}
                className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                  activeTab === 'data' 
                    ? 'bg-slate-700/80 text-white' 
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <ArrowDownUp className="w-5 h-5" />
                <span>Data Preferences</span>
              </button>
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-grow p-6 overflow-y-auto">
            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <section>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <Monitor className="text-teal-500" />
                  Appearance
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => theme !== 'dark' && toggleTheme()}
                    className={`p-4 rounded-lg border ${
                      theme === 'dark'
                        ? 'border-teal-500 bg-slate-700/50'
                        : 'border-slate-700 hover:border-slate-600'
                    } transition-colors`}
                  >
                    <Moon className={`w-6 h-6 mb-2 ${theme === 'dark' ? 'text-teal-500' : 'text-slate-400'}`} />
                    <div className="text-sm font-medium text-white">Dark Mode</div>
                  </button>
                  <button
                    onClick={() => theme !== 'light' && toggleTheme()}
                    className={`p-4 rounded-lg border ${
                      theme === 'light'
                        ? 'border-teal-500 bg-slate-700/50'
                        : 'border-slate-700 hover:border-slate-600'
                    } transition-colors`}
                  >
                    <Sun className={`w-6 h-6 mb-2 ${theme === 'light' ? 'text-teal-500' : 'text-slate-400'}`} />
                    <div className="text-sm font-medium text-white">Light Mode</div>
                  </button>
                </div>
              </section>
            )}

            {/* Components Tab */}
            {activeTab === 'components' && (
              <section>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <Layout className="text-teal-500" />
                  Dashboard Components
                </h3>
                <div className="space-y-4">
                  {layoutOptions.map(({ key, label, description }) => (
                    <label
                      key={key}
                      className="flex items-start gap-3 p-3 rounded-lg border border-slate-700 
                               hover:border-slate-600 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={dashboardLayout[key as keyof typeof dashboardLayout]}
                        onChange={(e) => updateDashboardLayout({ [key]: e.target.checked })}
                        className="mt-1 rounded border-slate-600 text-teal-500 
                                 focus:ring-teal-500 bg-slate-700"
                      />
                      <div>
                        <div className="font-medium text-white">{label}</div>
                        <div className="text-sm text-slate-400">{description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </section>
            )}

            {/* Data Preferences Tab */}
            {activeTab === 'data' && (
              <section>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <ArrowDownUp className="text-teal-500" />
                  Data Preferences
                </h3>
                <p className="text-slate-400 mb-4 text-sm">Set default values for new analyses</p>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-white font-medium">Default Timeframe</label>
                    <p className="text-sm text-slate-400">Default analysis timeframe for new queries</p>
                    <select 
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg 
                               px-4 py-2 text-white focus:outline-none focus:ring-2 
                               focus:ring-teal-500"
                      value={defaultDates.defaultTimeframe}
                      onChange={(e) => updateDefaultDates({ 
                        defaultTimeframe: e.target.value as typeof defaultDates.defaultTimeframe 
                      })}
                    >
                      {timeframeOptions.map(option => (
                        <option key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-white font-medium">Default Date Range</label>
                    <p className="text-sm text-slate-400">Default look-back period for new analyses</p>
                    <select 
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg 
                               px-4 py-2 text-white focus:outline-none focus:ring-2 
                               focus:ring-teal-500"
                      value={defaultDates.defaultDateRange}
                      onChange={(e) => updateDefaultDates({ 
                        defaultDateRange: e.target.value as typeof defaultDates.defaultDateRange 
                      })}
                    >
                      {dateRangeOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex justify-end flex-shrink-0">
          <Button onClick={onClose}>Save & Close</Button>
        </div>
      </div>
    </div>
  );
} 