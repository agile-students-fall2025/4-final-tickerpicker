import YahooFinance from "yahoo-finance2";
import {
  findPriceData,
  insertPriceData,
  findDateGaps,
} from "./PriceDataService.js";
import mongoose from "mongoose";
import { formatDate } from "../utils/dateUtils.js";
import { logger } from "../utils/logger.js";

// Reuse a single YahooFinance instance across all functions for better performance
const yahooFinance = new YahooFinance();

// Lightweight in-memory caches to avoid hammering upstream APIs
const QUOTE_TTL_MS = 90 * 1000; // short TTL for price quotes
const FUNDAMENTAL_TTL_MS = 6 * 60 * 60 * 1000; // longer TTL for fundamentals

const quoteCache = new Map(); // symbol -> { data, expiresAt }
const quoteInFlight = new Map(); // symbol -> Promise<quote>
const fundamentalsCache = new Map(); // symbol -> { data, expiresAt }
const fundamentalsInFlight = new Map(); // symbol -> Promise<data>

/**
 * Fetches historical price data using yahoo-finance2 chart() method
 * Now with MongoDB caching: checks database first, fetches only missing date ranges from API
 *
 * Data Structure Learned from Debug:
 * - The yahooFinance.chart() call returns an object with: { meta, quotes, events }
 * - meta: Contains symbol, currency, exchange info, current price
 * - quotes: Array of OHLCV data with date, open, high, low, close, volume, adjClose
 * - events: Contains dividends and stock splits data
 *
 * @param {string} symbol - Asset symbol (e.g., 'AAPL', 'MSFT', 'BTC-USD')
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {string} timeframe - Data interval ('1d', '1wk', '1mo', '1m', '5m', etc.)
 * @param {boolean} getMetaData - If true, returns full data object with metadata
 * @returns {Object|Array} Chart data with quotes array and metadata, or just quotes array
 */
