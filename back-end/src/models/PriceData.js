import mongoose from "mongoose";

/**
 * PriceData Schema
 * Stores OHLCV (Open, High, Low, Close, Volume) price data for symbols
 * One document per symbol/timeframe/date combination
 */
const priceDataSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      index: true,
      uppercase: true, // Always store symbols in uppercase
      trim: true,
    },
    timeframe: {
      type: String,
      required: true,
      index: true,
      enum: ["1m", "5m", "15m", "30m", "1h", "1d", "1wk", "1mo"],
      default: "1d",
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    open: {
      type: Number,
      required: true,
    },
    high: {
      type: Number,
      required: true,
    },
    low: {
      type: Number,
      required: true,
    },
    close: {
      type: Number,
      required: true,
    },
    volume: {
      type: Number,
      required: true,
    },
    adjClose: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Compound index for efficient queries by symbol, timeframe, and date range
priceDataSchema.index({ symbol: 1, timeframe: 1, date: 1 }, { unique: true });

/**
 * PriceData Model
 * Collection name will be 'pricedatas' (Mongoose pluralizes)
 */
const PriceData = mongoose.model("PriceData", priceDataSchema);

export default PriceData;

