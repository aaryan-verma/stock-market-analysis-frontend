export interface StockAnalysisFormData {
  stockName: string;
  timeFrame: string;
  startDate: string | null;
  endDate: string | null;
}

export type TimeFrameOption = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface StoredAnalysis {
  id: string;
  timestamp: string;
  stockName: string;
  timeFrame: string;
  startDate: string;
  endDate: string;
  analysisImage: string;
  interpretation: string;
  lastOHLC: LastOHLC;
  newsData: NewsItem[];
}

export interface LastOHLC {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  volume: number;
  averageVolume: number;
}

export interface NewsItem {
  date: string;
  headline: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low';
} 