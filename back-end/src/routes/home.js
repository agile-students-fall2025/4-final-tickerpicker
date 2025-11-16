import { Router } from "express";
import { queryPriceData, fetchQuotes } from "../data/DataFetcher.js";
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

export default router;
