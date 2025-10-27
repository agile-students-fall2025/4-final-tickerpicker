import ChartManager from "./charts/chartManager.js";
// Importing the chart config in case we need to use default values in the future
import {
  DEFAULT_CHART_WIDTH,
  DEFAULT_CHART_HEIGHT,
} from "./charts/chartConfig.js";

const chartManager = ChartManager;

// Initialize chart using the clip-level method with default container
async function initializeApp() {
  // Using service container (no need to pass createChartContainer)
  await chartManager.initializeChart("AAPL", "2024-01-01", "2024-01-31", "1d");

  // Example with custom width/height
  // await chartManager.initializeChart("MSFT", "2024-01-01", "2024-01-31", "1d", null, 1200, 600);
}

// Start the app
initializeApp();
