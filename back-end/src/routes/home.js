import { Router } from "express";
import {
  queryPriceData,
  fetchQuotes,
  fetchQuotesParallel,
} from "../data/DataFetcher.js";
import { calculateSharpeRatio } from "../utils/SharpeRatio.js";

const router = Router();

// SPDR Sector Select ETFs
const SPDR_ETFS = [
  "XLC", // Communication Services
  "XLY", // Consumer Discretionary
  "XLP", // Consumer Staples
  "XLE", // Energy
  "XLF", // Financials
  "XLV", // Health Care
  "XLI", // Industrials
  "XLB", // Materials
  "XLRE", // Real Estate
  "XLK", // Technology
  "XLU", // Utilities
];

/**
 * GET /api/home/recommended-picks
 * Returns recommended SPDR ETFs based on Sharpe ratio over the last month
 *
 * Response format:
 * {
 *   picks: [
 *     {
 *       symbol: string,
 *       company: string,
 *       price: number,
 *       change: number,
 *       changePercent: number,
 *       sharpeRatio: number
 *     }
 *   ]
 * }
 */
router.get("/recommended-picks", async (req, res) => {
  try {
    // Calculate date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);

    // Fetch price data and calculate Sharpe ratios for all ETFs
    const etfData = [];

    for (const symbol of SPDR_ETFS) {
      try {
        // Fetch 1 month of daily price data
        const priceData = await queryPriceData(
          symbol,
          startDateStr,
          endDateStr,
          "1d"
        );

        if (!priceData || priceData.length < 2) {
          console.warn(`Insufficient data for ${symbol}`);
          continue;
        }

        // Calculate Sharpe ratio
        const sharpeRatio = calculateSharpeRatio(priceData);

        if (sharpeRatio === null || isNaN(sharpeRatio)) {
          console.warn(`Could not calculate Sharpe ratio for ${symbol}`);
          continue;
        }

        etfData.push({
          symbol,
          sharpeRatio,
          priceData, // Keep for later use
        });
      } catch (error) {
        console.error(`Error processing ${symbol}:`, error.message);
        // Continue with other ETFs even if one fails
        continue;
      }
    }

    // Sort by Sharpe ratio (highest first)
    etfData.sort((a, b) => b.sharpeRatio - a.sharpeRatio);

    // Get top picks (e.g., top 5, or all if less than 5)
    const topPicks = etfData.slice(0, 5);

    if (topPicks.length === 0) {
      return res.json({ picks: [] });
    }

    // Fetch current quotes for the top picks to get price, change, changePercent
    const symbols = topPicks.map((p) => p.symbol);
    const quotes = await fetchQuotes(symbols);

    // Build response with all required fields
    const picks = topPicks
      .map(({ symbol, sharpeRatio }) => {
        const quote = quotes[symbol];

        if (!quote) {
          return null;
        }

        // Extract price data
        const price =
          quote.regularMarketPrice ??
          quote.postMarketPrice ??
          quote.preMarketPrice ??
          quote.previousClose ??
          null;

        const change =
          quote.regularMarketChange ??
          (price != null && quote.previousClose != null
            ? price - quote.previousClose
            : null);

        const changePercent =
          quote.regularMarketChangePercent ??
          (change != null && quote.previousClose
            ? (change / quote.previousClose) * 100
            : null);

        // Get company name
        const company =
          quote.longName ?? quote.shortName ?? quote.displayName ?? symbol;

        return {
          symbol,
          company,
          price: typeof price === "number" ? price : null,
          change: typeof change === "number" ? change : null,
          changePercent:
            typeof changePercent === "number" ? changePercent : null,
          sharpeRatio: sharpeRatio.toFixed(4), // Include for debugging/display if needed
        };
      })
      .filter((p) => p !== null); // Remove any null entries

    res.json({ picks });
  } catch (error) {
    console.error("Error fetching recommended picks:", error);
    res.status(500).json({
      error: "Failed to fetch recommended picks",
      message: error.message,
    });
  }
});

