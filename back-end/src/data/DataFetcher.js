import YahooFinance from "yahoo-finance2";

/**
 * Fetches historical price data using yahoo-finance2 chart() method
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
 * @returns {Object} Chart data with quotes array and metadata
 */
export async function queryPriceData(
  symbol,
  startDate,
  endDate,
  timeframe = "1d",
  getMetaData = false
) {
  try {
    const yahooFinance = new YahooFinance();

    const data = await yahooFinance.chart(symbol, {
      period1: startDate,
      period2: endDate,
      interval: timeframe,
    });
    if (getMetaData) {
      return data;
    } else {
      return data.quotes;
    }
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error.message);
    throw error;
  }
}

/**
 * Fetches fundamental data for an asset symbol (Needs to be further developed after deciding what fundamental data we want to display)
 *
 * @param {string} symbol - Asset symbol
 * @returns {Object} Fundamental data including summary, financials, key statistics
 */
export async function getFundamentals(symbol) {
  try {
    const yahooFinance = new YahooFinance();

    const data = await yahooFinance.quoteSummary(symbol, {
      modules: ["summaryDetail", "financialData", "defaultKeyStatistics"],
    });

    return data;
  } catch (error) {
    console.error(`Error fetching fundamentals for ${symbol}:`, error.message);
    throw error;
  }
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
    console.log(`Fetched ${historicalData.length} days of AAPL data`);
    console.log(historicalData);
    console.log(historicalData[0]);

    // Test fundamentals
    const fundamentals = await getFundamentals("AAPL");
    console.log("AAPL fundamentals:", fundamentals.summaryDetail);
  } catch (error) {
    console.error("Test failed:", error.message);
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
    const yahooFinance = new YahooFinance();
    // api call to get calendar events from yahoo finance
    const data = await yahooFinance.quoteSummary(symbol, {
      modules: ["calendarEvents", "upgradeDowngradeHistory", "earningsHistory", "earnings"]
    });

    return {
      earnings: data.earnings || null,
      calendarEvents: data.calendarEvents || null,
      earningsHistory: data.earningsHistory || null,
    };
  } catch (error) {
    console.error(`Error fetching calendar events for ${symbol}:`, error.message);
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
    const yahooFinance = new YahooFinance();
    
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
    console.error(`Error fetching events from chart for ${symbol}:`, error.message);
    throw error;
  }
}

