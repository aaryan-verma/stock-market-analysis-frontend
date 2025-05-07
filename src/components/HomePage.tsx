import { useState, useEffect } from "react";
import { Search, Calendar, BarChart2, ChevronRight, Settings, HelpCircle, Menu, X, LineChart, AlertCircle, CheckCircle2, XCircle, Star, Info, RotateCcw, MessageCircle, Brain, Mail } from "lucide-react";
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
import { HelpModal } from './HelpModal';
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

const showAnalysisComplete = () => {
  toast.success(
    <div onClick={() => {
      document.querySelector('.analysis-results')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }}>
        <span className="font-semibold">Analysis Completed</span>
    </div>,
    {
      ...toastStyles.success,
      className: 'analysis-toast',
      toastId: 'analysis-complete',
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

// Add CSS animation styles
const animatedBorderStyles = `
@keyframes borderAnimation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animated-border-button {
  position: relative;
  border: none;
  overflow: hidden;
  z-index: 1;
}

.animated-border-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 0.5rem;
  padding: 2px;
  background: linear-gradient(
    45deg,
    #4f46e5,
    #6366f1,
    #818cf8,
    #a5b4fc,
    #6366f1,
    #4f46e5
  );
  background-size: 400% 400%;
  animation: borderAnimation 3s ease infinite;
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  z-index: -1;
}
`;

export function HomePage({ onLogout }: HomePageProps) {
  const { defaultDates, getDefaultStartDate, getDefaultEndDate } = useSettings();
  const [stockName, setStockName] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrameOption | "">(defaultDates.defaultTimeframe as TimeFrameOption || "");
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
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { theme, dashboardLayout } = useSettings();
  const location = useLocation();
  const [shouldFetchNews, setShouldFetchNews] = useState(false);
  const [isAnalysisCompleted, setIsAnalysisCompleted] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<StoredAnalysis[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    // Always set dates based on settings when changing routes
    // or when defaultDates change
    const start = dayjs(getDefaultStartDate());
    const end = dayjs(getDefaultEndDate());
    
    console.log('Setting dates from defaults:');
    console.log(`Start: ${start.format('YYYY-MM-DD')}`);
    console.log(`End: ${end.format('YYYY-MM-DD')}`);
    
    setStartDate(start);
    setEndDate(end);
    
    // Set timeframe from settings if not already set
    if (!timeFrame) {
      setTimeFrame(defaultDates.defaultTimeframe as TimeFrameOption);
    }
    
    // Existing code for loading history
    const storedHistory = localStorage.getItem('analysisHistory');
    if (storedHistory) {
      setAnalysisHistory(JSON.parse(storedHistory));
    }
    const savedWatchlist = localStorage.getItem('watchlist');
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, [location.pathname, defaultDates, getDefaultStartDate, getDefaultEndDate]);

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
        aiAnalysis: analysisResult.ai_analysis,
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
      
      // Show analysis complete toast without interpretation text
      showAnalysisComplete();

    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error(
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">Analysis Failed</span>
          </div>
          <p className="text-sm opacity-90">Unable to complete analysis. Please try again.</p>
          <p className="text-xs opacity-75 mt-1">
            {error instanceof Error ? error.message : 'Unknown error'}
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
    
    const start = dayjs(getDefaultStartDate());
    const end = dayjs(getDefaultEndDate());
    
    console.log('Setting dates for new analysis:');
    console.log(`Start: ${start.format('YYYY-MM-DD')}`);
    console.log(`End: ${end.format('YYYY-MM-DD')}`);
    
    setStartDate(start);
    setEndDate(end);
    
    setTimeFrame(defaultDates.defaultTimeframe as TimeFrameOption);
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
    
    // Parse the date strings and ensure they are valid dates
    const startDateObj = dayjs(analysis.startDate);
    const endDateObj = dayjs(analysis.endDate);
    
    console.log('Loading previous analysis dates:');
    console.log(`Start: ${startDateObj.format('YYYY-MM-DD')}`);
    console.log(`End: ${endDateObj.format('YYYY-MM-DD')}`);
    
    setStartDate(startDateObj);
    setEndDate(endDateObj);
    
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
      <div className={`min-h-screen bg-slate-900 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
        {/* Header */}
        <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-20">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BarChart2 className="text-teal-500 w-6 h-6" />
              <h1 className="text-xl font-bold text-white hidden sm:block">Stock Market Analysis</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setIsHelpOpen(true)}
                className="p-2 text-slate-300 hover:text-white flex items-center gap-2"
              >
                <HelpCircle className="w-5 h-5" />
                <span>Help</span>
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-slate-300 hover:text-white flex items-center gap-2"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
              <button
                onClick={() => setIsAboutOpen(true)}
                className="p-2 text-slate-300 hover:text-white flex items-center gap-2"
              >
                <Info className="w-5 h-5" />
                <span>About</span>
              </button>
              <Button
                onClick={onLogout}
                className="bg-red-500/20 text-red-300 hover:bg-red-500/30"
              >
                Logout
              </Button>
            </nav>
            
            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <Button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
                variant="outline"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Navigation Dropdown */}
          {isMenuOpen && (
            <div className="container mx-auto px-4 py-4 bg-slate-800 border-t border-slate-700 md:hidden">
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => {
                    setIsHelpOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="p-2 text-slate-300 hover:text-white flex items-center gap-2"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span>Help</span>
                </button>
                <button
                  onClick={() => {
                    setIsSettingsOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="p-2 text-slate-300 hover:text-white flex items-center gap-2"
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {
                    setIsAboutOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="p-2 text-slate-300 hover:text-white flex items-center gap-2"
                >
                  <Info className="w-5 h-5" />
                  <span>About</span>
                </button>
                <Button
                  onClick={onLogout}
                  className="bg-red-500/20 text-red-300 hover:bg-red-500/30 w-full justify-center"
                >
                  Logout
                </Button>
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
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
                      <style>{animatedBorderStyles}</style>
                      
                      {/* PDF Generation Button - Always Visible */}
                      <div className="mb-4 p-3 rounded-lg bg-slate-800/40 border border-slate-700">
                        <div className="flex items-center gap-3 mb-2">
                          <Brain className="w-5 h-5 text-indigo-400" />
                          <h4 className="text-md font-medium text-indigo-300">AI Analysis Export</h4>
                        </div>
                        <p className="text-sm text-slate-400 mb-3">Generate a detailed PDF report with AI insights and technical analysis.</p>
                        <button
                          onClick={() => {
                            // Use the selected analysis if available, otherwise use the first one
                            const analysisToUse = selectedAnalysisId 
                              ? analysisHistory.find(a => a.id === selectedAnalysisId)
                              : analysisHistory[0];
                              
                            if (analysisToUse?.aiAnalysis) {
                              // Pass the analysis to the AnalysisPanel's PDF generation function
                              const analysisPanel = document.querySelector('.analysis-results');
                              if (analysisPanel) {
                                const event = new CustomEvent('generatePdf', {
                                  detail: { 
                                    aiAnalysis: analysisToUse.aiAnalysis, 
                                    stockSymbol: analysisToUse.stockName,
                                    showEmailForm: true,  // Add flag to show email form
                                    authToken: localStorage.getItem('accessToken') // Pass the auth token
                                  }
                                });
                                analysisPanel.dispatchEvent(event);
                              }
                            } else {
                              toast.info("Please select an analysis with AI data first");
                            }
                          }}
                          className="animated-border-button w-full px-4 py-2.5 bg-indigo-600/20 text-indigo-300 
                                    rounded-lg hover:bg-indigo-600/30 transition duration-300 
                                    flex items-center justify-center gap-2"
                        >
                          <Mail className="w-4 h-4" />
                          Email Analysis Report
                        </button>
                      </div>
                      
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
                          placeholder="Search for a NIFTY 500 stock..."
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
              {/* Analysis Tabs - Responsive version */}
              <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 overflow-x-auto pb-2">
                <button
                  onClick={() => setActiveTab('chart')}
                  className={`px-3 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-all duration-300 
                             flex items-center gap-1 sm:gap-2 relative group flex-shrink-0 text-sm sm:text-base ${
                    activeTab === 'chart'
                      ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <LineChart className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${
                    activeTab === 'chart' ? 'text-white' : 'text-teal-500'
                  }`} />
                  <span>Technical Analysis</span>
                  {activeTab === 'chart' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white/50 
                                  scale-x-100 transition-transform duration-300" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('sentiment')}
                  className={`px-3 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-all duration-300 
                             flex items-center gap-1 sm:gap-2 relative group flex-shrink-0 text-sm sm:text-base ${
                    activeTab === 'sentiment'
                      ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <MessageCircle className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${
                    activeTab === 'sentiment' ? 'text-white' : 'text-teal-500'
                  }`} />
                  <span>Sentiment</span>
                  {activeTab === 'sentiment' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white/50 
                                  scale-x-100 transition-transform duration-300" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('watchlist')}
                  className={`px-3 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-all duration-300 
                             flex items-center gap-1 sm:gap-2 relative group flex-shrink-0 text-sm sm:text-base ${
                    activeTab === 'watchlist'
                      ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <Star className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${
                    activeTab === 'watchlist' ? 'text-white' : 'text-yellow-500'
                  }`} />
                  <span>Watchlist</span>
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
                        aiAnalysis={selectedAnalysisId 
                          ? analysisHistory.find(a => a.id === selectedAnalysisId)?.aiAnalysis 
                          : analysisHistory[0]?.aiAnalysis}
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
        <HelpModal 
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
        />
      </div>
    </LocalizationProvider>
  );
}