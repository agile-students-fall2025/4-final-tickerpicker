# Inserting Charts Into Your Webpage

This guide shows you how to add interactive price charts to any webpage in your application.

## Quick Start

### 1. Import ChartManager

```javascript
import ChartManager from "./charts/chartManager.js";
```

### 2. Create a Chart Container Function

You need a function that creates the DOM element where your chart will live:

```javascript
function createChartContainer(id, title, width = 800, height = 400) {
  const app = document.getElementById("app"); // or your container element
  const wrapper = document.createElement("div");
  wrapper.className = "chart-container";

  const titleElement = document.createElement("h3");
  titleElement.className = "chart-title";
  titleElement.textContent = title;

  const chartDiv = document.createElement("div");
  chartDiv.id = id;
  chartDiv.style.width = width + "px";
  chartDiv.style.height = height + "px";

  wrapper.appendChild(titleElement);
  wrapper.appendChild(chartDiv);
  app.appendChild(wrapper);

  return chartDiv;
}
```

### 3. Initialize Your Chart

```javascript
const chartManager = ChartManager; // Use the singleton instance

async function addChart() {
  await chartManager.initializeChart(
    "AAPL", // Symbol (stocks, crypto, ETFs work)
    "2024-01-01", // Start date
    "2024-12-31", // End date
    "1d", // Timeframe (1d, 1wk, 1mo, 1m, 5m, etc.)
    createChartContainer
  );
}

addChart();
```

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
await chartManager.initializeChart(
  "AAPL",
  "2024-01-01",
  "2024-12-31",
  "1d",
  createChartContainer
);
await chartManager.initializeChart(
  "MSFT",
  "2024-01-01",
  "2024-12-31",
  "1d",
  createChartContainer
);

// Crypto
await chartManager.initializeChart(
  "BTC-USD",
  "2024-01-01",
  "2024-12-31",
  "1d",
  createChartContainer
);

// ETFs
await chartManager.initializeChart(
  "SPY",
  "2024-01-01",
  "2024-12-31",
  "1d",
  createChartContainer
);
```

### Different Timeframes

```javascript
// Daily data
await chartManager.initializeChart(
  "AAPL",
  "2024-01-01",
  "2024-12-31",
  "1d",
  createChartContainer
);

// Weekly data
await chartManager.initializeChart(
  "AAPL",
  "2023-01-01",
  "2024-12-31",
  "1wk",
  createChartContainer
);

// Intraday (5-minute)
await chartManager.initializeChart(
  "AAPL",
  "2024-01-01",
  "2024-01-02",
  "5m",
  createChartContainer
);
```

### Custom Chart Sizes

```javascript
function createCustomChartContainer(id, title) {
  return createChartContainer(id, title, 1200, 600); // Wider and taller
}
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
    createChartContainer
  );
  await chartManager.initializeChart(
    "GOOGL",
    "2024-01-01",
    "2024-12-31",
    "1d",
    createChartContainer
  );
  await chartManager.initializeChart(
    "TSLA",
    "2024-01-01",
    "2024-12-31",
    "1d",
    createChartContainer
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
      createChartContainer
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
      createChartContainer
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
    createChartContainer
  );
}

// Use with user input
document.getElementById("add-chart-btn").addEventListener("click", async () => {
  const symbol = document.getElementById("symbol-input").value;
  await createChartForSymbol(symbol);
});
```

That's it! The ChartManager handles all the heavy lifting - data fetching, chart creation, and rendering. Just call `initializeChart()` and you're done.
