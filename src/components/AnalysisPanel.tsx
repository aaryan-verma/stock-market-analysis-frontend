import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, TrendingUp, AlertTriangle, Target, ArrowUpDown, Bell, BookmarkPlus, ChevronRight, BarChart2, Scale, BookmarkCheck, Trash2, Brain, Download, Mail } from 'lucide-react';
import { Card } from './common/Card';
import { toast } from 'react-toastify';
import { Button } from './common/Button';
import { LastOHLC } from '../types/stock';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { generatePDFTemplate } from './pdf/PDFTemplate';
import axios from 'axios';
import { config } from '../config';

interface AnalysisPanelProps {
  interpretation: string;
  lastOHLC: LastOHLC | null;
  onAddToWatchlist?: (symbol: string) => void;
  onRemoveFromWatchlist?: (symbol: string) => void;
  stockSymbol?: string;
  isInWatchlist?: boolean;
  aiAnalysis?: any; // Add AI analysis data
}

type TabType = 'summary' | 'levels' | 'signals' | 'risk';

export function AnalysisPanel({ 
  interpretation, 
  lastOHLC,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  stockSymbol,
  isInWatchlist = false,
  aiAnalysis // Add AI analysis data
}: AnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const pdfTemplateRef = useRef<HTMLDivElement>(null);
  const analysisPanelRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Use the useCallback hook for the onChange handler to prevent unnecessary re-renders
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientEmail(e.target.value);
  }, []);

  // Listen for the custom event from HomePage
  useEffect(() => {
    const handleGeneratePdfEvent = (event: CustomEvent) => {
      const { 
        aiAnalysis: eventAiAnalysis, 
        stockSymbol: eventStockSymbol, 
        showEmailForm,
        authToken 
      } = event.detail;
      
      if (eventAiAnalysis) {
        if (showEmailForm) {
          // Show the email form instead of directly generating the PDF
          setShowEmailForm(true);
          
          // Store the auth token in state if provided
          if (authToken) {
            // We'll save the token to use later when submitting the form
            // This is more secure than keeping it in a ref or another state variable
            localStorage.setItem('tempAuthToken', authToken);
          }
        } else {
          // Call PDF generation with the passed data
          handleGenerateAIAnalysisPDF(eventAiAnalysis, eventStockSymbol);
        }
      }
    };

    // Add event listener to current component
    const currentPanel = analysisPanelRef.current;
    if (currentPanel) {
      currentPanel.addEventListener('generatePdf', handleGeneratePdfEvent as EventListener);
    }

    // If we have a parent with the analysis-results class, also listen there
    const analysisResults = document.querySelector('.analysis-results');
    if (analysisResults) {
      analysisResults.addEventListener('generatePdf', handleGeneratePdfEvent as EventListener);
    }

    return () => {
      // Clean up event listeners
      if (currentPanel) {
        currentPanel.removeEventListener('generatePdf', handleGeneratePdfEvent as EventListener);
      }
      if (analysisResults) {
        analysisResults.removeEventListener('generatePdf', handleGeneratePdfEvent as EventListener);
      }
    };
  }, []);

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
    }
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

  // Function to compress an image
  const compressImage = async (dataUrl: string, maxWidth = 800): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = Math.floor(height * ratio);
        }
        
        // Create canvas and resize image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Convert to JPEG with 0.7 quality
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } else {
          // Fallback if context not available
          resolve(dataUrl);
        }
      };
      
      img.onerror = () => resolve(''); // Return empty string on error
      img.src = dataUrl;
    });
  };

  const handleGenerateAIAnalysisPDF = async (customAiAnalysis?: any, customStockSymbol?: string, emailRecipient?: string) => {
    // Use provided data or fall back to component props
    const analysisData = customAiAnalysis || aiAnalysis;
    const symbol = customStockSymbol || stockSymbol;
    
    if (!analysisData || !symbol) {
      toast.error("AI analysis data is not available for this stock");
      return;
    }

    try {
      setGeneratingPdf(true);
      
      // Find the plot image - first try to get it from the selected analysis in the HomePage
      let plotImage = '';
      
      // Look for the selected analysis in the HomePage component
      const selectedAnalysisId = new URLSearchParams(window.location.search).get('analysisId');
      if (selectedAnalysisId) {
        try {
          const analysisHistory = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
          const selectedAnalysis = analysisHistory.find((a: any) => a.id === selectedAnalysisId);
          if (selectedAnalysis?.analysisImage) {
            plotImage = selectedAnalysis.analysisImage;
          }
        } catch (e) {
          console.error('Error getting plot from localStorage:', e);
        }
      }
      
      // If we couldn't find the plot, look for it in the DOM
      if (!plotImage) {
        const chartImage = document.querySelector('.analysis-results img') as HTMLImageElement;
        if (chartImage && chartImage.src) {
          plotImage = chartImage.src;
        }
      }
      
      // Render the PDF template
      const pdfContent = document.createElement('div');
      pdfContent.style.position = 'absolute';
      pdfContent.style.left = '-9999px';
      pdfContent.style.top = '-9999px';
      
      const report = analysisData.report || {};
      
      // Use the PDFTemplate component to generate HTML
      pdfContent.innerHTML = generatePDFTemplate({
        symbol,
        plotImage,
        report
      });
      
      document.body.appendChild(pdfContent);
      
      try {
        // Create a PDF with pagination support
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // Render the entire template to canvas
        const canvas = await html2canvas(pdfContent.querySelector('#pdfTemplate') as HTMLElement, {
          scale: 1,
          useCORS: true,
          allowTaint: true,
          logging: false
        });
        
        // Calculate dimensions
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        
        // Add all pages needed
        let remainingHeight = imgHeight;
        let position = 0;
        
        // First page
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        
        // Add more pages if content overflows
        while (remainingHeight > pdfHeight) {
          // Move to the next page position
          position -= pdfHeight;
          remainingHeight -= pdfHeight;
          
          // Add a new page
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        }
        
        // If email is provided, send via email, otherwise download
        if (emailRecipient) {
          // Get PDF as base64
          const pdfData = pdf.output('datauristring');
          
          // Get auth token (first try the temp token from the event, then fallback to localStorage)
          const tempAuthToken = localStorage.getItem('tempAuthToken');
          const accessToken = tempAuthToken || localStorage.getItem('accessToken');
          
          // Clean up temp token if it exists
          if (tempAuthToken) {
            localStorage.removeItem('tempAuthToken');
          }
          
          try {
            // Set sending state to true before making the API call
            setIsSendingEmail(true);
            
            // Compress the plot image if it exists
            let compressedPlotImage = '';
            if (plotImage) {
              compressedPlotImage = await compressImage(plotImage);
            }
            
            const response = await axios.post(
              `${config.API_BASE_URL}/email/send-analysis`,
              {
                recipient_email: emailRecipient,
                stock_symbol: symbol,
                pdf_data: pdfData,
                plot_image: compressedPlotImage,
                analysis_summary: report
              },
              {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            // Show success toast with the background task message
            toast.success(
              <div>
                <p className="font-medium">Email processing started</p>
                <p className="text-sm mt-1">Your report will be delivered to {emailRecipient} shortly.</p>
              </div>, 
              { autoClose: 5000 }
            );
            
            setShowEmailForm(false);
            setRecipientEmail('');
          } catch (error) {
            console.error("Error sending email:", error);
            if (axios.isAxiosError(error) && error.response) {
              toast.error(`Failed to send email: ${error.response.data.detail || 'Server error'}`);
            } else {
              toast.error("Failed to send email. Please try again later.");
            }
          } finally {
            setIsSendingEmail(false);
          }
        } else {
          // Download the PDF
          pdf.save(`${symbol}_AI_Analysis.pdf`);
          toast.success("AI Analysis PDF has been generated and downloaded");
        }
      } finally {
        // Clean up
        document.body.removeChild(pdfContent);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate AI Analysis PDF");
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Content rendering based on active tab
  const getTabContent = (tab: TabType) => {
    switch (tab) {
      case 'summary':
        return (
          <div className="space-y-6">
            <div className="bg-slate-800/30 p-4 sm:p-6 rounded-xl border border-slate-700">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-blue-500/10 text-blue-400">
                    <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-medium text-white">
                      Analysis Summary
                    </h3>
                    <p className="text-sm text-slate-400">
                      AI-powered market interpretation
                    </p>
                  </div>
                </div>
                
                {/* Show stock price info if available for larger screens */}
                {lastOHLC && (
                  <div className="hidden sm:block py-2 px-4 rounded-lg bg-slate-800 border border-slate-700 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-slate-400 text-sm">Last Close:</span>
                      <span className="text-white font-mono font-medium">
                        ₹{lastOHLC.close.toFixed(2)}
                      </span>
                      <span className={`ml-2 ${
                        lastOHLC.change > 0 ? 'text-green-400' : lastOHLC.change < 0 ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        {lastOHLC.change > 0 ? '+' : ''}{lastOHLC.change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile price info */}
              {lastOHLC && (
                <div className="sm:hidden mb-4 py-2 px-4 rounded-lg bg-slate-800 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Last Close:</span>
                    <div>
                      <span className="text-white font-mono font-medium">
                        ₹{lastOHLC.close.toFixed(2)}
                      </span>
                      <span className={`ml-2 ${
                        lastOHLC.change > 0 ? 'text-green-400' : lastOHLC.change < 0 ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        {lastOHLC.change > 0 ? '+' : ''}{lastOHLC.change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* AI Analysis Card */}
              {aiAnalysis ? (
                <>
                  {/* Market Scenario Badge */}
                  {aiAnalysis.report && aiAnalysis.report.market_outlook && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        <span className="text-sm text-slate-400">Market Outlook</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                          getMarketStatus(aiAnalysis.report.market_outlook).textColor
                        } bg-slate-800`}>
                          {getMarketStatus(aiAnalysis.report.market_outlook).icon} {aiAnalysis.report.market_outlook}
                        </div>
                        
                        <div className="text-sm text-slate-300">
                          {aiAnalysis.report.confidence && (
                            <span>Confidence: <span className="text-white font-medium">{aiAnalysis.report.confidence}%</span></span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                
                  {/* Interpretation Text */}
                  {aiAnalysis.report && aiAnalysis.report.price_interpretation && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                        <span className="text-sm text-slate-400">Price Interpretation</span>
                      </div>
                      
                      <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                        {aiAnalysis.report.price_interpretation}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                // Basic interpretation (fallback)
                <div className="space-y-4">
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    {interpretation}
                  </p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 text-xs sm:text-sm"
                  onClick={() => toast.info('Alerts coming soon!')}
                >
                  <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
                  Set Alert
                </Button>
                
                {isInWatchlist ? (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 text-xs sm:text-sm bg-teal-500/10 border-teal-500 text-teal-400 
                               group relative hover:pr-9 sm:hover:pr-12 transition-all duration-300"
                    onClick={() => setShowConfirmDelete(true)}
                  >
                    <BookmarkCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Added to Watchlist</span>
                    <Trash2 
                      className="w-3 h-3 sm:w-4 sm:h-4 absolute right-3 opacity-0 group-hover:opacity-100 
                                text-red-400 transition-all duration-300" 
                    />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 text-xs sm:text-sm"
                    onClick={() => {
                      if (onAddToWatchlist && stockSymbol) {
                        onAddToWatchlist(stockSymbol);
                      }
                    }}
                    disabled={!stockSymbol}
                  >
                    <BookmarkPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                    Add to Watchlist
                  </Button>
                )}
              </div>
            </div>

            {/* Generate PDF Button */}
            {aiAnalysis && (
              <div className="mt-6">
                <Button
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600"
                  onClick={() => setShowEmailForm(true)}
                >
                  <Mail className="w-4 h-4" />
                  Email Analysis Report
                </Button>
              </div>
            )}
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
                        <span className="text-slate-200">Price above R3 but below R4</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-red-500 mt-0.5" />
                        <span className="text-slate-200">Price below S4 (Breakdown)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-red-500 mt-0.5" />
                        <span className="text-slate-200">Strong downward momentum below PP</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:  // risk tab
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Risk Assessment Card */}
              <Card className="p-6">
                <h3 className="text-lg font-medium text-white flex items-center gap-2 mb-6">
                  <AlertTriangle className="text-amber-500" />
                  Risk Assessment
                </h3>

                <div className="space-y-4">
                  {/* Risk Factors */}
                  <div className="space-y-3">
                    <h4 className="text-slate-300 font-medium">Market Risk Factors</h4>
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <div className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-amber-500 mt-0.5" />
                          <div>
                            <span className="text-white">Volatility</span>
                            <p className="text-sm text-slate-400 mt-1">
                              Current price movement shows above average volatility.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <div className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-amber-500 mt-0.5" />
                          <div>
                            <span className="text-white">Volume</span>
                            <p className="text-sm text-slate-400 mt-1">
                              Trading volume indicates moderate liquidity risk.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <div className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-amber-500 mt-0.5" />
                          <div>
                            <span className="text-white">Support Break</span>
                            <p className="text-sm text-slate-400 mt-1">
                              Risk of key support levels breaking under pressure.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Management Recommendations */}
                  <div className="mt-6">
                    <h4 className="text-slate-300 font-medium mb-3">Risk Management</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-5 h-5 text-red-500" />
                          <span className="text-white font-medium">Stop Loss</span>
                        </div>
                        <p className="text-sm text-slate-400">
                          Set 2-3% below entry point
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart2 className="w-5 h-5 text-blue-500" />
                          <span className="text-white font-medium">Position Size</span>
                        </div>
                        <p className="text-sm text-slate-400">
                          Maximum 5% of portfolio
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Scale className="w-5 h-5 text-green-500" />
                          <span className="text-white font-medium">Risk/Reward</span>
                        </div>
                        <p className="text-sm text-slate-400">
                          Minimum 1:2 ratio
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );
    }
  };

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

  // Email Form Component
  const EmailForm = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center">
      <div className={`bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 space-y-5 border border-slate-700 shadow-xl transform transition-all ${isSendingEmail ? 'opacity-70' : ''}`}>
        <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">Send Analysis Report</h3>
        <p className="text-slate-300">
          Enter an email address to receive the AI analysis report for {stockSymbol}.
        </p>
        {!isSendingEmail && (
          <div className="text-xs text-slate-400 bg-slate-700/50 p-3 rounded-md">
            <p>The report will be sent in the background. You can continue using the app while it processes.</p>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              ref={emailInputRef}
              defaultValue={recipientEmail}
              onChange={handleEmailChange}
              autoComplete="email"
              autoFocus
              disabled={isSendingEmail || generatingPdf}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="user@example.com"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowEmailForm(false);
                setRecipientEmail('');
                // Clean up temp token when canceling
                localStorage.removeItem('tempAuthToken');
              }}
              disabled={isSendingEmail || generatingPdf}
              className="disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const currentEmail = emailInputRef.current?.value || recipientEmail;
                if (currentEmail) {
                  handleGenerateAIAnalysisPDF(aiAnalysis, stockSymbol, currentEmail);
                } else {
                  toast.error("Please enter a valid email address");
                }
              }}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isSendingEmail || generatingPdf}
            >
              {isSendingEmail || generatingPdf ? (
                <>
                  <span className="animate-spin mr-2">
                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  {generatingPdf ? 'Generating PDF...' : 'Processing...'}
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Report
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Full-screen loading overlay */}
      {isSendingEmail && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="bg-slate-800/90 rounded-lg p-8 flex flex-col items-center justify-center space-y-4 border border-slate-700 shadow-2xl max-w-xs w-full mx-auto">
            <div className="animate-spin w-12 h-12 text-blue-500">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-white font-medium text-center">Sending email...</p>
            <p className="text-slate-300 text-sm text-center">Please wait while we process your request</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div ref={analysisPanelRef} className="analysis-panel">
      <Card className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 
                     backdrop-blur-sm border border-slate-700/50 shadow-xl">
        <div className="space-y-6">
          {/* Tab Navigation - Make it horizontally scrollable on mobile */}
          <div className="flex overflow-x-auto pb-2 hide-scrollbar border-b border-slate-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors 
                           ${activeTab === tab.id
                             ? `border-b-2 ${tab.color} text-white`
                             : 'border-transparent text-slate-400 hover:text-slate-200'
                           } whitespace-nowrap flex-shrink-0 text-xs sm:text-sm`}
              >
                <tab.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === tab.id ? tab.color : ''}`} />
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="pb-2">
            {getTabContent(activeTab)}
          </div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDelete && <ConfirmDialog />}
        
        {/* Email Form Dialog */}
        {showEmailForm && <EmailForm />}
      </Card>
    </div>
  );
} 