export interface StockData {
  symbol: string;
  isin: string;
}

// Define stocks with their ISIN numbers
// NOTE: This is a partial list of ISINs as examples. For a production environment,
// all stock ISINs should be properly populated with accurate data from a reliable source.
// The ISINs provided here are for demonstration purposes.
export const NSE_STOCKS_WITH_ISIN: StockData[] = [
  { symbol: "3MINDIA", isin: "INE470A01017" },
  { symbol: "ABB", isin: "INE117A01022" },
  { symbol: "ACC", isin: "INE012A01025" },
  { symbol: "AIAENG", isin: "INE212H01026" },
  { symbol: "APLAPOLLO", isin: "INE702C01027" },
  { symbol: "AUBANK", isin: "INE949L01017" },
  { symbol: "AARTIIND", isin: "INE769A01020" },
  { symbol: "AAVAS", isin: "INE216P01012" },
  { symbol: "ABBOTINDIA", isin: "INE358A01014" },
  { symbol: "ADANIENSOL", isin: "INE128U01010" },
  { symbol: "ADANIENT", isin: "INE423A01024" },
  { symbol: "ADANIGREEN", isin: "INE364U01010" },
  { symbol: "ADANIPORTS", isin: "INE742F01042" },
  { symbol: "ADANIPOWER", isin: "INE814H01011" },
  { symbol: "ATGL", isin: "INE399R01011" },
  { symbol: "AWL", isin: "INE699H01024" },
  { symbol: "ADANITRANS", isin: "INE931S01010" },
  { symbol: "ABCAPITAL", isin: "INE647O01016" },
  { symbol: "ABFRL", isin: "INE647O01016" },
  { symbol: "ABSLAMC", isin: "INE404A01024" },
  // Major stocks - ensure these are populated correctly
  { symbol: "AXISBANK", isin: "INE238A01034" },
  { symbol: "BAJFINANCE", isin: "INE296A01024" },
  { symbol: "HDFCBANK", isin: "INE040A01034" },
  { symbol: "ICICIBANK", isin: "INE090A01021" },
  { symbol: "INFY", isin: "INE009A01021" },
  { symbol: "ITC", isin: "INE154A01025" },
  { symbol: "KOTAKBANK", isin: "INE237A01028" },
  { symbol: "LT", isin: "INE018A01030" },
  { symbol: "MARUTI", isin: "INE585B01010" },
  { symbol: "ONGC", isin: "INE213A01029" },
  { symbol: "POWERGRID", isin: "INE752E01010" },
  { symbol: "RAYMOND", isin: "INE301A01014" },
  { symbol: "REDINGTON", isin: "INE891D01026" },
  { symbol: "RELAXO", isin: "INE131B01039" },
  { symbol: "RELIANCE", isin: "INE002A01018" },
  { symbol: "ROSSARI", isin: "INE02A801020" },
  { symbol: "ROUTE", isin: "INE450U01017" },
  { symbol: "SBICARD", isin: "INE018E01016" },
  { symbol: "SBILIFE", isin: "INE123W01016" },
  { symbol: "SIS", isin: "INE285J01010" },
  { symbol: "SJVN", isin: "INE002L01015" },
  { symbol: "SUNPHARMA", isin: "INE044A01036" },
  { symbol: "TATAMOTORS", isin: "INE155A01022" },
  { symbol: "TATASTEEL", isin: "INE081A01020" },
  { symbol: "TCS", isin: "INE467B01029" },
  { symbol: "WIPRO", isin: "INE075A01022" },
  // Indices are handled differently - they use a special format NSE_INDEX|NAME
  { symbol: "NIFTY 50", isin: "INDEX" },
  { symbol: "NIFTY BANK", isin: "INDEX" }
  // For indices, the backend will use a different format when querying Upstox
];

// Keep the original array for backward compatibility
export const NSE_STOCKS = NSE_STOCKS_WITH_ISIN.map(stock => stock.symbol);

// Helper function to get ISIN by stock symbol
export const getStockISIN = (symbol: string): string | undefined => {
  const stock = NSE_STOCKS_WITH_ISIN.find(s => s.symbol === symbol);
  return stock?.isin;
};

// Helper function to check if a stock is an index
export const isStockIndex = (symbol: string): boolean => {
  const stock = NSE_STOCKS_WITH_ISIN.find(s => s.symbol === symbol);
  return stock?.isin === "INDEX";
};