import React, { createContext, useContext, useState, useEffect } from 'react';

interface DashboardLayout {
  showOHLC: boolean;
  showNews: boolean;
  showInterpretation: boolean;
  showChart: boolean;
}

interface SettingsContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  dashboardLayout: DashboardLayout;
  updateDashboardLayout: (layout: Partial<DashboardLayout>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [dashboardLayout, setDashboardLayout] = useState<DashboardLayout>({
    showOHLC: true,
    showNews: true,
    showInterpretation: true,
    showChart: true,
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    const savedLayout = localStorage.getItem('dashboardLayout');
    
    if (savedTheme) setTheme(savedTheme);
    if (savedLayout) setDashboardLayout(JSON.parse(savedLayout));
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const updateDashboardLayout = (layout: Partial<DashboardLayout>) => {
    const newLayout = { ...dashboardLayout, ...layout };
    setDashboardLayout(newLayout);
    localStorage.setItem('dashboardLayout', JSON.stringify(newLayout));
  };

  return (
    <SettingsContext.Provider value={{ 
      theme, 
      toggleTheme, 
      dashboardLayout, 
      updateDashboardLayout 
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 