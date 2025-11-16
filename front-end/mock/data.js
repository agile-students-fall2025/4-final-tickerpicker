// mock/data.js
// Centralized mock data for the entire application
// This file is only loaded when VITE_USE_MOCK=true

// ============================================
// WATCHLIST DATA
// ============================================

export const mockWatchlists = [
  { id: 1, name: "Tech Stocks", stocks: ["AAPL", "MSFT", "GOOGL"] },
  { id: 2, name: "My Favorites", stocks: ["NVDA", "TSLA"] },
];

// ============================================
// STOCK PRICE DATA (for watchlist display)
// ============================================

export const mockPriceData = {
  AAPL: { price: 172.15, change: 2.45, changePercent: 1.44 },
  MSFT: { price: 378.85, change: -1.25, changePercent: -0.33 },
  GOOGL: { price: 139.92, change: 3.12, changePercent: 2.28 },
  NVDA: { price: 472.35, change: 12.5, changePercent: 2.71 },
  TSLA: { price: 248.5, change: -5.25, changePercent: -2.07 },
};

// ============================================
// SCREENER/FILTER STOCKS
// ============================================

export const mockScreenerStocks = [
  {
    ticker: "NVDA",
    company: "NVIDIA Corporation",
    price: 472.35,
    marketCap: 4000000000000,
    peRatio: 52.19,
    debtToEquity: 0.15,
    beta: 2.12,
    fiftyTwoWeekRange: { low: 86.62, high: 195.62 },
  },
  {
    ticker: "AAPL",
    company: "Apple Inc.",
    price: 172.15,
    marketCap: 2800000000000,
    peRatio: 28.5,
    debtToEquity: 1.73,
    beta: 1.2,
    fiftyTwoWeekRange: { low: 129.04, high: 182.94 },
  },
  {
    ticker: "TSLA",
    company: "Tesla, Inc.",
    price: 248.5,
    marketCap: 1440000000000,
    peRatio: 253.94,
    debtToEquity: 0.08,
    beta: 2.45,
    fiftyTwoWeekRange: { low: 138.25, high: 299.29 },
  },
  {
    ticker: "MSFT",
    company: "Microsoft Corporation",
    price: 378.85,
    marketCap: 2800000000000,
    peRatio: 32.15,
    debtToEquity: 0.42,
    beta: 0.88,
    fiftyTwoWeekRange: { low: 309.45, high: 420.82 },
  },
  {
    ticker: "GOOGL",
    company: "Alphabet Inc.",
    price: 139.92,
    marketCap: 1800000000000,
    peRatio: 24.68,
    debtToEquity: 0.05,
    beta: 1.05,
    fiftyTwoWeekRange: { low: 115.55, high: 152.14 },
  },
  {
    ticker: "AMZN",
    company: "Amazon.com Inc.",
    price: 148.5,
    marketCap: 1500000000000,
    peRatio: 45.23,
    debtToEquity: 1.12,
    beta: 1.35,
    fiftyTwoWeekRange: { low: 118.35, high: 189.77 },
  },
  {
    ticker: "META",
    company: "Meta Platforms Inc.",
    price: 485.2,
    marketCap: 1250000000000,
    peRatio: 22.15,
    debtToEquity: 0.28,
    beta: 1.25,
    fiftyTwoWeekRange: { low: 198.43, high: 531.49 },
  },
  {
    ticker: "JPM",
    company: "JPMorgan Chase & Co.",
    price: 185.3,
    marketCap: 550000000000,
    peRatio: 12.45,
    debtToEquity: 2.15,
    beta: 1.18,
    fiftyTwoWeekRange: { low: 135.19, high: 205.88 },
  },
  {
    ticker: "V",
    company: "Visa Inc.",
    price: 285.75,
    marketCap: 580000000000,
    peRatio: 35.2,
    debtToEquity: 0.65,
    beta: 0.95,
    fiftyTwoWeekRange: { low: 235.5, high: 291.82 },
  },
  {
    ticker: "JNJ",
    company: "Johnson & Johnson",
    price: 158.2,
    marketCap: 420000000000,
    peRatio: 28.9,
    debtToEquity: 0.48,
    beta: 0.62,
    fiftyTwoWeekRange: { low: 144.5, high: 175.98 },
  }
];