// Nasdaq 100 ticker symbols (as of 2024 - update quarterly)
const NASDAQ_100 = [
  "AAPL",
  "MSFT",
  "AMZN",
  "NVDA",
  "GOOGL",
  "GOOG",
  "META",
  "TSLA",
  "AVGO",
  "COST",
  "NFLX",
  "AMD",
  "PEP",
  "ADBE",
  "CSCO",
  "CMCSA",
  "INTC",
  "TXN",
  "AMGN",
  "QCOM",
  "INTU",
  "ISRG",
  "AMAT",
  "BKNG",
  "VRSK",
  "ADP",
  "PAYX",
  "SBUX",
  "GILD",
  "FISV",
  "LRCX",
  "KLAC",
  "CDNS",
  "SNPS",
  "CTAS",
  "FTNT",
  "NXPI",
  "FAST",
  "WBD",
  "DXCM",
  "ODFL",
  "PCAR",
  "IDXX",
  "TEAM",
  "ANSS",
  "ROST",
  "CTSH",
  "BKR",
  "DASH",
  "ZS",
  "ON",
  "CRWD",
  "MELI",
  "GEHC",
  "CDW",
  "ENPH",
  "MRVL",
  "TTD",
  "ALGN",
  "VRTX",
  "AEP",
  "DLTR",
  "EXC",
  "HON",
  "KDP",
  "KHC",
  "LULU",
  "MNST",
  "PANW",
  "PYPL",
  "REGN",
  "ROKU",
  "SPLK",
  "SWKS",
  "TTWO",
  "VRSN",
  "WDAY",
  "XEL",
  "ZM",
  "DOCN",
  "FANG",
  "LCID",
  "RIVN",
  "RBLX",
  "SOFI",
  "UPST",
  "HOOD",
  "PLTR",
  "RIVN",
  "HOOD",
  // Note: Some symbols may have changed - verify against current Nasdaq 100 list
];

/**
 * GET /api/home/top-performers
 * Returns top 10 performers from Nasdaq 100 based on 1-day change percentage
 *
 * Response format:
 * {
 *   performers: [
 *     {
 *       symbol: string,
 *       company: string,
 *       price: number,
 *       change: number,
 *       changePercent: number
 *     }
 *   ]
 * }
 */
router.get("/top-performers", async (req, res) => {
  try {
    console.log(
      `Fetching quotes for ${NASDAQ_100.length} Nasdaq 100 stocks...`
    );
    const startTime = Date.now();

    // Fetch all quotes in parallel batches (20 at a time)
    const quotes = await fetchQuotesParallel(NASDAQ_100, 20);

    const fetchTime = Date.now() - startTime;
    console.log(
      `Fetched ${Object.keys(quotes).length} quotes in ${fetchTime}ms`
    );

    // Process quotes and extract performance data
    const performers = [];

    for (const symbol of NASDAQ_100) {
      const quote = quotes[symbol];

      if (!quote) {
        continue; // Skip if quote fetch failed
      }

      // Extract price data
      const price =
        quote.regularMarketPrice ??
        quote.postMarketPrice ??
        quote.preMarketPrice ??
        quote.previousClose ??
        null;

      const change =
        quote.regularMarketChange ??
        (price != null && quote.previousClose != null
          ? price - quote.previousClose
          : null);

      const changePercent =
        quote.regularMarketChangePercent ??
        (change != null && quote.previousClose
          ? (change / quote.previousClose) * 100
          : null);

      // Only include stocks with valid changePercent
      if (typeof changePercent === "number" && !isNaN(changePercent)) {
        const company =
          quote.longName ?? quote.shortName ?? quote.displayName ?? symbol;

        performers.push({
          symbol,
          company,
          price: typeof price === "number" ? price : null,
          change: typeof change === "number" ? change : null,
          changePercent: changePercent,
        });
      }
    }

    // Sort by changePercent descending (highest gainers first)
    performers.sort((a, b) => b.changePercent - a.changePercent);

    // Get top 10
    const top10 = performers.slice(0, 10);

    console.log(`Returning top ${top10.length} performers`);
    res.json({ performers: top10 });
  } catch (error) {
    console.error("Error fetching top performers:", error);
    res.status(500).json({
      error: "Failed to fetch top performers",
      message: error.message,
    });
  }
});

export default router;
