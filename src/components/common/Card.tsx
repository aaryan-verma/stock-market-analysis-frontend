import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-slate-800/95 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-slate-700 ${className}`}>
    {children}
  </div>
); 