// ============================================
// RECOMMENDED TICKER PICKS (HomePage)
// ============================================

export const mockRecommendedPicks = [
  {
    symbol: "AAPL",
    company: "Apple Inc.",
    price: 172.15,
    change: 2.45,
    changePercent: 1.44,
  },
  {
    symbol: "NVDA",
    company: "NVIDIA Corporation",
    price: 472.35,
    change: 12.5,
    changePercent: 2.71,
  },
  {
    symbol: "MSFT",
    company: "Microsoft Corporation",
    price: 378.85,
    change: -1.25,
    changePercent: -0.33,
  },
  {
    symbol: "GOOGL",
    company: "Alphabet Inc.",
    price: 139.92,
    change: 3.12,
    changePercent: 2.28,
  },
  {
    symbol: "AMZN",
    company: "Amazon.com Inc.",
    price: 148.5,
    change: 2.8,
    changePercent: 1.92,
  },
];

// ============================================
// TOP 20 PERFORMERS (HomePage)
// ============================================

export const mockTopPerformers = [
  {
    symbol: "NVDA",
    company: "NVIDIA Corporation",
    price: 472.35,
    change: 12.5,
    changePercent: 2.71,
  },
  {
    symbol: "GOOGL",
    company: "Alphabet Inc.",
    price: 139.92,
    change: 3.12,
    changePercent: 2.28,
  },
  {
    symbol: "AMZN",
    company: "Amazon.com Inc.",
    price: 148.5,
    change: 2.8,
    changePercent: 1.92,
  },
  {
    symbol: "META",
    company: "Meta Platforms Inc.",
    price: 485.2,
    change: 8.5,
    changePercent: 1.78,
  },
  {
    symbol: "TSLA",
    company: "Tesla, Inc.",
    price: 248.5,
    change: 4.25,
    changePercent: 1.74,
  },
  {
    symbol: "AVGO",
    company: "Broadcom Inc.",
    price: 1250.0,
    change: 20.0,
    changePercent: 1.63,
  },
  {
    symbol: "COST",
    company: "Costco Wholesale Corp.",
    price: 780.5,
    change: 12.3,
    changePercent: 1.6,
  },
  {
    symbol: "AMD",
    company: "Advanced Micro Devices",
    price: 125.75,
    change: 1.95,
    changePercent: 1.57,
  },
  {
    symbol: "NFLX",
    company: "Netflix, Inc.",
    price: 495.8,
    change: 7.25,
    changePercent: 1.48,
  },
  {
    symbol: "CRM",
    company: "Salesforce, Inc.",
    price: 245.6,
    change: 3.5,
    changePercent: 1.45,
  },
  {
    symbol: "AAPL",
    company: "Apple Inc.",
    price: 172.15,
    change: 2.45,
    changePercent: 1.44,
  },
  {
    symbol: "ADBE",
    company: "Adobe Inc.",
    price: 525.4,
    change: 7.2,
    changePercent: 1.39,
  },
  {
    symbol: "INTC",
    company: "Intel Corporation",
    price: 38.25,
    change: 0.5,
    changePercent: 1.32,
  },
  {
    symbol: "CMCSA",
    company: "Comcast Corporation",
    price: 42.8,
    change: 0.55,
    changePercent: 1.3,
  },
  {
    symbol: "TXN",
    company: "Texas Instruments",
    price: 165.3,
    change: 2.1,
    changePercent: 1.29,
  },
  {
    symbol: "QCOM",
    company: "QUALCOMM Inc.",
    price: 142.5,
    change: 1.8,
    changePercent: 1.28,
  },
  {
    symbol: "AMAT",
    company: "Applied Materials",
    price: 185.75,
    change: 2.3,
    changePercent: 1.25,
  },
  {
    symbol: "ISRG",
    company: "Intuitive Surgical",
    price: 385.9,
    change: 4.75,
    changePercent: 1.25,
  },
  {
    symbol: "MU",
    company: "Micron Technology",
    price: 98.5,
    change: 1.2,
    changePercent: 1.23,
  },
  {
    symbol: "KLAC",
    company: "KLA Corporation",
    price: 595.8,
    change: 7.15,
    changePercent: 1.22,
  },
];
