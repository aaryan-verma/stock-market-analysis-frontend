import { Sun, Moon, Layout } from 'lucide-react';
import { Card } from './common/Card';
import { useSettings } from '../contexts/SettingsContext';

export function SettingsPanel() {
  const { theme, toggleTheme, dashboardLayout, updateDashboardLayout } = useSettings();

  const layoutOptions = [
    { key: 'showChart', label: 'Technical Chart' },
    { key: 'showOHLC', label: 'OHLC Display' },
    { key: 'showInterpretation', label: 'Analysis Interpretation' },
    { key: 'showNews', label: 'News Feed' },
  ];

  return (
    <Card className="bg-slate-800/50 backdrop-blur border border-slate-700">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Layout className="text-teal-500" />
            Dashboard Customization
          </h3>
          <div className="space-y-3">
            {layoutOptions.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 text-slate-300">
                <input
                  type="checkbox"
                  checked={dashboardLayout[key as keyof typeof dashboardLayout]}
                  onChange={(e) => updateDashboardLayout({ [key]: e.target.checked })}
                  className="rounded border-slate-600 text-teal-500 focus:ring-teal-500 bg-slate-700"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-700 pt-4">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-300 
                     hover:bg-slate-700/50 transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-5 h-5" />
                Switch to Light Mode
              </>
            ) : (
              <>
                <Moon className="w-5 h-5" />
                Switch to Dark Mode
              </>
            )}
          </button>
        </div>
      </div>
    </Card>
  );
} 