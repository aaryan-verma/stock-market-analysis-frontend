import api from './api';
import { StockAnalysisFormData } from '../types/stock';
import dayjs from 'dayjs';
import { getStockISIN, isStockIndex } from '../constants/stocks';

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
  ai_analysis?: any; // Add AI analysis to the result type
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
      
      // Get the ISIN for the selected stock
      const isin = getStockISIN(data.stockName);
      
      // Check if the stock is an index
      const isIndex = isStockIndex(data.stockName);
      
      const response = await api.get(`/visualization/plot/${data.stockName}`, {
        params: {
          start_date: startDate,
          end_date: endDate,
          period: data.timeFrame.charAt(0).toUpperCase(), // Convert 'daily' to 'D', 'weekly' to 'W', etc.
          isin: isin, // Include ISIN in the request
          is_index: isIndex // Indicate if this is an index
        }
      });
      
      // Extract the interpretation from the response - prioritize AI analysis if available
      let interpretation = '';
      
      if (response.data.ai_analysis && response.data.ai_analysis.report && 
          response.data.ai_analysis.report.price_interpretation) {
        // Use AI analysis if available
        interpretation = response.data.ai_analysis.report.price_interpretation;
      } else if (response.data.interpretation) {
        // Fallback to basic interpretation
        interpretation = response.data.interpretation;
      } else {
        interpretation = "Technical analysis based on price levels and market conditions.";
      }
      
      // Convert candle data to last_ohlc format
      const lastOHLC: LastOHLC = {
        date: new Date().toISOString().split('T')[0], // Use current date
        open: response.data.candle?.Open || 0,
        high: response.data.candle?.High || 0,
        low: response.data.candle?.Low || 0,
        close: response.data.candle?.Close || 0,
        change: 0, // This might need calculation
        volume: response.data.candle?.Volume || 0,
        averageVolume: 0 // Not provided in the new response
      };
      
      // Calculate change percentage if possible
      if (lastOHLC.open > 0 && lastOHLC.close > 0) {
        lastOHLC.change = ((lastOHLC.close - lastOHLC.open) / lastOHLC.open) * 100;
      }
      
      return {
        plot: `data:image/png;base64,${response.data.plot}`,
        interpretation: interpretation,
        last_ohlc: lastOHLC,
        ai_analysis: response.data.ai_analysis // Pass through the entire AI analysis
      };
    } catch (error) {
      console.error('Error analyzing stock:', error);
      throw new Error('Failed to analyze stock');
    }
  },

  async getStockNews(symbol: string): Promise<NewsItem[]> {
    try {
      // Get the ISIN for the selected stock
      const isin = getStockISIN(symbol);
      
      // Check if the stock is an index
      const isIndex = isStockIndex(symbol);
      
      const response = await api.get(`/news/${symbol}`, {
        params: {
          isin: isin, // Include ISIN in the request
          is_index: isIndex // Indicate if this is an index
        }
      });
      return response.data.news;
    } catch (error) {
      console.error('Error fetching news:', error);
      throw new Error('Failed to fetch news data');
    }
  }
}; 