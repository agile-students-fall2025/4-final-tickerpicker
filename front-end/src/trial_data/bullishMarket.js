/**
 * Bullish Market Data - Strong upward trend with mostly green candles
 * Generated using positive skew for bullish bias
 */

import { generateStockData } from "./dataGenerator.js";

// Generate bullish data with positive skew (more up days than down days)
export const bullishMarketData = generateStockData(150, 30, 0.02, 0.3);
