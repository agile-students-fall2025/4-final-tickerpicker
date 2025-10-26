import chartManagerInstance from "./charts/chartManager.js";
import {
  DEFAULT_CHART_WIDTH,
  DEFAULT_CHART_HEIGHT,
} from "./charts/chartConfig.js";

function createChartContainer(
  id,
  title,
  chartWidth = DEFAULT_CHART_WIDTH,
  chartHeight = DEFAULT_CHART_HEIGHT
) {
  const app = document.getElementById("app");
  const wrapper = document.createElement("div");
  wrapper.className = "chart-container";
  const titleElement = document.createElement("h3");
  titleElement.className = "chart-title";
  titleElement.textContent = title;
  const chartDiv = document.createElement("div");
  chartDiv.id = id;
  chartDiv.style.width = chartWidth + "px";
  chartDiv.style.height = chartHeight + "px";
  wrapper.appendChild(titleElement);
  wrapper.appendChild(chartDiv);
  app.appendChild(wrapper);
  return chartDiv;
}

// Initialize the charts when the page loads
chartManagerInstance.initializeChart(
  "AAPL",
  "2024-01-01",
  "2024-01-31",
  "1d",
  createChartContainer
);
