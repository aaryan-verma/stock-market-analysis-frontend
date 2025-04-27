import { useState, useEffect } from "react";
import { Search, Calendar, BarChart2, ChevronRight, Settings, HelpCircle, Menu, X, LineChart, AlertCircle, CheckCircle2, XCircle, Star, Info, RotateCcw, MessageCircle } from "lucide-react";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { NSE_STOCKS } from '../constants/stocks';
import { filterStocks } from '../utils/stockUtils';
import { StockAnalysisFormData, TimeFrameOption, StoredAnalysis, LastOHLC, NewsItem } from '../types/stock';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { stockService } from '../services/stockService';
import { toast } from 'react-toastify';
import { AnalysisPanel } from './AnalysisPanel';
import { OHLCDisplay } from './OHLCDisplay';
import { SentimentAnalysis } from './SentimentAnalysis';
import { useLocation } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import { useSettings } from '../contexts/SettingsContext';
import { SettingsModal } from './SettingsModal';
import { AboutModal } from './AboutModal';
import { v4 as uuidv4 } from 'uuid';
import { WatchlistTab } from './WatchlistTab';
import { config } from '../config';

interface HomePageProps {
  onLogout: () => void;
}

interface WatchlistItem {
  symbol: string;
  addedAt: string;
}

const getMinimumDateRange = (timeFrame: string): number => {
  const daysInPeriod: Record<string, number> = {
    'daily': 3,
    'weekly': 21,
    'monthly': 90,
    'quarterly': 270,
    'yearly': 1095
  };
  return daysInPeriod[timeFrame.toLowerCase()] || 3;
};

