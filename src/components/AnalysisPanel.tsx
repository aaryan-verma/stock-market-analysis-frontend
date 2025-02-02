import { useState } from 'react';
import { Bot, TrendingUp, AlertTriangle, Target, ArrowUpDown, Bell, BookmarkPlus, ChevronRight, BarChart2, Scale, BookmarkCheck, Trash2 } from 'lucide-react';
import { Card } from './common/Card';
import { toast } from 'react-toastify';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { Button } from './common/Button';
import { LastOHLC } from '../types/stock';

interface AnalysisPanelProps {
  interpretation: string;
  lastOHLC: LastOHLC | null;
  onAddToWatchlist?: (symbol: string) => void;
  onRemoveFromWatchlist?: (symbol: string) => void;
  stockSymbol?: string;
  isInWatchlist?: boolean;
}

type TabType = 'summary' | 'levels' | 'signals' | 'risk';

export function AnalysisPanel({ 
  interpretation, 
  lastOHLC,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  stockSymbol,
  isInWatchlist = false
}: AnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const tabs = [
    { 
      id: 'summary', 
      label: 'Analysis Summary', 
      icon: Bot,
      color: 'text-blue-500'
    },
    { 
      id: 'levels', 
      label: 'Price Levels', 
      icon: ArrowUpDown,
      color: 'text-purple-500'
    },
    { 
      id: 'signals', 
      label: 'Trading Signals', 
      icon: TrendingUp,
      color: 'text-green-500'
    },
    { 
      id: 'risk', 
      label: 'Risk Analysis', 
      icon: AlertTriangle,
      color: 'text-amber-500'
    },
  ] as const;

  const getMarketStatus = (scenario: string) => {
    if (scenario.includes('BULLISH')) {
      return {
        text: 'BULLISH',
        color: 'bg-green-500',
        textColor: 'text-green-500',
        icon: '📈'
      };
    }
    if (scenario.includes('BEARISH')) {
      return {
        text: 'BEARISH',
        color: 'bg-red-500',
        textColor: 'text-red-500',
        icon: '📉'
      };
    }
    return {
      text: 'NEUTRAL',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500',
      icon: '📊'
    };
  };

  const getTabContent = (tab: TabType) => {
    const [scenario, ...details] = interpretation.split('\n');
    const marketStatus = getMarketStatus(scenario);
    
    switch (tab) {
      case 'summary':
        return (
          <div className="space-y-6">
            {/* Market Status Card */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className={`p-3 rounded-full ${marketStatus.color}/10 ${marketStatus.textColor}`}>
                <TrendingUp size={24} />
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg text-white">Market Status</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${marketStatus.color}/10 ${marketStatus.textColor}`}>
                    {marketStatus.text} {marketStatus.icon}
                  </span>
                </div>
                <p className="text-slate-400 mt-1">{scenario}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mt-6">
              <Button
                variant="outline"
                className="flex items-center gap-2 text-sm"
                onClick={() => toast.info('Alerts coming soon!')}
              >
                <Bell className="w-4 h-4" />
                Set Alert
              </Button>
              
              {isInWatchlist ? (
                <Button
                  variant="outline"
                  className="flex items-center gap-2 text-sm bg-teal-500/10 border-teal-500 text-teal-400 
                             group relative hover:pr-12 transition-all duration-300"
                  onClick={() => setShowConfirmDelete(true)}
                >
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Added to Watchlist</span>
                  <Trash2 
                    className="w-4 h-4 absolute right-3 opacity-0 group-hover:opacity-100 
                               text-red-400 transition-all duration-300" 
                  />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="flex items-center gap-2 text-sm"
                  onClick={() => {
                    if (onAddToWatchlist && stockSymbol) {
                      onAddToWatchlist(stockSymbol);
                    }
                  }}
                  disabled={!stockSymbol}
                >
                  <BookmarkPlus className="w-4 h-4" />
                  Add to Watchlist
                </Button>
              )}
            </div>

            {/* Analysis Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {details.map((detail, index) => (
                <div 
                  key={index} 
                  className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 
                           hover:border-slate-600 transition-all"
                >
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-teal-500 mt-0.5" />
                    <p className="text-slate-200">{detail.replace('•', '')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'levels':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Resistance Levels */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <TrendingUp className="text-green-500" />
                  Resistance Levels
                </h3>
                <div className="space-y-2">
                  {['R6', 'R5', 'R4', 'R3'].map((level) => (
                    <div key={level} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-green-500 font-medium">{level}</span>
                        <span className="text-slate-400 text-sm">
                          {level === 'R6' && 'Target 2 LONG'}
                          {level === 'R5' && 'Target 1 LONG'}
                          {level === 'R4' && 'Breakout Level'}
                          {level === 'R3' && 'Sell Reversal'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Levels */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <TrendingUp className="text-red-500 transform rotate-180" />
                  Support Levels
                </h3>
                <div className="space-y-2">
                  {['S3', 'S4', 'S5', 'S6'].map((level) => (
                    <div key={level} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-red-500 font-medium">{level}</span>
                        <span className="text-slate-400 text-sm">
                          {level === 'S3' && 'Buy Reversal'}
                          {level === 'S4' && 'Breakdown Level'}
                          {level === 'S5' && 'Target 1 SHORT'}
                          {level === 'S6' && 'Target 2 SHORT'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'signals':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Buy Signals */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <TrendingUp className="text-green-500" />
                  Buy Signals
                </h3>
                <div className="space-y-2">
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-green-500 mt-0.5" />
                        <span className="text-slate-200">Price below S3 but above S4</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-green-500 mt-0.5" />
                        <span className="text-slate-200">Price above R4 (Breakout)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-green-500 mt-0.5" />
                        <span className="text-slate-200">Strong momentum above PP</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Sell Signals */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <TrendingUp className="text-red-500 transform rotate-180" />
                  Sell Signals
                </h3>
                <div className="space-y-2">
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-red-500 mt-0.5" />
                        <span className="text-slate-200">Price below S4 (Breakdown)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-red-500 mt-0.5" />
                        <span className="text-slate-200">Price above R3 but below R4</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-red-500 mt-0.5" />
                        <span className="text-slate-200">Weak momentum below PP</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'risk':
        return (
          <div className="space-y-8">
            {/* Risk Radar Chart */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 
                          border border-slate-700/50 backdrop-blur-sm">
              <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
                <AlertTriangle className="text-amber-500" />
                Risk Analysis Radar
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={riskData}>
                    <PolarGrid stroke="#475569" />
                    <PolarAngleAxis
                      dataKey="factor"
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: '#94a3b8' }}
                    />
                    <Radar
                      name="Risk Factors"
                      dataKey="value"
                      stroke="#0ea5e9"
                      fill="#0ea5e9"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Management Tips */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {riskManagementTips.map(({ title, value, icon: Icon, color }) => (
                <div key={title} 
                     className="p-4 rounded-xl bg-gradient-to-br from-slate-800/30 to-slate-900/30 
                              border border-slate-700/50 backdrop-blur-sm
                              hover:from-slate-800/50 hover:to-slate-900/50 
                              transition-all duration-300 group">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${color} bg-white/5 group-hover:bg-white/10 
                                 transition-colors duration-300`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-300">{title}</h4>
                      <p className="text-lg font-semibold text-white mt-1">{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Risk Factors Progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {riskData.map(({ factor, value }) => (
                <div key={factor} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">{factor}</span>
                    <span className="text-slate-400">{value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-700/50 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-500 
                               transition-all duration-500 ease-out"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  // Calculate risk metrics
  const metrics = calculateRiskMetrics(interpretation, lastOHLC || undefined);

  // Update risk data to use calculated metrics
  const riskData = [
    { factor: 'Market Volatility', value: metrics.marketVolatility },
    { factor: 'Price Momentum', value: metrics.priceMomentum },
    { factor: 'Volume Activity', value: metrics.volumeActivity },
    { factor: 'Support/Resistance', value: metrics.supportResistance },
    { factor: 'Market Breadth', value: metrics.marketBreadth },
  ];

  // Add risk management tips
  const riskManagementTips = [
    {
      title: 'Stop Loss',
      value: '2% below entry',
      icon: Target,
      color: 'text-red-500'
    },
    {
      title: 'Position Size',
      value: 'Max 5% of capital',
      icon: BarChart2,
      color: 'text-blue-500'
    },
    {
      title: 'Risk/Reward',
      value: 'Minimum 1:2',
      icon: Scale,
      color: 'text-green-500'
    }
  ];

  // Add confirmation dialog component
  const ConfirmDialog = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-800 rounded-lg p-6 max-w-md mx-4 space-y-4 border border-slate-700">
        <h3 className="text-lg font-semibold text-white">Remove from Watchlist?</h3>
        <p className="text-slate-300">
          Are you sure you want to remove {stockSymbol} from your watchlist?
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setShowConfirmDelete(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (onRemoveFromWatchlist && stockSymbol) {
                onRemoveFromWatchlist(stockSymbol);
                setShowConfirmDelete(false);
              }
            }}
            className="bg-red-500 hover:bg-red-600"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 
                     backdrop-blur-sm border border-slate-700/50 shadow-xl">
      <div className="space-y-6">
        {/* Enhanced Tabs with better styling */}
        <div className="flex flex-wrap gap-2 p-1 bg-slate-800/50 rounded-lg backdrop-blur-sm">
          {tabs.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 
                       ${activeTab === id 
                         ? `bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-lg` 
                         : 'text-slate-400 hover:text-white hover:bg-slate-700/30'}`}
            >
              <Icon className={`transition-colors duration-300 
                            ${activeTab === id ? color : 'text-slate-400'}`} 
                   size={18} 
              />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
        
        {/* Tab Content with enhanced transitions */}
        <div className="min-h-[300px] transition-all duration-500 ease-out">
          {activeTab === 'risk' ? getTabContent('risk') : getTabContent(activeTab)}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDelete && <ConfirmDialog />}
    </Card>
  );
}

// Add interface for risk metrics
interface RiskMetrics {
  marketVolatility: number;
  priceMomentum: number;
  volumeActivity: number;
  supportResistance: number;
  marketBreadth: number;
}

// Add this function to calculate risk metrics
const calculateRiskMetrics = (interpretation: string, lastOHLC?: LastOHLC): RiskMetrics => {
  // Default values
  const metrics: RiskMetrics = {
    marketVolatility: 50,
    priceMomentum: 50,
    volumeActivity: 50,
    supportResistance: 50,
    marketBreadth: 50
  };

  // Market Volatility (based on price range and average)
  if (lastOHLC) {
    const priceRange = ((lastOHLC.high - lastOHLC.low) / lastOHLC.close) * 100;
    metrics.marketVolatility = Math.min(Math.round(priceRange * 10), 100);
  }

  // Price Momentum (based on interpretation)
  if (interpretation.toLowerCase().includes('bullish')) {
    metrics.priceMomentum = 75;
  } else if (interpretation.toLowerCase().includes('bearish')) {
    metrics.priceMomentum = 25;
  }

  // Volume Activity (based on volume vs average)
  if (lastOHLC?.volume) {
    const volumeRatio = (lastOHLC.volume / lastOHLC.averageVolume) * 100;
    metrics.volumeActivity = Math.min(Math.round(volumeRatio), 100);
  }

  // Support/Resistance (based on price position)
  if (lastOHLC) {
    const pricePosition = interpretation.toLowerCase().includes('near resistance') ? 85 :
                         interpretation.toLowerCase().includes('near support') ? 35 : 60;
    metrics.supportResistance = pricePosition;
  }

  // Market Breadth (based on overall market conditions from interpretation)
  const breadthScore = interpretation.toLowerCase().includes('strong market') ? 80 :
                      interpretation.toLowerCase().includes('weak market') ? 30 : 50;
  metrics.marketBreadth = breadthScore;

  return metrics;
}; 