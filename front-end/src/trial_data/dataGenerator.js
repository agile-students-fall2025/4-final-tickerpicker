/**
 * Stock Data Generator
 * Creates realistic OHLC data with varying candle sizes and directions
 */

export function generateStockData(
  startPrice = 150,
  days = 30,
  volatility = 0.02,
  skew = 0.1
) {
  const data = [];
  let currentPrice = startPrice;

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    const timeString = date.toISOString().split("T")[0];

    // Direction based on skew parameter
    // skew > 0 = bullish bias, skew < 0 = bearish bias, skew = 0 = neutral
    const upProbability = 0.5 + skew;
    const isUp = Math.random() < upProbability;

    // Random volatility multiplier (0.5x to 2x base volatility)
    const volatilityMultiplier = 0.5 + Math.random() * 1.5;

    // Calculate price change based on direction and volatility
    const priceChange =
      Math.random() * volatility * volatilityMultiplier * currentPrice;
    const newPrice = isUp
      ? currentPrice + priceChange
      : currentPrice - priceChange;

    // Generate OHLC with realistic relationships
    const open = currentPrice;
    const close = newPrice;

    // High and low with realistic wicks
    const bodySize = Math.abs(close - open);
    const wickSize = bodySize * (0.2 + Math.random() * 0.8); // 20-100% of body size

    const high = Math.max(open, close) + Math.random() * wickSize;
    const low = Math.min(open, close) - Math.random() * wickSize;

    data.push({
      time: timeString,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    });

    currentPrice = close;
  }

  return data;
}

export function generateTrendingData(
  startPrice = 150,
  days = 30,
  trendDirection = "up"
) {
  const data = [];
  let currentPrice = startPrice;
  const trendStrength = trendDirection === "up" ? 0.015 : -0.015;

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    const timeString = date.toISOString().split("T")[0];

    // Add trend component
    const trendChange = currentPrice * trendStrength * (0.5 + Math.random());

    // Random volatility
    const volatility = currentPrice * 0.02 * (0.5 + Math.random());
    const randomChange = (Math.random() - 0.5) * volatility;

    const newPrice = currentPrice + trendChange + randomChange;

    // Generate OHLC
    const open = currentPrice;
    const close = newPrice;
    const bodySize = Math.abs(close - open);
    const wickSize = bodySize * (0.3 + Math.random() * 0.7);

    const high = Math.max(open, close) + Math.random() * wickSize;
    const low = Math.min(open, close) - Math.random() * wickSize;

    data.push({
      time: timeString,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    });

    currentPrice = close;
  }

  return data;
}

export function generateVolatileData(startPrice = 150, days = 30) {
  const data = [];
  let currentPrice = startPrice;

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    const timeString = date.toISOString().split("T")[0];

    // High volatility with random direction
    const volatility = currentPrice * 0.04 * (0.8 + Math.random() * 0.4); // 3.2-4.8% volatility
    const direction = Math.random() < 0.5 ? 1 : -1;
    const priceChange = direction * volatility * (0.5 + Math.random());

    const newPrice = currentPrice + priceChange;

    // Generate OHLC with large wicks
    const open = currentPrice;
    const close = newPrice;
    const bodySize = Math.abs(close - open);
    const wickSize = bodySize * (0.5 + Math.random() * 1.5); // Large wicks

    const high = Math.max(open, close) + Math.random() * wickSize;
    const low = Math.min(open, close) - Math.random() * wickSize;

    data.push({
      time: timeString,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    });

    currentPrice = close;
  }

  return data;
}

export function generateSidewaysData(startPrice = 150, days = 30) {
  const data = [];
  let currentPrice = startPrice;

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    const timeString = date.toISOString().split("T")[0];

    // Small random movements around the starting price
    const volatility = startPrice * 0.01 * (0.5 + Math.random()); // 0.5-1% volatility
    const direction = Math.random() < 0.5 ? 1 : -1;
    const priceChange = direction * volatility * (0.3 + Math.random() * 0.7);

    const newPrice = currentPrice + priceChange;

    // Generate OHLC with small bodies and moderate wicks
    const open = currentPrice;
    const close = newPrice;
    const bodySize = Math.abs(close - open);
    const wickSize = bodySize * (0.4 + Math.random() * 0.6);

    const high = Math.max(open, close) + Math.random() * wickSize;
    const low = Math.min(open, close) - Math.random() * wickSize;

    data.push({
      time: timeString,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    });

    currentPrice = close;
  }

  return data;
}
