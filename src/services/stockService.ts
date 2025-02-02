import api from './api';
import { StockAnalysisFormData } from '../types/stock';
import dayjs from 'dayjs';

interface LastOHLC {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  volume: number;
  averageVolume: number;
}

interface AnalysisResult {
  plot: string;
  interpretation: string;
  last_ohlc: LastOHLC;
}

interface NewsItem {
  date: string;
  headline: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  url?: string;
  source?: string;
}

export const stockService = {
  async analyzeStock(data: StockAnalysisFormData): Promise<AnalysisResult> {
    try {
      // Convert dates to required format (DD-MM-YYYY)
      const startDate = dayjs(data.startDate).format('DD-MM-YYYY');
      const endDate = dayjs(data.endDate).format('DD-MM-YYYY');
      
      const response = await api.get(`/visualization/plot/${data.stockName}`, {
        params: {
          start_date: startDate,
          end_date: endDate,
          period: data.timeFrame.charAt(0).toUpperCase() // Convert 'daily' to 'D', 'weekly' to 'W', etc.
        }
      });
      
      return {
        plot: `data:image/png;base64,${response.data.plot}`,
        interpretation: response.data.interpretation,
        last_ohlc: {
          ...response.data.last_ohlc,
          volume: response.data.last_ohlc.volume || 0,
          averageVolume: response.data.last_ohlc.average_volume || 0
        }
      };
    } catch (error) {
      console.error('Error analyzing stock:', error);
      throw new Error('Failed to analyze stock');
    }
  },

  async getStockNews(symbol: string): Promise<NewsItem[]> {
    try {
      const response = await api.get(`/news/${symbol}`);
      return response.data.news;
    } catch (error) {
      console.error('Error fetching news:', error);
      throw new Error('Failed to fetch news data');
    }
  }
}; 