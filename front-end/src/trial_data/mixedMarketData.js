/**
 * Mixed Market Data - Realistic mix of up/down candles with varying sizes
 * Generated using neutral skew for balanced up/down days
 */

import { generateStockData } from "./dataGenerator.js";

// Generate mixed data with neutral skew (balanced up and down days)
export const mixedMarketData = generateStockData(150, 30, 0.02, 0);
