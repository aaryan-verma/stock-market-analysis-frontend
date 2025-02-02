import { TrendingUp, TrendingDown, Clock, ArrowUpRight, ArrowDownRight, Target } from 'lucide-react';
import { Card } from './common/Card';

interface OHLCDisplayProps {
  data: {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    change: number;
  };
}

export function OHLCDisplay({ data }: OHLCDisplayProps) {
  const isPositive = data.change >= 0;
  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  
  const metrics = [
    { 
      label: 'Open',
      value: formatPrice(data.open),
      icon: Clock,
      color: 'text-blue-500'
    },
    { 
      label: 'High',
      value: formatPrice(data.high),
      icon: ArrowUpRight,
      color: 'text-green-500'
    },
    { 
      label: 'Low',
      value: formatPrice(data.low),
      icon: ArrowDownRight,
      color: 'text-red-500'
    },
    { 
      label: 'Close',
      value: formatPrice(data.close),
      icon: Target,
      color: 'text-purple-500'
    }
  ];

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-200">Last Candle OHLC</h2>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
            isPositive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
          }`}>
            {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            <span className="font-semibold">{data.change.toFixed(2)}%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="p-3 bg-slate-800 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={18} className={color} />
                <span className="text-slate-400">{label}</span>
              </div>
              <div className="text-lg font-semibold text-slate-200">
                {value}
              </div>
            </div>
          ))}
        </div>

        <div className="text-sm text-slate-400 text-right">
          {data.date}
        </div>
      </div>
    </Card>
  );
} 