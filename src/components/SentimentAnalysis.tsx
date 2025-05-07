import { useState, useEffect } from 'react';
import { Newspaper, TrendingUp, TrendingDown, Calendar, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { Card } from './common/Card';
import { stockService } from '../services/stockService';
import { toast } from 'react-toastify';

interface NewsItem {
  date: string;
  headline: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  url?: string;
  summary?: string;
}

interface SentimentAnalysisProps {
  newsData: NewsItem[];
  symbol: string;
  shouldFetch?: boolean;
}

export function SentimentAnalysis({ newsData: initialNewsData, symbol, shouldFetch = false }: SentimentAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [newsData, setNewsData] = useState(initialNewsData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shouldFetch && symbol) {
      fetchNews();
    }
  }, [symbol, shouldFetch]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const freshNews = await stockService.getStockNews(symbol);
      setNewsData(freshNews);
    } catch (error) {
      console.error('Failed to refresh news:', error);
      setError('Failed to fetch news data');
      toast.error('Failed to fetch news data');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: NewsItem['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-500 bg-green-500/10';
      case 'negative':
        return 'text-red-500 bg-red-500/10';
      case 'neutral':
        return 'text-blue-500 bg-blue-500/10';
    }
  };

  const getImpactBadge = (impact: NewsItem['impact']) => {
    const baseClasses = "text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap";
    switch (impact) {
      case 'high':
        return `${baseClasses} bg-red-500/20 text-red-500`;
      case 'medium':
        return `${baseClasses} bg-yellow-500/20 text-yellow-500`;
      case 'low':
        return `${baseClasses} bg-blue-500/20 text-blue-500`;
    }
  };

  return (
    <Card>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-200 flex items-center gap-1.5 sm:gap-2">
            <Newspaper className="text-blue-500 w-5 h-5" />
            Market Sentiment
          </h2>
          <div className="flex items-center gap-2 sm:gap-4">
            {error && (
              <div className="flex items-center gap-1 sm:gap-2 text-red-500">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">Failed to load news</span>
              </div>
            )}
            {loading && <Loader2 className="animate-spin text-blue-500 w-4 h-4 sm:w-5 sm:h-5" />}
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {newsData.length === 0 ? (
            <div className="text-center text-slate-400 py-6 sm:py-8 text-sm sm:text-base">
              No news available for {symbol}
            </div>
          ) : (
            newsData.map((news, index) => (
              <div 
                key={index} 
                className={`p-3 sm:p-4 rounded-lg border-l-4 ${
                  getSentimentColor(news.sentiment)
                }`}
              >
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1 space-y-1.5 sm:space-y-2">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <Calendar className="text-slate-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm text-slate-400">{news.date}</span>
                      <span className={getImpactBadge(news.impact)}>
                        {news.impact.toUpperCase()} IMPACT
                      </span>
                      {news.url && (
                        <a 
                          href={news.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-400 flex items-center gap-1 ml-auto"
                        >
                          <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm hidden sm:inline">Read More</span>
                        </a>
                      )}
                    </div>
                    <p className="text-sm sm:text-base text-slate-200">{news.headline}</p>
                    {news.summary && (
                      <p className="text-xs sm:text-sm text-slate-400 mt-1 sm:mt-2">{news.summary}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 pt-1">
                    {news.sentiment === 'positive' ? (
                      <TrendingUp className="text-green-500 w-4 h-4 sm:w-5 sm:h-5" />
                    ) : news.sentiment === 'negative' ? (
                      <TrendingDown className="text-red-500 w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <div className="w-4 sm:w-6 h-0.5 bg-blue-500 rounded-full my-3" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
} 