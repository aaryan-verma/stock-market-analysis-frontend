export const filterStocks = (query: string, stocksList: string[]): string[] => {
  if (!query) return [];
  
  return stocksList.filter(stock =>
    stock.toLowerCase().startsWith(query.toLowerCase())
  );
}; 