import { X, HelpCircle, ExternalLink, Search, BarChart2, PieChart, Brain, Mail } from 'lucide-react';
import { Button } from './common/Button';
import { useState } from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<'getting-started' | 'analysis' | 'charts' | 'ai-features' | 'faq' | 'technology'>('getting-started');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl mx-4 overflow-hidden flex flex-col" style={{ height: '650px' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-teal-500" />
            Help Center
          </h2>
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
                onClick={() => setActiveTab('getting-started')}
                className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                  activeTab === 'getting-started' 
                    ? 'bg-slate-700/80 text-white' 
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <Search className="w-5 h-5" />
                <span>Getting Started</span>
              </button>
              
              <button
                onClick={() => setActiveTab('analysis')}
                className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                  activeTab === 'analysis' 
                    ? 'bg-slate-700/80 text-white' 
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <BarChart2 className="w-5 h-5" />
                <span>Stock Analysis</span>
              </button>
              
              <button
                onClick={() => setActiveTab('charts')}
                className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                  activeTab === 'charts' 
                    ? 'bg-slate-700/80 text-white' 
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <PieChart className="w-5 h-5" />
                <span>Charts & Indicators</span>
              </button>
              
              <button
                onClick={() => setActiveTab('ai-features')}
                className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                  activeTab === 'ai-features' 
                    ? 'bg-slate-700/80 text-white' 
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <Brain className="w-5 h-5" />
                <span>AI Features</span>
              </button>
              
              <button
                onClick={() => setActiveTab('faq')}
                className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                  activeTab === 'faq' 
                    ? 'bg-slate-700/80 text-white' 
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <HelpCircle className="w-5 h-5" />
                <span>FAQ</span>
              </button>
              
              <button
                onClick={() => setActiveTab('technology')}
                className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                  activeTab === 'technology' 
                    ? 'bg-slate-700/80 text-white' 
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <ExternalLink className="w-5 h-5" />
                <span>Technology</span>
              </button>
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-grow p-6 overflow-y-auto" style={{ minHeight: '450px' }}>
            {/* Getting Started Tab */}
            {activeTab === 'getting-started' && (
              <section className="h-full min-h-[450px] space-y-6">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <Search className="text-teal-500" />
                  Getting Started
                </h3>
                
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                    <h4 className="font-medium text-white mb-2">Search for a NIFTY 500 Stock</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Enter a valid NIFTY 500 stock symbol (e.g., RELIANCE, TCS, INFY) in the search bar at the top of the page. 
                      You can also search by company name, and the platform will suggest relevant NIFTY 500 stock symbols.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                    <h4 className="font-medium text-white mb-2">Platform Features</h4>
                    <p className="text-slate-300 text-sm leading-relaxed mb-2">
                      Our platform offers a comprehensive suite of tools for analyzing NIFTY 500 stocks:
                    </p>
                    <ul className="space-y-2 ml-2">
                      <li className="flex items-start gap-2 text-slate-300 text-sm">
                        <span className="text-teal-500 mt-1">•</span>
                        <span>AI-powered technical analysis with pattern recognition and predictive insights</span>
                      </li>
                      <li className="flex items-start gap-2 text-slate-300 text-sm">
                        <span className="text-teal-500 mt-1">•</span>
                        <span>Advanced visualization tools with interactive charts and technical indicators</span>
                      </li>
                      <li className="flex items-start gap-2 text-slate-300 text-sm">
                        <span className="text-teal-500 mt-1">•</span>
                        <span>Price level analysis with support/resistance identification</span>
                      </li>
                      <li className="flex items-start gap-2 text-slate-300 text-sm">
                        <span className="text-teal-500 mt-1">•</span>
                        <span>Sentiment analysis based on news and market data</span>
                      </li>
                      <li className="flex items-start gap-2 text-slate-300 text-sm">
                        <span className="text-teal-500 mt-1">•</span>
                        <span>PDF report generation and email delivery capabilities</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                    <h4 className="font-medium text-white mb-2">Configure Analysis Settings</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Select your desired date range and timeframe from the dropdown menus. The platform will use these
                      parameters to fetch and analyze the NIFTY 500 stock data. You can customize default values in the Settings panel.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                    <h4 className="font-medium text-white mb-2">View Analysis Results</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      After searching for a stock, the platform will display a comprehensive analysis including technical charts, 
                      price data, and AI-powered insights. You can customize which components are visible in the Settings panel.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                    <h4 className="font-medium text-white mb-2">Save and Share Analysis</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Add stocks to your watchlist for quick access in the future. Generate PDF reports of your analysis
                      or email them directly to yourself or others for later reference.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Stock Analysis Tab */}
            {activeTab === 'analysis' && (
              <section className="h-full min-h-[450px] space-y-6">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <BarChart2 className="text-teal-500" />
                  Stock Analysis Basics
                </h3>
                
                <div className="space-y-4">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Our platform offers comprehensive stock analysis through multiple approaches:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                      <h4 className="font-medium text-white mb-2">Technical Analysis</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        We use price and volume data to calculate key technical indicators and chart patterns to help identify
                        potential entry and exit points. These include moving averages, RSI, MACD, Bollinger Bands, and more.
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                      <h4 className="font-medium text-white mb-2">Price Levels</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        The platform calculates important support and resistance levels based on historical price action. 
                        These levels can help identify potential reversal points and price targets.
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                      <h4 className="font-medium text-white mb-2">Risk Analysis</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        Each stock analysis includes risk assessment with volatility measures and suggested position sizing.
                        The platform also provides recommended stop-loss levels to help manage potential downside.
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                      <h4 className="font-medium text-white mb-2">Trend Identification</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        Our analysis helps identify the current market trend (bullish, bearish, or neutral) and strength of the trend
                        to assist in making more informed trading decisions aligned with the overall market direction.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Charts & Indicators Tab */}
            {activeTab === 'charts' && (
              <section className="h-full min-h-[450px] space-y-6">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <PieChart className="text-teal-500" />
                  Charts & Indicators Guide
                </h3>
                
                <div className="space-y-6">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Understanding how to read charts and technical indicators is essential for effective stock analysis:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                      <h4 className="font-medium text-white mb-2">Candlestick Charts</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        Our platform uses candlestick charts to display price action. Each candle shows the open, high, low, and close prices
                        for the selected timeframe. Green candles indicate price increases, while red candles show decreases.
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                      <h4 className="font-medium text-white mb-2">Moving Averages</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        Moving averages smooth out price data to identify trends. We display both simple (SMA) and exponential (EMA)
                        moving averages. Crossovers between these lines can signal potential trend changes.
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                      <h4 className="font-medium text-white mb-2">RSI (Relative Strength Index)</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        RSI measures the speed and magnitude of price movements on a scale from 0 to 100. Values above 70 typically
                        indicate overbought conditions, while values below 30 suggest oversold conditions.
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                      <h4 className="font-medium text-white mb-2">MACD (Moving Average Convergence Divergence)</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        MACD shows the relationship between two moving averages. The indicator consists of the MACD line, signal line,
                        and histogram. Crossovers and divergences can signal potential trading opportunities.
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                    <h4 className="font-medium text-white mb-2">Chart Patterns</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Our AI analysis identifies common chart patterns such as head and shoulders, double tops/bottoms, triangles,
                      and flag patterns. These formations can help predict potential price movements when they complete.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* AI Features Tab */}
            {activeTab === 'ai-features' && (
              <section className="h-full min-h-[450px] space-y-6">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <Brain className="text-teal-500" />
                  AI-Powered Analysis
                </h3>
                
                <p className="text-slate-300 text-sm leading-relaxed">
                  Our platform leverages advanced AI capabilities to enhance your stock analysis experience:
                </p>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                    <h4 className="font-medium text-white mb-2">Pattern Recognition</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Our AI analyzes historical price patterns and identifies relevant chart formations, providing insights
                      that might be missed in manual analysis. The system constantly improves as it processes more data.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                    <h4 className="font-medium text-white mb-2">Comprehensive Reports</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Generate detailed AI-powered analysis reports that include technical evaluations, risk assessments,
                      potential entry/exit points, and price targets. These reports can be downloaded as PDFs or emailed.
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-teal-500" />
                      <span className="text-slate-300 text-xs">Use the "Email Report" button to send analysis directly to your inbox</span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                    <h4 className="font-medium text-white mb-2">Market Sentiment Analysis</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Our AI evaluates overall market sentiment for each stock by analyzing technical indicators and price action.
                      The analysis provides a confidence score to help gauge the reliability of the predictions.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                    <h4 className="font-medium text-white mb-2">Trading Opportunities</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      The AI identifies potential trading opportunities based on current market conditions and historical patterns.
                      These suggestions include rationale and risk assessments to help inform your trading decisions.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <section className="h-full min-h-[450px]">
                <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
                  <HelpCircle className="text-teal-500" />
                  Frequently Asked Questions
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                    <h4 className="font-medium text-white mb-2">How often is the stock data updated?</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      For daily timeframes and above, data is updated at the end of each trading day. For intraday timeframes,
                      data is updated with a 15-minute delay for non-premium users.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                    <h4 className="font-medium text-white mb-2">What markets and assets are covered?</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Currently, the platform only covers NIFTY 500 stocks from the Indian market (NSE). We focus exclusively
                      on providing accurate analysis for these 500 companies.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                    <h4 className="font-medium text-white mb-2">How are the AI predictions generated?</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Our AI model analyzes historical price patterns, technical indicators, and market relationships to generate
                      predictions. The system has been trained on decades of NIFTY 500 stock data to identify relevant patterns.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                    <h4 className="font-medium text-white mb-2">Can I customize the analysis parameters?</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Yes, you can customize date ranges, timeframes, and which components are displayed. Advanced users can also
                      adjust specific technical indicator parameters in the Settings panel.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                    <h4 className="font-medium text-white mb-2">How do I report issues or request features?</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Click on the feedback button in the bottom-right corner of the screen to submit bug reports or feature requests.
                      Our team reviews all submissions and prioritizes improvements based on user feedback.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Technology Stack Tab */}
            {activeTab === 'technology' && (
              <section className="h-full min-h-[450px] space-y-6">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <ExternalLink className="text-teal-500" />
                  Technology Stack
                </h3>
                
                <div className="space-y-6">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Our platform is built with modern technologies to deliver reliable, high-performance stock analysis:
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                      <h4 className="font-medium text-white mb-2">Frontend</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        Built with React and TypeScript for type safety and maintainability. Uses Tailwind CSS for styling
                        and Lucide React for icons. Chart visualizations are powered by advanced charting libraries optimized
                        for financial data.
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                      <h4 className="font-medium text-white mb-2">Backend</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        FastAPI Python backend for high-performance API endpoints. PostgreSQL database for reliable 
                        data storage and efficient querying of historical stock information. Background task processing 
                        for computationally intensive operations like AI analysis.
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                      <h4 className="font-medium text-white mb-2">AI & Data Analysis</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        Leveraging Hugging Face's AI models for technical pattern recognition and price predictions
                        specifically optimized for NIFTY 500 stocks. Uses pandas, numpy, and specialized financial 
                        libraries for data processing and technical indicator calculations.
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                      <h4 className="font-medium text-white mb-2">DevOps & Infrastructure</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        Deployed using containerization for consistent environments and easy scalability.
                        CI/CD pipelines for automated testing and deployment. Cloud-based infrastructure
                        for reliability and performance.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex justify-end items-center flex-shrink-0">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
} 