export async function queryPriceData(
  symbol,
  startDate,
  endDate,
  timeframe = "1d",
  getMetaData = false
) {
  try {
    // Check if MongoDB is connected
    const isDbConnected = mongoose.connection.readyState === 1;

    if (!isDbConnected) {
      // Fallback to direct API call if database is not connected
      logger.warn(
        `Database not connected, fetching ${symbol} data directly from API`
      );
      return await fetchFromAPI(
        symbol,
        startDate,
        endDate,
        timeframe,
        getMetaData
      );
    }

    // Step 1: Try to get cached data from database
    let cachedData = [];
    try {
      cachedData = await findPriceData(symbol, startDate, endDate, timeframe); //<-- data/PriceDataService.js
    } catch (dbError) {
      logger.warn(
        `Error querying database for ${symbol}, falling back to API:`,
        dbError.message
      );
      // Fallback to API if database query fails
      return await fetchFromAPI(
        symbol,
        startDate,
        endDate,
        timeframe,
        getMetaData
      );
    }

    // Step 2: Find date gaps (missing dates in the requested range)
    let gaps = [];
    try {
      gaps = await findDateGaps(symbol, startDate, endDate, timeframe);
    } catch (gapError) {
      logger.warn(
        `Error finding date gaps for ${symbol}, using cached data only:`,
        gapError.message
      );
      // If we can't find gaps, return what we have from cache
      if (getMetaData) {
        // For metadata requests, we still need to fetch from API
        const apiData = await fetchFromAPI(
          symbol,
          startDate,
          endDate,
          timeframe,
          true
        );
        return {
          ...apiData,
          quotes: cachedData.length > 0 ? cachedData : apiData.quotes,
        };
      }
      return cachedData;
    }

    // Optimization #4: Early return if no gaps (all data is cached)
    if (gaps.length === 0) {
      // No gaps, return cached data immediately
      if (getMetaData) {
        // Still need metadata from API
        try {
          const apiData = await fetchFromAPI(
            symbol,
            startDate,
            endDate,
            timeframe,
            true
          );
          return {
            ...apiData,
            quotes: cachedData.length > 0 ? cachedData : apiData.quotes,
          };
        } catch (metaError) {
          logger.warn(
            `Error fetching metadata for ${symbol}, returning quotes only:`,
            metaError.message
          );
          return cachedData;
        }
      }
      return cachedData;
    }

    // Step 3: Fetch missing data from API for gaps
    let newData = [];
    logger.log(
      `Found ${gaps.length} date gap(s) for ${symbol}, fetching from API...`
    );

    // Fetch data for each gap
    let totalFetched = 0;
    let totalFiltered = 0;
    for (const gap of gaps) {
      try {
        // Yahoo Finance API requires period1 and period2 to be different
        // If startDate and endDate are the same, expand the range by 1 day
        let gapStartDate = gap.startDate;
        let gapEndDate = gap.endDate;
        const isExpanded = gapStartDate === gapEndDate;

        if (isExpanded) {
          // Expand single-day gap to include day before and after
          const singleDate = new Date(gapStartDate + "T00:00:00.000Z");
          const dayBefore = new Date(singleDate);
          dayBefore.setUTCDate(dayBefore.getUTCDate() - 1);
          const dayAfter = new Date(singleDate);
          dayAfter.setUTCDate(dayAfter.getUTCDate() + 1);

          gapStartDate = formatDate(dayBefore);
          gapEndDate = formatDate(dayAfter);
        }

        const gapData = await fetchFromAPI(
          symbol,
          gapStartDate,
          gapEndDate,
          timeframe,
          false
        );

        if (gapData && gapData.length > 0) {
          totalFetched += gapData.length;

          // If we expanded the date range (single-day gap), filter to only include original gap dates
          let filteredGapData = gapData;
          if (isExpanded) {
            // Only include data for the original single date
            filteredGapData = gapData.filter(
              (quote) => quote.date === gap.startDate
            );
          } else {
            // Include all data within the original gap range
            filteredGapData = gapData.filter((quote) => {
              const quoteDate = quote.date;
              return quoteDate >= gap.startDate && quoteDate <= gap.endDate;
            });
          }

          totalFiltered += filteredGapData.length;

          // Store all fetched data in DB (including expanded range) for future queries
          // But only add filtered data to newData for this request
          try {
            await insertPriceData(symbol, timeframe, gapData);
          } catch (insertError) {
            logger.warn(
              `Error inserting data for ${symbol} into database:`,
              insertError.message
            );
          }

          newData = newData.concat(filteredGapData);
        }
      } catch (gapFetchError) {
        logger.error(
          `Error fetching gap data for ${symbol} (${gap.startDate} to ${gap.endDate}):`,
          gapFetchError.message
        );
        // Continue with other gaps even if one fails
      }
    }

    if (totalFetched > 0) {
      logger.log(
        `Fetched ${totalFetched} records for ${symbol}, filtered to ${totalFiltered} records for requested gaps, stored ${totalFetched} records in DB`
      );
    }

    // Step 4: Merge cached and newly fetched data
    const allData = [...cachedData, ...newData];

    // Step 5: Remove duplicates and sort by date
    const dataMap = new Map();
    allData.forEach((quote) => {
      // Use date as key to avoid duplicates
      dataMap.set(quote.date, quote);
    });

    const mergedData = Array.from(dataMap.values()).sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    // Step 6: If getMetaData is true, we still need to fetch metadata from API
    if (getMetaData) {
      try {
        const apiData = await fetchFromAPI(
          symbol,
          startDate,
          endDate,
          timeframe,
          true
        );
        return {
          ...apiData,
          quotes: mergedData.length > 0 ? mergedData : apiData.quotes,
        };
      } catch (metaError) {
        logger.warn(
          `Error fetching metadata for ${symbol}, returning quotes only:`,
          metaError.message
        );
        // Return quotes even if metadata fetch fails
        return mergedData;
      }
    }

    // Return merged and sorted data
    return mergedData;
  } catch (error) {
    logger.error(`Error in queryPriceData for ${symbol}:`, error.message);
    // Final fallback: try direct API call
    try {
      return await fetchFromAPI(
        symbol,
        startDate,
        endDate,
        timeframe,
        getMetaData
      );
    } catch (fallbackError) {
      logger.error(
        `Fallback API call also failed for ${symbol}:`,
        fallbackError.message
      );
      throw error; // Throw original error
    }
  }
}

/**
 * Helper function to fetch data directly from Yahoo Finance API
 * @private
 */
