import React from 'react';
import { Star, Trash2, Plus, AlertTriangle } from 'lucide-react';
import { Card } from './common/Card';
import { Button } from './common/Button';

interface WatchlistItem {
  symbol: string;
  addedAt: string;
}

interface WatchlistTabProps {
  watchlist: WatchlistItem[];
  onAddToWatchlist: (symbol: string) => void;
  onRemoveFromWatchlist: (symbol: string) => void;
  onSelectStock: (symbol: string) => void;
  currentStock?: string;
}

export function WatchlistTab({ 
  watchlist, 
  onAddToWatchlist, 
  onRemoveFromWatchlist,
  onSelectStock,
  currentStock 
}: WatchlistTabProps) {
  const [newSymbol, setNewSymbol] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSymbol.trim()) {
      onAddToWatchlist(newSymbol.trim().toUpperCase());
      setNewSymbol('');
    }
  };

  return (
    <Card>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <Star className="text-yellow-500" />
            Watchlist
          </h2>
        </div>

        {/* Add Stock Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            placeholder="Add stock symbol..."
            className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 
                     text-white placeholder-slate-400 focus:outline-none focus:ring-2 
                     focus:ring-yellow-500"
          />
          <Button type="submit">
            <Plus className="w-5 h-5" />
          </Button>
        </form>

        {/* Watchlist */}
        <div className="space-y-2">
          {watchlist.length === 0 ? (
            <div className="text-center py-8 text-slate-400 flex flex-col items-center gap-2">
              <AlertTriangle className="w-8 h-8 text-yellow-500/50" />
              <p>Your watchlist is empty</p>
            </div>
          ) : (
            watchlist.map((item) => (
              <div
                key={item.symbol}
                className={`flex items-center justify-between p-3 rounded-lg border
                          transition-all duration-200 ${
                  currentStock === item.symbol
                    ? 'bg-yellow-500/20 border-yellow-500'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <button
                  onClick={() => onSelectStock(item.symbol)}
                  className="flex-1 text-left flex items-center gap-3"
                >
                  <span className="text-white font-medium">{item.symbol}</span>
                  <span className="text-sm text-slate-400">
                    Added {new Date(item.addedAt).toLocaleDateString()}
                  </span>
                </button>
                <button
                  onClick={() => onRemoveFromWatchlist(item.symbol)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
} 