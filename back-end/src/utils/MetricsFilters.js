
// src/services/MetricsFilters.js
import { fetchQuotes, getFundamentals } from '../data/DataFetcher.js';

// Check if a stock is within a given range for a given metrics. Will be called by other functions here in this module
function isWithinRange(val, min, max) {
  if (min === undefined && max === undefined) return true;

  if (val === null || val === undefined || Number.isNaN(val)) return false;
  if (min !== undefined && val < min) return false;
  if (max !== undefined && val > max) return false;
  return true;
}

/**
 * Standardize stock object
 */
function toStock(symbol, quote = {}, summary = {}) {
  const sd = summary.summaryDetail || {};
  const ks = summary.defaultKeyStatistics || {};
  const pr = summary.price || {};
  const fd = summary.financialData || {};

  return {
    ticker: symbol,
    company: pr.longName || quote.shortName || symbol,
    price: (pr.regularMarketPrice && pr.regularMarketPrice.raw) || quote.regularMarketPrice || null,
    marketCap: (pr.marketCap && pr.marketCap.raw) || quote.marketCap || null,
    peRatio: quote.trailingPE ?? (ks.trailingPE && ks.trailingPE.raw) ?? null,
    forwardPE: quote.forwardPE ?? (ks.forwardPE && ks.forwardPE.raw) ?? null,
    dividendYield: (sd.dividendYield && sd.dividendYield.raw) ?? null,
    dividendRate: (sd.dividendRate && sd.dividendRate.raw) ?? null,
    beta: (ks.beta && ks.beta.raw) ?? quote.beta ?? null,
    priceToSales: (sd.priceToSalesTrailing12Months && sd.priceToSalesTrailing12Months.raw) ?? quote.priceToSalesTrailing12Months ?? null,
    fiftyTwoWeekChange: (ks['52WeekChange'] && ks['52WeekChange'].raw) ?? quote.fiftyTwoWeekChange ?? null,
    debtToEquity: (fd.debtToEquity && fd.debtToEquity.raw) ?? null,
    epsTrailing12Months: (ks.trailingEps && ks.trailingEps.raw) ?? quote.epsTrailingTwelveMonths ?? null,
    sector: quote.sector || pr.sector || null,
    industry: quote.industry || pr.industry || null
  };
}

/**
 * Check if a stock is within a certain metric range by calling isWithinRange combinedly
 */
function isValidStock(stock, filtersParam = {}) {
  const filters = filtersParam || {};
  return (
    isWithinRange(stock.price, filters.sharePrice?.min, filters.sharePrice?.max) &&
    isWithinRange(stock.marketCap, filters.marketCap?.min, filters.marketCap?.max) &&
    isWithinRange(stock.peRatio, filters.peRatio?.min, filters.peRatio?.max) &&
    isWithinRange(stock.debtToEquity, filters.debtToEquity?.min, filters.debtToEquity?.max) &&
    isWithinRange(stock.dividendYield ?? 0, filters.dividendYield?.min, filters.dividendYield?.max) &&
    isWithinRange(stock.beta ?? 0, filters.beta?.min, filters.beta?.max) &&
    isWithinRange(stock.priceToSales ?? 0, filters.priceToSales?.min, filters.priceToSales?.max)
  );
}

/**
 * Main filter function.
 * @param {Object} opts { symbols: string[], filters: object }
 */
export async function filterSymbolsByMetrics({ symbolsParam = [], filters = {} } = {}) {
  // If no symbols provided, use a default small universe to keep it fast
  const symbols = symbolsParam.length ? symbolsParam : ['AAPL','MSFT','NVDA','GOOGL','AMZN','META','TSLA','ORCL','NFLX','JPM'];
  const quotes = await fetchQuotes(symbols);

  const results = [];
  for (const s of symbols) {
    try {
      const summary = await getFundamentals(s);
      const stock = toStock(s, quotes[s], summary);
      if (isValidStock(stock, filters)) results.push(stock);
    } catch (e) {
      // ignore individual failures
    }
  }
  return results;
}
