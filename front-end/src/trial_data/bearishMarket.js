/**
 * Bearish Market Data - Strong downward trend with mostly red candles
 * Generated using negative skew for bearish bias
 */

import { generateStockData } from "./dataGenerator.js";

// Generate bearish data with negative skew (more down days than up days)
export const bearishMarketData = generateStockData(200, 30, 0.03, -0.3);
