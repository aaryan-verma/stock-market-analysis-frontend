import { ArrowLeft, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from './common/Card';
import { Button } from './common/Button';

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <BarChart2 className="w-8 h-8 text-teal-500" />
            <h1 className="text-2xl font-bold text-white">About Me</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Content */}
        <Card className="max-w-3xl mx-auto bg-slate-800/50 backdrop-blur">
          <div className="space-y-6">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Professional Background</h2>
              <p className="text-slate-300">
                I'm a software developer with extensive experience in full-stack development 
                and a passion for financial markets.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Trading Experience</h2>
              <p className="text-slate-300">
                Combining my technical expertise with practical trading knowledge, 
                I've developed this platform to help traders make data-driven decisions.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Specialization</h2>
              <p className="text-slate-300">
                Specializing in technical analysis and algorithmic trading strategies, 
                with a focus on Indian markets.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Platform Features</h2>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Advanced technical analysis tools</li>
                <li>Real-time market sentiment analysis</li>
                <li>Multiple timeframe analysis</li>
                <li>Support for all NIFTY 500 listed stocks</li>
              </ul>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
} 