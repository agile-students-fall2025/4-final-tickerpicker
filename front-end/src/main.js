import ChartManager from "./charts/chartManager.js";
import {
  DEFAULT_CHART_WIDTH,
  DEFAULT_CHART_HEIGHT,
} from "./charts/chartConfig.js";
import { mixedMarketData } from "./trial_data/mixedMarketData.js";
// For bullish market
import { bullishMarketData } from "./trial_data/bullishMarket.js";

// For bearish market
import { bearishMarketData } from "./trial_data/bearishMarket.js";

// For generated data
import { generateStockData } from "./trial_data/dataGenerator.js";

const chartManager = new ChartManager();

const container = document.getElementById("app");

const chartDiv = document.createElement("div");
chartDiv.id = "chart-container";
chartDiv.style.width = DEFAULT_CHART_WIDTH + "px";
chartDiv.style.height = DEFAULT_CHART_HEIGHT + "px";
container.appendChild(chartDiv);

const chartId = "chart-1";
const chart = chartManager.addChart(chartId, chartDiv);

// Add series and wait for it to be created
chartManager.addCandlestickSeries(chartId, "series-1");

// Wait for the series to be created, then add data
setTimeout(() => {
  const series = chartManager.getSeries(chartId, "series-1");
  if (series) {
    series.setData(generateStockData());
    chart.timeScale().fitContent();
  }
}, 200);

console.log("Created chart successfully");
