import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  loading, 
  variant = 'primary',
  className = '',
  ...props 
}) => {
  const baseStyles = 'py-2 px-4 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-slate-600 hover:bg-slate-700 text-white shadow-lg hover:shadow-xl',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className} ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
      disabled={loading}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={18} />}
      {children}
    </button>
  );
}; 