async function fetchFromAPI(
  symbol,
  startDate,
  endDate,
  timeframe,
  getMetaData
) {
  const data = await yahooFinance.chart(symbol, {
    period1: startDate,
    period2: endDate,
    interval: timeframe,
  });

  if (getMetaData) {
    return data;
  } else {
    // Transform quotes to match our format (ensure date is in YYYY-MM-DD format)
    return data.quotes.map((quote) => {
      // Simplify date transformation logic for better readability
      let date;
      if (quote.date instanceof Date) {
        date = quote.date.toISOString().split("T")[0];
      } else if (typeof quote.date === "string") {
        date = quote.date.split("T")[0];
      } else {
        // Assume it's a Unix timestamp (seconds)
        date = new Date(quote.date * 1000).toISOString().split("T")[0];
      }

      return {
        date: date,
        open: quote.open,
        high: quote.high,
        low: quote.low,
        close: quote.close,
        volume: quote.volume,
        adjClose: quote.adjClose,
      };
    });
  }
}

// 批量获取quote数据 返回一个{[symbol]: quoteObject}的映射
export async function fetchQuotes(symbols = [], batchSize = 20) {
  const result = {};
  const now = Date.now();

  // First, collect cache hits and misses
  const misses = [];
  for (const raw of symbols) {
    const symbol = raw.toUpperCase();
    const cached = quoteCache.get(symbol);
    if (cached && cached.expiresAt > now) {
      result[symbol] = cached.data;
    } else {
      misses.push(symbol);
    }
  }

  // Set up in-flight fetches for misses (dedupe concurrent calls)
  const toFetch = Array.from(new Set(misses));
  for (const symbol of toFetch) {
    if (!quoteInFlight.has(symbol)) {
      const p = yahooFinance
        .quote(symbol)
        .then((quote) => {
          if (quote) {
            quoteCache.set(symbol, {
              data: quote,
              expiresAt: Date.now() + QUOTE_TTL_MS,
            });
          }
          return quote;
        })
        .catch((err) => {
          logger.error(`Error fetching quote for ${symbol}:`, err.message);
          return null;
        })
        .finally(() => quoteInFlight.delete(symbol));

      quoteInFlight.set(symbol, p);
    }
  }

  // Consume in-flight fetches in batches to avoid overwhelming upstream
  for (let i = 0; i < toFetch.length; i += batchSize) {
    const batch = toFetch.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (symbol) => {
        try {
          const quote = await quoteInFlight.get(symbol);
          if (quote) result[symbol] = quote;
        } catch (err) {
          logger.error(
            `Error resolving quote for ${symbol} from in-flight cache:`,
            err.message
          );
        }
      })
    );
  }

  return result;
}

/**
 * Fetches quotes in parallel batches for better performance
 * Processes symbols in batches of specified size to avoid overwhelming the API
 *
 * @param {Array<string>} symbols - Array of stock symbols
 * @param {number} batchSize - Number of symbols to fetch in parallel (default: 20)
 * @returns {Promise<Object>} Map of {symbol: quoteObject}
 */
export async function fetchQuotesParallel(symbols = [], batchSize = 20) {
  const result = {};

  // Process symbols in batches
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);

    // Fetch all quotes in this batch in parallel
    const batchPromises = batch.map(async (symbol) => {
      try {
        const quote = await yahooFinance.quote(symbol);
        return { symbol, quote, error: null };
      } catch (err) {
        logger.error(`Error fetching quote for ${symbol}:`, err.message);
        return { symbol, quote: null, error: err.message };
      }
    });

    // Wait for all in batch to complete
    const batchResults = await Promise.all(batchPromises);

    // Store successful results
    batchResults.forEach(({ symbol, quote, error }) => {
      if (quote) {
        result[symbol] = quote;
      }
    });
  }

  return result;
}

/**
 * Fetches fundamental data for an asset symbol (Needs to be further developed after deciding what fundamental data we want to display)
 *
 * @param {string} symbol - Asset symbol
 * @returns {Object} Fundamental data including summary, financials, key statistics
 */