const toastStyles = {
  success: {
    style: {
      background: 'rgba(16, 185, 129, 0.95)',
      backdropFilter: 'blur(8px)',
      color: 'white',
      borderRadius: '0.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '16px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
    icon: <CheckCircle2 className="w-5 h-5" />,
    duration: 5000,
  },
  error: {
    style: {
      background: 'rgba(239, 68, 68, 0.95)',
      backdropFilter: 'blur(8px)',
      color: 'white',
      borderRadius: '0.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '16px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
    icon: <XCircle className="w-5 h-5" />,
    duration: 7000,
  },
  warning: {
    style: {
      background: 'rgba(245, 158, 11, 0.95)',
      backdropFilter: 'blur(8px)',
      color: 'white',
      borderRadius: '0.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '16px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
    icon: <AlertCircle className="w-5 h-5" />,
    duration: 6000,
  },
};

const showAnalysisComplete = (interpretation: string) => {
  toast.success(
    <div className="space-y-2 cursor-pointer" onClick={() => {
      document.querySelector('.analysis-results')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }}>
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        <span className="font-semibold">Analysis Completed</span>
      </div>
      <p className="text-sm opacity-90">
        {interpretation.split('\n')[0]}
      </p>
      <p className="text-xs opacity-75 mt-1">
        Click to view results
      </p>
    </div>,
    {
      ...toastStyles.success,
      className: 'analysis-toast',
    }
  );
};

const showValidationError = (message: string) => {
  toast.error(
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <XCircle className="w-5 h-5 flex-shrink-0" />
        <span className="font-semibold">Validation Error</span>
      </div>
      <p className="text-sm opacity-90">{message}</p>
    </div>,
    toastStyles.error
  );
};

const timeFrameInfo = {
  daily: "Analyze daily price movements (min 3 days of data)",
  weekly: "View weekly trends and patterns (min 3 weeks of data)",
  monthly: "Track monthly market cycles (min 3 months of data)",
  quarterly: "Examine quarterly performance (min 3 quarters of data)",
  yearly: "Study long-term trends (min 3 years of data)"
};

export function HomePage({ onLogout }: HomePageProps) {
  const [stockName, setStockName] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrameOption | "">("");
  const [analysisImage, setAnalysisImage] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastOHLC, setLastOHLC] = useState<LastOHLC | null>(null);
  const [activeTab, setActiveTab] = useState<'chart' | 'sentiment' | 'watchlist'>('chart');
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const { theme, dashboardLayout } = useSettings();
  const location = useLocation();
  const [shouldFetchNews, setShouldFetchNews] = useState(false);
  const [isAnalysisCompleted, setIsAnalysisCompleted] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<StoredAnalysis[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    setStartDate(null);
    setEndDate(null);
    const storedHistory = localStorage.getItem('analysisHistory');
    if (storedHistory) {
      setAnalysisHistory(JSON.parse(storedHistory));
    }
    const savedWatchlist = localStorage.getItem('watchlist');
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, [location.pathname]);

  const handleStockInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStockName(value);
    setSuggestions(filterStocks(value, NSE_STOCKS));
    setShouldFetchNews(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setStockName(suggestion);
    setSuggestions([]);
  };

  const handleAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!stockName || !startDate || !endDate) {
        showValidationError('Please fill in all required fields');
        return;
      }

      // Calculate date difference
      const startMs = startDate.valueOf();
      const endMs = endDate.valueOf();
      const daysDifference = Math.floor((endMs - startMs) / (1000 * 60 * 60 * 24));
      const requiredDays = getMinimumDateRange(timeFrame);

      if (daysDifference < requiredDays) {
        showValidationError(
          `For ${timeFrame} analysis, date range must be at least ${requiredDays} days. ` +
          `Current range: ${daysDifference} days`
        );
        return;
      }

      setLoading(true);
      
      const formData: StockAnalysisFormData = {
        stockName,
        timeFrame,
        startDate: startDate?.toISOString() || null,
        endDate: endDate?.toISOString() || null
      };

      setShouldFetchNews(true);
      const [analysisResult, newsData] = await Promise.all([
        stockService.analyzeStock(formData),
        stockService.getStockNews(stockName)
      ]);

      // Create new analysis entry
      const newAnalysis: StoredAnalysis = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        stockName,
        timeFrame,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        analysisImage: analysisResult.plot,
        interpretation: analysisResult.interpretation,
        lastOHLC: analysisResult.last_ohlc,
        newsData
      };

      // Update state and local storage
      const updatedHistory = [newAnalysis, ...analysisHistory].slice(0, 10); // Keep last 10 analyses
      setAnalysisHistory(updatedHistory);
      localStorage.setItem('analysisHistory', JSON.stringify(updatedHistory));

      // Set current analysis
      setAnalysisImage(analysisResult.plot);
      setInterpretation(analysisResult.interpretation);
      setLastOHLC(analysisResult.last_ohlc);
      setNewsData(newsData);
      setIsAnalysisCompleted(true);
      
      showAnalysisComplete(analysisResult.interpretation);

    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error(
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">Analysis Failed</span>
          </div>
          <p className="text-sm opacity-90">
            Unable to complete analysis. Please try again.
          </p>
        </div>,
        toastStyles.error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setStockName('');
    setStartDate(null);
    setEndDate(null);
    setTimeFrame('');
    setAnalysisImage(null);
    setInterpretation(null);
    setLastOHLC(null);
    setNewsData([]);
    setShouldFetchNews(false);
    setIsAnalysisCompleted(false);
    setSuggestions([]);
    setSelectedAnalysisId(null);
  };

  const loadPreviousAnalysis = (analysis: StoredAnalysis) => {
    setStockName(analysis.stockName);
    setTimeFrame(analysis.timeFrame as TimeFrameOption);
    setStartDate(dayjs(analysis.startDate));
    setEndDate(dayjs(analysis.endDate));
    setAnalysisImage(analysis.analysisImage);
    setInterpretation(analysis.interpretation);
    setLastOHLC(analysis.lastOHLC);
    setNewsData(analysis.newsData);
    setIsAnalysisCompleted(true);
    setShouldFetchNews(false);
    setSelectedAnalysisId(analysis.id);
  };

  const addToWatchlist = (symbol: string) => {
    if (!watchlist.some(item => item.symbol === symbol)) {
      const updatedWatchlist = [
        { symbol, addedAt: new Date().toISOString() },
        ...watchlist
      ];
      setWatchlist(updatedWatchlist);
      localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
      toast.success(`Added ${symbol} to watchlist`);
    } else {
      toast.info(`${symbol} is already in your watchlist`);
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    const updatedWatchlist = watchlist.filter(item => item.symbol !== symbol);
    setWatchlist(updatedWatchlist);
    localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
    toast.info(`Removed ${symbol} from watchlist`);
  };

  const selectWatchlistStock = (symbol: string) => {
    setStockName(symbol);
    handleNewAnalysis();
  };

  const handleTimeFrameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as TimeFrameOption | "";
    setTimeFrame(value);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className={`min-h-screen ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-slate-100 via-white to-slate-100'
      }`}>
        {/* Enhanced Header */}
        <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-sm border-b border-slate-700 shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo and Title */}
              <div className="flex items-center space-x-3">
                <BarChart2 className="w-8 h-8 text-teal-500" />
                <h1 className="text-2xl font-bold text-white">
                  Stock Analysis Dashboard
                </h1>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                <button
                  className="px-4 py-2 text-slate-300 hover:text-white flex items-center gap-2 rounded-lg hover:bg-slate-800/50 transition-all"
                  onClick={() => toast.info('Help documentation coming soon!')}
                >
                  <HelpCircle className="w-5 h-5" />
                  <span>Help</span>
                </button>
                <button
                  className="px-4 py-2 text-slate-300 hover:text-white flex items-center gap-2 rounded-lg hover:bg-slate-800/50 transition-all"
                  onClick={() => setIsAboutOpen(true)}
                >
                  <Info className="w-5 h-5" />
                  <span>About</span>
                </button>
                <button
                  className="px-4 py-2 text-slate-300 hover:text-white flex items-center gap-2 rounded-lg hover:bg-slate-800/50 transition-all"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>
                <div className="w-px h-6 bg-slate-700" />
                <Button variant="outline" onClick={onLogout}>
                  Logout
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/50"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-slate-700 bg-slate-900/95 backdrop-blur-sm">
              <div className="container mx-auto px-4 py-3 space-y-2">
                <button
                  className="w-full px-4 py-2 text-left text-slate-300 hover:text-white flex items-center gap-2 rounded-lg hover:bg-slate-800/50"
                  onClick={() => toast.info('Help documentation coming soon!')}
                >
                  <HelpCircle className="w-5 h-5" />
                  <span>Help</span>
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-slate-300 hover:text-white flex items-center gap-2 rounded-lg hover:bg-slate-800/50"
                  onClick={() => setIsAboutOpen(true)}
                >
                  <Info className="w-5 h-5" />
                  <span>About</span>
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-slate-300 hover:text-white flex items-center gap-2 rounded-lg hover:bg-slate-800/50"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>
                <div className="border-t border-slate-700 pt-2">
                  <Button variant="outline" onClick={onLogout} className="w-full">
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Form Section */}
            <Card className="lg:col-span-1 bg-slate-800/50 backdrop-blur border border-slate-700">
              {isAnalysisCompleted ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Current Analysis</h3>
                    <Button 
                      onClick={handleNewAnalysis}
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      New Analysis
                    </Button>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
            <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Stock</span>
                        <span className="text-white font-medium">{stockName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Time Frame</span>
                        <span className="text-white font-medium">{timeFrame}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Date Range</span>
                        <span className="text-white font-medium">
                          {startDate?.format('DD/MM/YYYY')} - {endDate?.format('DD/MM/YYYY')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Analysis History */}
                  {analysisHistory.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-md font-medium text-slate-300 mb-3">Previous Analyses</h4>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {analysisHistory.map((analysis) => (
                          <button
                            key={analysis.id}
                            onClick={() => loadPreviousAnalysis(analysis)}
                            className={`w-full p-3 rounded-lg transition-colors text-left
                                      ${selectedAnalysisId === analysis.id 
                                        ? 'bg-teal-500/20 border-teal-500 hover:bg-teal-500/30' 
                                        : 'bg-slate-800/50 hover:bg-slate-700/50 border-slate-700'} 
                                      border transition-colors`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className={`font-medium ${
                                  selectedAnalysisId === analysis.id ? 'text-teal-400' : 'text-white'
                                }`}>
                                  {analysis.stockName}
                                </span>
                                <div className={`text-sm ${
                                  selectedAnalysisId === analysis.id ? 'text-teal-300/80' : 'text-slate-400'
                                }`}>
                                  {dayjs(analysis.timestamp).format('MMM D, YYYY h:mm A')}
                                </div>
                              </div>
                              <span className={`text-sm ${
                                selectedAnalysisId === analysis.id ? 'text-teal-300/80' : 'text-slate-400'
                              }`}>
                                {analysis.timeFrame}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  <form onSubmit={handleAnalysis} className="space-y-8">
                    {/* Enhanced Stock Symbol Input */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                          <Search className="text-teal-500" />
                          Stock/Index Symbol
                        </h2>
                        <Tooltip title="Enter NIFTY 500 stock symbols (e.g., RELIANCE, TCS)" arrow>
                          <Info className="w-4 h-4 text-slate-400 cursor-help" />
                        </Tooltip>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={stockName}
                          onChange={handleStockInputChange}
                          placeholder="Search for a stock..."
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white 
                                   placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500
                                   transition-all duration-200"
                        />
                        {suggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 
                                        rounded-lg shadow-xl max-h-60 overflow-auto">
                            {suggestions.map((suggestion) => (
                              <button
                                key={suggestion}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-700 
                                         flex items-center gap-2 transition-colors duration-150"
                              >
                                <ChevronRight className="w-4 h-4 text-teal-500" />
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Date Range Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                          <Calendar className="text-teal-500" />
                          Date Range
                        </h2>
                        <Tooltip title="Select date range based on your analysis timeframe" arrow>
                          <Info className="w-4 h-4 text-slate-400 cursor-help" />
                        </Tooltip>
                      </div>
                      <div className="space-y-4">
                        <DatePicker
                          label="Start Date"
                          value={startDate}
                          onChange={setStartDate}
                          slotProps={{
                            textField: {
                              variant: "outlined",
                              fullWidth: true,
                              sx: {
                                '& .MuiOutlinedInput-root': {
                                  backgroundColor: 'rgba(51, 65, 85, 0.5)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(51, 65, 85, 0.7)',
                                  },
                                },
                                '& .MuiOutlinedInput-input': {
                                  color: 'white',
                                },
                                '& .MuiInputLabel-root': {
                                  color: 'rgb(148, 163, 184)',
                                },
                              }
                            }
                          }}
                        />
                        <DatePicker
                          label="End Date"
                          value={endDate}
                          onChange={setEndDate}
                          minDate={startDate || undefined}
                          slotProps={{
                            textField: {
                              variant: "outlined",
                              fullWidth: true,
                              sx: {
                                '& .MuiOutlinedInput-root': {
                                  backgroundColor: 'rgba(51, 65, 85, 0.5)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(51, 65, 85, 0.7)',
                                  },
                                },
                                '& .MuiOutlinedInput-input': {
                                  color: 'white',
                                },
                                '& .MuiInputLabel-root': {
                                  color: 'rgb(148, 163, 184)',
                                },
                              }
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Enhanced Time Frame Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                          <BarChart2 className="text-teal-500" />
                          Time Frame
                        </h2>
                        <Tooltip title="Select analysis interval" arrow>
                          <Info className="w-4 h-4 text-slate-400 cursor-help" />
                        </Tooltip>
                      </div>
                      <div className="relative">
                        <select
                          value={timeFrame}
                          onChange={handleTimeFrameChange}
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 
                                   text-white focus:outline-none focus:ring-2 focus:ring-teal-500
                                   appearance-none cursor-pointer"
                        >
                          <option value="">Select time frame...</option>
                          {config.TIME_FRAME_OPTIONS.map(({ value, label }) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                        {timeFrame && (
                          <div className="mt-2 text-sm text-slate-400">
                            {timeFrameInfo[timeFrame as keyof typeof timeFrameInfo]}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      loading={loading}
                      className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 
                               hover:from-teal-600 hover:to-emerald-600 transition-all duration-200
                               relative overflow-hidden group"
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent 
                                       via-white/10 to-transparent -translate-x-full group-hover:translate-x-full 
                                       transition-transform duration-1000" />
                      <span className="relative flex items-center justify-center gap-2">
                        {loading ? (
                          <>Analyzing...</>
                        ) : (
                          <>
                            <BarChart2 className="w-5 h-5" />
                            Analyze Stock
                          </>
                        )}
                      </span>
                    </Button>
                  </form>

                  {/* Show previous analyses even in new analysis screen */}
                  {analysisHistory.length > 0 && (
                    <div className="pt-6 mt-6 border-t border-slate-700">
                      <h4 className="text-md font-medium text-slate-300 mb-3">Previous Analyses</h4>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {analysisHistory.map((analysis) => (
                          <button
                            key={analysis.id}
                            onClick={() => loadPreviousAnalysis(analysis)}
                            className={`w-full p-3 rounded-lg transition-colors text-left
                                      ${selectedAnalysisId === analysis.id 
                                        ? 'bg-teal-500/20 border-teal-500 hover:bg-teal-500/30' 
                                        : 'bg-slate-800/50 hover:bg-slate-700/50 border-slate-700'} 
                                      border transition-colors`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className={`font-medium ${
                                  selectedAnalysisId === analysis.id ? 'text-teal-400' : 'text-white'
                                }`}>
                                  {analysis.stockName}
                                </span>
                                <div className={`text-sm ${
                                  selectedAnalysisId === analysis.id ? 'text-teal-300/80' : 'text-slate-400'
                                }`}>
                                  {dayjs(analysis.timestamp).format('MMM D, YYYY h:mm A')}
                                </div>
                              </div>
                              <span className={`text-sm ${
                                selectedAnalysisId === analysis.id ? 'text-teal-300/80' : 'text-slate-400'
                              }`}>
                                {analysis.timeFrame}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Results Section */}
            <div className="lg:col-span-2 space-y-6 analysis-results">
              {/* Analysis Tabs */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setActiveTab('chart')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 
                             flex items-center gap-2 relative group ${
                      activeTab === 'chart'
                        ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                    }`}
                >
                  <LineChart className={`w-5 h-5 transition-colors duration-300 ${
                    activeTab === 'chart' ? 'text-white' : 'text-teal-500'
                  }`} />
                  Technical Analysis
                  {activeTab === 'chart' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white/50 
                                    scale-x-100 transition-transform duration-300" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('sentiment')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 
                             flex items-center gap-2 relative group ${
                      activeTab === 'sentiment'
                        ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                    }`}
                >
                  <MessageCircle className={`w-5 h-5 transition-colors duration-300 ${
                    activeTab === 'sentiment' ? 'text-white' : 'text-teal-500'
                  }`} />
                  Sentiment Analysis
                  {activeTab === 'sentiment' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white/50 
                                    scale-x-100 transition-transform duration-300" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('watchlist')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 
                             flex items-center gap-2 relative group ${
            activeTab === 'watchlist'
              ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20'
              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
          }`}
                >
                  <Star className={`w-5 h-5 transition-colors duration-300 ${
                    activeTab === 'watchlist' ? 'text-white' : 'text-yellow-500'
                  }`} />
                  Watchlist
                  {activeTab === 'watchlist' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white/50 
                                    scale-x-100 transition-transform duration-300" />
                  )}
                </button>
            </div>

              {/* Analysis Results with conditional rendering */}
              {activeTab === 'chart' ? (
                analysisImage && (
                  <>
                    {dashboardLayout.showChart && (
                      <Card className="bg-slate-800/50 backdrop-blur border border-slate-700">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                          <LineChart className="text-teal-500" />
                          Technical Analysis Result
                        </h2>
                        <img 
                          src={analysisImage} 
                          alt="Stock Analysis Result" 
                          className="w-full rounded-lg transition-transform duration-300 hover:scale-[1.02]" 
                        />
                      </Card>
                    )}

                    {dashboardLayout.showOHLC && lastOHLC && (
                      <OHLCDisplay data={lastOHLC} />
                    )}
                    
                    {dashboardLayout.showInterpretation && interpretation && (
                      <AnalysisPanel 
                        interpretation={interpretation} 
                        lastOHLC={lastOHLC}
                        onAddToWatchlist={addToWatchlist}
                        onRemoveFromWatchlist={removeFromWatchlist}
                        stockSymbol={stockName}
                        isInWatchlist={watchlist.some(item => item.symbol === stockName)}
                      />
                    )}
                  </>
                )
              ) : activeTab === 'sentiment' ? (
                dashboardLayout.showNews && (
                  <SentimentAnalysis 
                    newsData={newsData} 
                    symbol={stockName}
                    shouldFetch={shouldFetchNews}
                    key={selectedAnalysisId || 'new'}
                  />
                )
              ) : (
                <WatchlistTab
                  watchlist={watchlist}
                  onAddToWatchlist={addToWatchlist}
                  onRemoveFromWatchlist={removeFromWatchlist}
                  onSelectStock={selectWatchlistStock}
                  currentStock={stockName}
                />
              )}
            </div>
          </div>
        </main>

        {/* Settings Modal */}
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
        <AboutModal 
          isOpen={isAboutOpen}
          onClose={() => setIsAboutOpen(false)}
        />
      </div>
    </LocalizationProvider>
  );
}