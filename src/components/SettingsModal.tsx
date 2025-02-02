import { X, Layout, Sun, Moon, Monitor } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { Button } from './common/Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, toggleTheme, dashboardLayout, updateDashboardLayout } = useSettings();

  const layoutOptions = [
    { key: 'showChart', label: 'Technical Chart', description: 'Display technical analysis chart' },
    { key: 'showOHLC', label: 'OHLC Display', description: 'Show Open-High-Low-Close price information' },
    { key: 'showInterpretation', label: 'Analysis Interpretation', description: 'Show detailed analysis interpretation' },
    { key: 'showNews', label: 'News Feed', description: 'Display relevant stock news' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Theme Settings */}
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

          {/* Dashboard Layout Settings */}
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
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
} 