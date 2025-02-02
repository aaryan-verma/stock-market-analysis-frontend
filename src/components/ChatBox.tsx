import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X } from 'lucide-react';
import { Card } from './common/Card';
import { Button } from './common/Button';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'Hello! I can help you understand the stock levels (R6, R5, R4, R3, PP, S3, S4, S5, S6). Ask me about any specific level or type "all levels" to see the complete list.'
  }]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <Bot size={24} />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] flex flex-col shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <Bot className="text-blue-500" />
          Stock Levels Assistant
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-2">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-2 ${
              message.role === 'assistant' ? 'justify-start' : 'justify-end'
            }`}
          >
            {message.role === 'assistant' && (
              <Bot className="w-6 h-6 text-blue-500 flex-shrink-0" />
            )}
            <div
              className={`rounded-lg px-4 py-2 max-w-[80%] whitespace-pre-wrap ${
                message.role === 'assistant'
                  ? 'bg-slate-700 text-slate-200'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {message.content}
            </div>
            {message.role === 'user' && (
              <User className="w-6 h-6 text-blue-500 flex-shrink-0" />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a stock level..."
          className="flex-1 bg-slate-700 text-slate-200 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <Button type="submit" loading={loading}>
          <Send size={20} />
        </Button>
      </form>
    </Card>
  );
} 