export async function getFundamentals(symbol) {
  if (!symbol) throw new Error("symbol is required");
  const key = symbol.toUpperCase();
  const now = Date.now();

  const cached = fundamentalsCache.get(key);
  if (cached && cached.expiresAt > now) return cached.data;

  if (!fundamentalsInFlight.has(key)) {
    const p = (async () => {
      const data = await yahooFinance.quoteSummary(key, {
        modules: [
          "summaryDetail",
          "financialData",
          "defaultKeyStatistics",
          "price",
        ],
      });
      fundamentalsCache.set(key, {
        data,
        expiresAt: Date.now() + FUNDAMENTAL_TTL_MS,
      });
      return data;
    })()
      .catch((error) => {
        logger.error(`Error fetching fundamentals for ${key}:`, error.message);
        throw error;
      })
      .finally(() => fundamentalsInFlight.delete(key));

    fundamentalsInFlight.set(key, p);
  }

  return fundamentalsInFlight.get(key);
}

/**
 * Extract metrics below from yFinance using getFundamentals
 * - share price
 * - market cap
 * - P/E
 * - debt-to-equity
 * - beta
 *
 * @param {string} symbol
 * @returns {Promise<{
 *   symbol: string;
 *   price: number | null;
 *   marketCap: number | null;
 *   pe: number | null;
 *   debtToEquity: number | null;
 *   beta: number | null;
 * }>}
 */
export async function getKeyMetrics(symbol) {
  if (!symbol) throw new Error("symbol is required");

  const fundamentals = await getFundamentals(symbol);
  const { summaryDetail, financialData, defaultKeyStatistics } =
    fundamentals || {};

  const unwrap = (v) => {
    if (v == null) return null;
    if (typeof v === "object" && "raw" in v) return v.raw;
    return v;
  };

  // return the key metrics
  return {
    symbol,
    price: unwrap(financialData?.currentPrice),
    marketCap: unwrap(
      summaryDetail?.marketCap ?? defaultKeyStatistics?.marketCap
    ),
    pe: unwrap(
      summaryDetail?.trailingPE ??
        summaryDetail?.forwardPE ??
        defaultKeyStatistics?.trailingPE ??
        defaultKeyStatistics?.forwardPE
    ),
    debtToEquity: unwrap(financialData?.debtToEquity),
    beta: unwrap(summaryDetail?.beta ?? defaultKeyStatistics?.beta),
  };
}

// Example usage and testing functions (uncomment to test)
async function testDataFetching() {
  try {
    // Test historical data
    const historicalData = await queryPriceData(
      "AAPL",
      "2024-01-01",
      "2024-01-31",
      "1d"
    );
    logger.log(`Fetched ${historicalData.length} days of AAPL data`);
    logger.log(historicalData);
    logger.log(historicalData[0]);

    // Test fundamentals
    const fundamentals = await getFundamentals("AAPL");
    logger.log("AAPL fundamentals:", fundamentals.summaryDetail);
  } catch (error) {
    logger.error("Test failed:", error.message);
  }
}

// testDataFetching();

/**
 * Fetches calendar events (earnings, dividends, splits) for a symbol
 * @param {string} symbol - Stock symbol
 * @returns {Object} Calendar events including earnings, dividends, and splits
 */
export async function getCalendarEvents(symbol) {
  try {
    // api call to get calendar events from yahoo finance
    const data = await yahooFinance.quoteSummary(symbol, {
      modules: [
        "calendarEvents",
        "upgradeDowngradeHistory",
        "earningsHistory",
        "earnings",
      ],
    });

    return {
      earnings: data.earnings || null,
      calendarEvents: data.calendarEvents || null,
      earningsHistory: data.earningsHistory || null,
    };
  } catch (error) {
    logger.error(
      `Error fetching calendar events for ${symbol}:`,
      error.message
    );
    throw error;
  }
}

/**
 * Alternative method: Get events from chart data (dividends and splits)
 * @param {string} symbol - Stock symbol
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Object} Events including dividends and splits
 */
export async function getEventsFromChart(symbol, startDate, endDate) {
  try {
    const data = await yahooFinance.chart(symbol, {
      period1: startDate,
      period2: endDate,
      interval: "1d",
    });

    return {
      dividends: data.events?.dividends || [],
      splits: data.events?.splits || [],
    };
  } catch (error) {
    logger.error(
      `Error fetching events from chart for ${symbol}:`,
      error.message
    );
    throw error;
  }
}
