import YahooFinance from "yahoo-finance2";

/**
 * Fetches historical stock data using yahoo-finance2 chart() method
 *
 * Data Structure Learned from Debug:
 * - The yahooFinance.chart() call returns an object with: { meta, quotes, events }
 * - meta: Contains symbol, currency, exchange info, current price
 * - quotes: Array of OHLCV data with date, open, high, low, close, volume, adjClose
 * - events: Contains dividends and stock splits data
 *
 * @param {string} ticker - Stock symbol (e.g., 'AAPL', 'MSFT')
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {string} timeframe - Data interval ('1d', '1wk', '1mo', '1m', '5m', etc.)
 * @returns {Object} Chart data with quotes array and metadata
 */
export async function queryData(
  ticker,
  startDate,
  endDate,
  timeframe = "1d",
  getMetaData = false
) {
  try {
    const yahooFinance = new YahooFinance();

    const data = await yahooFinance.chart(ticker, {
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
    console.error(`Error fetching data for ${ticker}:`, error.message);
    throw error;
  }
}

/**
 * Fetches fundamental data for a stock symbol (Needs to be further developed after deciding what fundamental data we want to display)
 *
 * @param {string} ticker - Stock symbol
 * @returns {Object} Fundamental data including summary, financials, key statistics
 */
export async function getFundamentals(ticker) {
  try {
    const yahooFinance = new YahooFinance();

    const data = await yahooFinance.quoteSummary(ticker, {
      modules: ["summaryDetail", "financialData", "defaultKeyStatistics"],
    });

    return data;
  } catch (error) {
    console.error(`Error fetching fundamentals for ${ticker}:`, error.message);
    throw error;
  }
}

// Example usage and testing functions (uncomment to test)
async function testDataFetching() {
  try {
    // Test historical data
    const historicalData = await queryData(
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

// Uncomment to run test:
testDataFetching();
