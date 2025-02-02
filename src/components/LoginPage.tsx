import React, { useState } from "react";
import { User, Lock, BarChart2 } from "lucide-react";
import { Card } from './common/Card';
import { Button } from './common/Button';

interface LoginPageProps {
  onLogin: (username: string, password: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLogin(username, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <BarChart2 className="text-blue-500 w-12 h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-200">
            Stock Analysis Tool
          </h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Enter username" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-slate-200 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type="password" 
                placeholder="Enter password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-slate-200 placeholder-slate-400"
              />
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Login
          </Button>
        </form>
      </Card>
    </div>
  );
}