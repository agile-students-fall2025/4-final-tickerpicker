import PriceData from "../models/PriceData.js";
import { parseDate, formatDate } from "../utils/dateUtils.js";

/**
 * Finds price data in the database for a given symbol, date range, and timeframe
 * @param {string} symbol - Stock symbol (e.g., 'AAPL')
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {string} timeframe - Timeframe (e.g., '1d', '1wk', '1mo')
 * @returns {Promise<Array>} Array of quote objects with date, open, high, low, close, volume, adjClose
 */
export async function findPriceData(
  symbol,
  startDate,
  endDate,
  timeframe = "1d"
) {
  try {
    const symbolUpper = symbol.toUpperCase();
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    // Set end date to end of day
    end.setUTCHours(23, 59, 59, 999);

    const results = await PriceData.find({
      symbol: symbolUpper,
      timeframe: timeframe,
      date: {
        $gte: start,
        $lte: end,
      },
    })
      .sort({ date: 1 }) // Sort by date ascending
      .lean(); // Return plain JavaScript objects

    // Transform to match the format expected by the frontend
    // Format: { date, open, high, low, close, volume, adjClose }
    return results.map((doc) => ({
      date: formatDate(doc.date),
      open: doc.open,
      high: doc.high,
      low: doc.low,
      close: doc.close,
      volume: doc.volume,
      adjClose: doc.adjClose,
    }));
  } catch (error) {
    console.error(`Error finding price data for ${symbol}:`, error.message);
    throw error;
  }
}

/**
 * Inserts price data into the database (bulk insert with upsert)
 * @param {string} symbol - Stock symbol
 * @param {string} timeframe - Timeframe (e.g., '1d', '1wk', '1mo')
 * @param {Array} quotes - Array of quote objects with date, open, high, low, close, volume, adjClose
 * @returns {Promise<void>}
 */
export async function insertPriceData(symbol, timeframe, quotes) {
  if (!quotes || quotes.length === 0) {
    return;
  }

  try {
    const symbolUpper = symbol.toUpperCase();

    // Prepare documents for bulk write
    const operations = quotes.map((quote) => {
      const date = parseDate(quote.date);
      return {
        updateOne: {
          filter: {
            symbol: symbolUpper,
            timeframe: timeframe,
            date: date,
          },
          update: {
            $set: {
              symbol: symbolUpper,
              timeframe: timeframe,
              date: date,
              open: quote.open,
              high: quote.high,
              low: quote.low,
              close: quote.close,
              volume: quote.volume,
              adjClose: quote.adjClose || null,
            },
          },
          upsert: true, // Insert if doesn't exist, update if exists
        },
      };
    });

    // Execute bulk write
    await PriceData.bulkWrite(operations, { ordered: false });
    console.log(
      `Inserted/updated ${quotes.length} price data records for ${symbolUpper} (${timeframe})`
    );
  } catch (error) {
    console.error(`Error inserting price data for ${symbol}:`, error.message);
    throw error;
  }
}

/**
 * Finds date gaps in the database for a given symbol, date range, and timeframe
 * Returns an array of { startDate, endDate } objects representing missing date ranges
 * @param {string} symbol - Stock symbol
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {string} timeframe - Timeframe (e.g., '1d', '1wk', '1mo')
 * @returns {Promise<Array>} Array of { startDate, endDate } objects for missing ranges
 */
export async function findDateGaps(
  symbol,
  startDate,
  endDate,
  timeframe = "1d"
) {
  try {
    const symbolUpper = symbol.toUpperCase();
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    end.setUTCHours(23, 59, 59, 999);

    // Get all existing dates in the range
    const existingDocs = await PriceData.find({
      symbol: symbolUpper,
      timeframe: timeframe,
      date: {
        $gte: start,
        $lte: end,
      },
    })
      .select("date")
      .sort({ date: 1 })
      .lean();

    const existingDates = new Set(
      existingDocs.map((doc) => formatDate(doc.date))
    );

    // Generate all expected dates in the range
    const expectedDates = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      expectedDates.push(formatDate(currentDate));
      // Increment date based on timeframe
      if (timeframe === "1d") {
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      } else if (timeframe === "1wk") {
        currentDate.setUTCDate(currentDate.getUTCDate() + 7);
      } else if (timeframe === "1mo") {
        currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
      } else {
        // Default to daily increment
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }
    }

    // Find missing dates
    const missingDates = expectedDates.filter(
      (date) => !existingDates.has(date)
    );

    if (missingDates.length === 0) {
      return []; // No gaps
    }

    // Group consecutive missing dates into ranges
    const gaps = [];
    let gapStart = missingDates[0];
    let gapEnd = missingDates[0];

    for (let i = 1; i < missingDates.length; i++) {
      const current = parseDate(missingDates[i]);
      const previous = parseDate(missingDates[i - 1]);
      const daysDiff = Math.floor((current - previous) / (1000 * 60 * 60 * 24));

      // If dates are consecutive (or within reasonable range for the timeframe), extend the gap
      const maxGap = timeframe === "1d" ? 1 : timeframe === "1wk" ? 7 : 30;
      if (daysDiff <= maxGap) {
        gapEnd = missingDates[i];
      } else {
        // Start a new gap
        gaps.push({ startDate: gapStart, endDate: gapEnd });
        gapStart = missingDates[i];
        gapEnd = missingDates[i];
      }
    }

    // Add the last gap
    gaps.push({ startDate: gapStart, endDate: gapEnd });

    return gaps;
  } catch (error) {
    console.error(`Error finding date gaps for ${symbol}:`, error.message);
    throw error;
  }
}

/**
 * Gets the most recent cached date for a symbol and timeframe
 * @param {string} symbol - Stock symbol
 * @param {string} timeframe - Timeframe (e.g., '1d', '1wk', '1mo')
 * @returns {Promise<string|null>} Most recent date in YYYY-MM-DD format, or null if no data exists
 */
export async function getLatestDate(symbol, timeframe = "1d") {
  try {
    const symbolUpper = symbol.toUpperCase();

    const latest = await PriceData.findOne({
      symbol: symbolUpper,
      timeframe: timeframe,
    })
      .sort({ date: -1 }) // Sort by date descending
      .select("date")
      .lean();

    if (!latest) {
      return null;
    }

    return formatDate(latest.date);
  } catch (error) {
    console.error(`Error getting latest date for ${symbol}:`, error.message);
    throw error;
  }
}
