import { fetchQuotes, getFundamentals } from "../data/DataFetcher.js";

/**
 * yFinance sometimes give null or NaN for some stocks. To avoid having no stock displayed, 
 * the filter will "ignore" the null or NaN value. And only if there's specific data, we filter them
 * @param {*} val Metric value
 * @param {*} min Smallest possible value for metric
 * @param {*} max Largest possible value for metric.
 * @returns True if val is within (min,max), False otherwise
 */
function isWithinRange(val, min, max) {
  if (min === undefined && max === undefined) return true;
  if (val === null || val === undefined || Number.isNaN(val)) return true;
  if (min !== undefined && val < min) return false;
  if (max !== undefined && val > max) return false;
  return true;
}

/**
 * Standardize stock object
 */
export function toStock(symbol, quote = {}, summary = {}) {
  const sd = summary.summaryDetail || {};
  const ks = summary.defaultKeyStatistics || {};
  const pr = summary.price || {};
  const fd = summary.financialData || {};

  // Helper to unwrap raw values
  const unwrap = (v) => {
    if (v == null) return null;
    if (typeof v === "object" && "raw" in v) return v.raw;
    return v;
  };

  // Get 52-week range
  const fiftyTwoWeekLow =
    unwrap(ks.fiftyTwoWeekLow) ??
    unwrap(pr.fiftyTwoWeekLow) ??
    unwrap(quote.fiftyTwoWeekLow) ??
    null;
  const fiftyTwoWeekHigh =
    unwrap(ks.fiftyTwoWeekHigh) ??
    unwrap(pr.fiftyTwoWeekHigh) ??
    unwrap(quote.fiftyTwoWeekHigh) ??
    null;

  const fiftyTwoWeekRange =
    fiftyTwoWeekLow != null || fiftyTwoWeekHigh != null
      ? {
          low: fiftyTwoWeekLow,
          high: fiftyTwoWeekHigh,
        }
      : null;

  return {
    ticker: symbol,
    company: pr.longName || quote.shortName || symbol,
    price:
      (pr.regularMarketPrice && pr.regularMarketPrice.raw) ||
      quote.regularMarketPrice ||
      null,
    marketCap: (pr.marketCap && pr.marketCap.raw) || quote.marketCap || null,
    peRatio:
      quote.trailingPE ??
      (ks.trailingPE && ks.trailingPE.raw) ??
      (sd.trailingPE && sd.trailingPE.raw) ??
      null,
    forwardPE:
      (sd.forwardPE && sd.forwardPE.raw) ??
      (pr.forwardPE && pr.forwardPE.raw) ??
      quote.forwardPE ??
      (ks.forwardPE && ks.forwardPE.raw) ??
      null,
    dividendYield: (() => {
      // Try summaryDetail first
      if (sd.dividendYield && sd.dividendYield.raw) return sd.dividendYield.raw;
      // Try price module
      if (pr.dividendYield && pr.dividendYield.raw) return pr.dividendYield.raw;
      // Try quote object fields
      const trailingYield = unwrap(quote.trailingAnnualDividendYield);
      if (trailingYield != null) return trailingYield;
      const forwardYield = unwrap(quote.forwardAnnualDividendYield);
      if (forwardYield != null) return forwardYield;
      const quoteYield = unwrap(quote.dividendYield);
      if (quoteYield != null) return quoteYield;
      // Calculate from dividendRate and price if available
      const price =
        (pr.regularMarketPrice && pr.regularMarketPrice.raw) ||
        quote.regularMarketPrice;
      if (sd.dividendRate && sd.dividendRate.raw && price && price > 0) {
        return sd.dividendRate.raw / price;
      }
      return null;
    })(),
    dividendRate: (sd.dividendRate && sd.dividendRate.raw) ?? null,
    beta: (ks.beta && ks.beta.raw) ?? quote.beta ?? null,
    priceToSales:
      (sd.priceToSalesTrailing12Months &&
        sd.priceToSalesTrailing12Months.raw) ??
      quote.priceToSalesTrailing12Months ??
      null,
    fiftyTwoWeekChange:
      (ks["52WeekChange"] && ks["52WeekChange"].raw) ??
      quote.fiftyTwoWeekChange ??
      null,
    debtToEquity: (fd.debtToEquity && fd.debtToEquity.raw) ?? null,
    epsTrailing12Months:
      (ks.trailingEps && ks.trailingEps.raw) ??
      quote.epsTrailingTwelveMonths ??
      null,
    sector: quote.sector || pr.sector || null,
    industry: quote.industry || pr.industry || null,
    fiftyTwoWeekRange: fiftyTwoWeekRange,
  };
}

/**
 * Check if a stock is within a certain metric range by calling isWithinRange combinedly
 */
function isValidStock(stock, filtersParam = {}) {
  const filters = filtersParam || {};
  return (
    isWithinRange(
      stock.price,
      filters.sharePrice?.min,
      filters.sharePrice?.max
    ) &&
    isWithinRange(
      stock.marketCap,
      filters.marketCap?.min,
      filters.marketCap?.max
    ) &&
    isWithinRange(stock.peRatio, filters.peRatio?.min, filters.peRatio?.max) &&
    isWithinRange(
      stock.debtToEquity,
      filters.debtToEquity?.min,
      filters.debtToEquity?.max
    ) &&
    isWithinRange(
      stock.dividendYield ?? 0,
      filters.dividendYield?.min,
      filters.dividendYield?.max
    ) &&
    isWithinRange(stock.beta ?? 0, filters.beta?.min, filters.beta?.max) &&
    isWithinRange(
      stock.priceToSales ?? 0,
      filters.priceToSales?.min,
      filters.priceToSales?.max
    )
  );
}

/**
 * Main filter function.
 * @param {Object} opts { symbols: string[], filters: object }
 */
export async function filterSymbolsByMetrics({
  symbolsParam = [],
  filters = {},
} = {}) {
  // If no symbols provided, use a default small universe to keep it fast
  const symbols = symbolsParam.length
    ? symbolsParam
    : [
        "AAPL",
        "MSFT",
        "NVDA",
        "GOOGL",
        "AMZN",
        "META",
        "TSLA",
        "ORCL",
        "NFLX",
        "JPM",
      ];
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
