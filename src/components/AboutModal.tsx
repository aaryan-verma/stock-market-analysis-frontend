import { X, BarChart2 } from 'lucide-react';
import { Button } from './common/Button';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart2 className="w-6 h-6 text-teal-500" />
            <h2 className="text-xl font-semibold text-white">About Me</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Professional Background</h3>
            <p className="text-slate-300">
              I'm a software developer with extensive experience in full-stack development 
              and a passion for financial markets.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Trading Experience</h3>
            <p className="text-slate-300">
              Combining my technical expertise with practical trading knowledge, 
              I've developed this platform to help traders make data-driven decisions.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Specialization</h3>
            <p className="text-slate-300">
              Specializing in technical analysis and algorithmic trading strategies, 
              with a focus on Indian markets.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Platform Features</h3>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Advanced technical analysis tools</li>
              <li>Real-time market sentiment analysis</li>
              <li>Multiple timeframe analysis</li>
              <li>Support for all NIFTY 500 listed stocks</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
} 