export const config = {
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  TIME_FRAME_OPTIONS: [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ]
}; 