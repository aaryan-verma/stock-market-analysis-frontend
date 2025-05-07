import { X, BarChart2, Mail } from 'lucide-react';
import { Button } from './common/Button';
import { useState } from 'react';
import { contactService } from '../services/contactService';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError(null);
    
    try {
      const response = await contactService.sendContactForm({
        name: contactName,
        email: contactEmail,
        message: contactMessage
      });
      
      setIsSending(false);
      setMessageSent(true);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      
      // Reset the success message after 8 seconds
      setTimeout(() => {
        setMessageSent(false);
      }, 8000);
    } catch (err) {
      setIsSending(false);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again later.');
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <BarChart2 className="w-5 sm:w-6 h-5 sm:h-6 text-teal-500" />
            <h2 className="text-lg sm:text-xl font-semibold text-white">About Me</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 sm:w-6 h-5 sm:h-6" />
          </button>
        </div>

        {/* Content - Add overflow-y-auto to make it scrollable */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
          <section className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-white">Professional Background</h3>
            <p className="text-sm sm:text-base text-slate-300">
              I'm a software developer with extensive experience in full-stack development 
              and a passion for financial markets.
            </p>
          </section>

          <section className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-white">Trading Experience</h3>
            <p className="text-sm sm:text-base text-slate-300">
              Combining my technical expertise with practical trading knowledge, 
              I've developed this platform to help traders make data-driven decisions.
            </p>
          </section>

          <section className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-white">Specialization</h3>
            <p className="text-sm sm:text-base text-slate-300">
              Specializing in technical analysis and algorithmic trading strategies, 
              with a focus on NIFTY 500 stocks in the Indian market.
            </p>
          </section>
          
          {/* Contact Me Section */}
          <section className="space-y-4 pt-4 border-t border-slate-700">
            <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
              <Mail className="w-4 sm:w-5 h-4 sm:h-5 text-teal-500" />
              Contact Me
            </h3>
            <p className="text-sm sm:text-base text-slate-300">
              Have questions about the platform or need assistance with your trading strategies? 
              Send me a message and I'll get back to you soon.
            </p>
            
            {/* Error toast */}
            {error && (
              <div className="p-3 sm:p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
            
            {messageSent ? (
              <div className="p-3 sm:p-4 bg-green-900/30 border border-green-800 rounded-lg text-green-400 text-sm sm:text-base">
                Your message has been sent successfully. I'll respond to your inquiry as soon as possible.
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm sm:text-base"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm sm:text-base"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">Message</label>
                  <textarea
                    id="message"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none text-sm sm:text-base"
                    placeholder="Your message or question..."
                  />
                </div>
                
                <div>
                  <Button
                    type="submit"
                    disabled={isSending}
                    className="w-full flex items-center justify-center"
                  >
                    {isSending ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </form>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-700 flex justify-end flex-shrink-0">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
} 