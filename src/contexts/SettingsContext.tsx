import React, { createContext, useContext, useState, useEffect } from 'react';
import dayjs from 'dayjs';

interface DashboardLayout {
  showOHLC: boolean;
  showNews: boolean;
  showInterpretation: boolean;
  showChart: boolean;
}

interface DefaultDates {
  defaultTimeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  defaultDateRange: '1 month' | '3 months' | '6 months' | '1 year' | '3 years';
}

interface SettingsContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  dashboardLayout: DashboardLayout;
  updateDashboardLayout: (layout: Partial<DashboardLayout>) => void;
  defaultDates: DefaultDates;
  updateDefaultDates: (dates: Partial<DefaultDates>) => void;
  getDefaultStartDate: () => string;
  getDefaultEndDate: () => string;
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
  const [defaultDates, setDefaultDates] = useState<DefaultDates>({
    defaultTimeframe: 'daily',
    defaultDateRange: '3 months',
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    const savedLayout = localStorage.getItem('dashboardLayout');
    const savedDates = localStorage.getItem('defaultDates');
    
    if (savedTheme) setTheme(savedTheme);
    if (savedLayout) setDashboardLayout(JSON.parse(savedLayout));
    if (savedDates) setDefaultDates(JSON.parse(savedDates));
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

  const updateDefaultDates = (dates: Partial<DefaultDates>) => {
    const newDates = { ...defaultDates, ...dates };
    setDefaultDates(newDates);
    localStorage.setItem('defaultDates', JSON.stringify(newDates));
  };

  // Helper function to calculate default start date based on selected range
  const getDefaultStartDate = () => {
    const endDate = dayjs();
    let startDate;
    
    switch (defaultDates.defaultDateRange) {
      case '1 month':
        startDate = endDate.subtract(1, 'month');
        break;
      case '6 months':
        startDate = endDate.subtract(6, 'month');
        break;
      case '1 year':
        startDate = endDate.subtract(1, 'year');
        break;
      case '3 years':
        startDate = endDate.subtract(3, 'year');
        break;
      case '3 months':
      default:
        startDate = endDate.subtract(3, 'month');
        break;
    }
    
    // Log the calculation for debugging
    console.log(`Date range: ${defaultDates.defaultDateRange}`);
    console.log(`Calculated start date: ${startDate.format('YYYY-MM-DD')}`);
    console.log(`End date: ${endDate.format('YYYY-MM-DD')}`);
    
    return startDate.format('YYYY-MM-DD');
  };

  // Helper function to get default end date (today)
  const getDefaultEndDate = () => {
    return dayjs().format('YYYY-MM-DD');
  };

  return (
    <SettingsContext.Provider value={{ 
      theme, 
      toggleTheme, 
      dashboardLayout, 
      updateDashboardLayout,
      defaultDates,
      updateDefaultDates,
      getDefaultStartDate,
      getDefaultEndDate
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