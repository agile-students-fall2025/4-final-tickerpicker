# Inserting Charts Into Your Webpage

This guide shows you how to add interactive price charts to any webpage in your application.

## Quick Start

### 1. Import ChartManager

```javascript
import ChartManager from "./charts/chartManager.js";
```

### 2. Initialize Your Chart

```javascript
const chartManager = ChartManager;

async function addChart() {
  // Default container and size
  await chartManager.initializeChart("AAPL", "2024-01-01", "2024-12-31", "1d");
  
  // With custom width/height
  await chartManager.initializeChart("MSFT", "2024-01-01", "2024-12-31", "1d", null, 1200, 600);
}

addChart();
```

ChartManager handles container creation automatically - no manual DOM setup needed!

## What You Get

- **Historical data** from Yahoo Finance
- **Interactive candlestick charts** with zoom/pan
- **Multiple asset classes** (stocks, crypto, ETFs, forex)

## Will be implemented in the near future:

- **Multiple timeframes** (daily, weekly, monthly, intraday)

NOTE: Multiple timeframes capability already exists, but in its current capacity you will need to develop a frontend dropdown button each time you want to change the timeframe. Future development aims to include a Trading View or Yahoo Finance style dropdown and a function/module for implementing the chart container.

## Customization Options

### Different Symbols

```javascript
// Stocks
await chartManager.initializeChart("AAPL", "2024-01-01", "2024-12-31", "1d");
await chartManager.initializeChart("MSFT", "2024-01-01", "2024-12-31", "1d");

// Crypto
await chartManager.initializeChart("BTC-USD", "2024-01-01", "2024-12-31", "1d");

// ETFs
await chartManager.initializeChart("SPY", "2024-01-01", "2024-12-31", "1d");
```

### Different Timeframes

```javascript
// Daily data
await chartManager.initializeChart(
  "AAPL",
  "2024-01-01",
  "2024-12-31",
  "1d",
);

// Weekly data
await chartManager.initializeChart(
  "AAPL",
  "2023-01-01",
  "2024-12-31",
  "1wk",
);

// Intraday (5-minute)
await chartManager.initializeChart(
  "AAPL",
  "2024-01-01",
  "2024-01-02",
  "5m",
);
```

### Custom Chart Sizes

```javascript
// Pass null for container, then custom width/height
await chartManager.initializeChart("AAPL", "2024-01-01", "2024-12-31", "1d", null, 1200, 600);
```

## Multiple Charts on One Page

```javascript
async function addMultipleCharts() {
  // Add several charts
  await chartManager.initializeChart(
    "AAPL",
    "2024-01-01",
    "2024-12-31",
    "1d",
  );
  await chartManager.initializeChart(
    "GOOGL",
    "2024-01-01",
    "2024-12-31",
    "1d",
  );
  await chartManager.initializeChart(
    "TSLA",
    "2024-01-01",
    "2024-12-31",
    "1d",
  );
}
```

## Error Handling

```javascript
async function addChartWithErrorHandling() {
  try {
    await chartManager.initializeChart(
      "INVALID-SYMBOL",
      "2024-01-01",
      "2024-12-31",
      "1d",
    );
  } catch (error) {
    console.error("Failed to create chart:", error);
    // Show user-friendly error message
  }
}
```

## Styling Your Charts

Add CSS to customize the appearance:

```css
.chart-container {
  margin: 20px 0;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
}

.chart-title {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 18px;
}
```

## Backend Requirements

Make sure your backend server is running on `http://localhost:3001`. The charts automatically fetch data from:

- `GET /api/price-data/:symbol` - Price data
- `GET /api/fundamentals/:symbol` - Fundamental data (needs to be further developed)

## Common Patterns

### Dashboard with Multiple Charts

```javascript
const symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"];

async function createDashboard() {
  for (const symbol of symbols) {
    await chartManager.initializeChart(
      symbol,
      "2024-01-01",
      "2024-12-31",
      "1d",
    );
  }
}
```

### Dynamic Chart Creation

```javascript
function createChartForSymbol(symbol) {
  return chartManager.initializeChart(
    symbol,
    "2024-01-01",
    "2024-12-31",
    "1d",
  );
}

// Use with user input
document.getElementById("add-chart-btn").addEventListener("click", async () => {
  const symbol = document.getElementById("symbol-input").value;
  await createChartForSymbol(symbol);
});
```

That's it! The ChartManager handles all the heavy lifting - data fetching, chart creation, and rendering. Just call `initializeChart()` and you're done.
