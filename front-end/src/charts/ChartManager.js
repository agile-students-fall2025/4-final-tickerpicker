import { createChart, CandlestickSeries, LineSeries } from "lightweight-charts";
import {
  getChartConfig,
  CANDLESTICK_COLORS,
  DEFAULT_CHART_WIDTH,
  DEFAULT_CHART_HEIGHT,
} from "./chartConfig.js";

class ChartManager {
  constructor() {
    this.charts = {};
    this.series = {};
    console.log("ChartManager initialized");
  }

  /**
   * Creates a new chart instance
   * @param { string } chartId - Unique identifier for this chart
   * @param { HTMLElement } containerId - DOM element to contain the chart
   * @param { object } options - Chart configuration options
   * @returns { object } The created chart instance
   */

  addChart(chartId, containerId, options = {}) {
    if (this.charts[chartId]) {
      console.warn(`Chart with id ${chartId} already exists. Removing it...`);
      this.removeChart(chartId);
    }

    // Merge default config with user options. User options override default config.
    const chartConfig = { ...getChartConfig(), ...options };

    const chart = createChart(containerId, chartConfig);
    this.charts[chartId] = chart;
    this.series[chartId] = {};
    console.log(`Chart with id ${chartId} added successfully`);
    return chart;
  }

  /**
   * Adds a candlestick series to a chart
   * @param { string } chartId - The chart to add series to
   * @param { string } seriesId - Unique identifier for this series
   * @param { object } options - Series configuration options
   * @returns { object } The created series instance
   */

  async addCandlestickSeries(chartId, seriesId, options = {}) {
    // Check if the chart exists
    if (!this.charts[chartId]) {
      throw new Error(`Chart with id ${chartId} does not exist`);
    }

    // Check if the series already exists
    if (this.series[chartId][seriesId]) {
      console.warn(
        `Series with id ${seriesId} already exists on chart ${chartId}`
      );
      return this.series[chartId][seriesId];
    }

    // Fetch the chart instance
    const chart = this.charts[chartId];

    // Wait for the chart to be ready before adding series
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Merge default candlestick options with user options. User options override default options.
          const candlestickOptions = { ...CANDLESTICK_COLORS, ...options };
          // Add the series to the chart
          const series = chart.addSeries(CandlestickSeries, candlestickOptions);
          // Store the series instance in the series object
          this.series[chartId][seriesId] = series;
          console.log(
            `Candlestick series with id ${seriesId} added to chart ${chartId} successfully`
          );
          resolve(series);
        } catch (error) {
          console.error(`Error adding series to chart ${chartId}:`, error);
          reject(error);
        }
      }, 100);
    });
  }

  addLineSeries(chartId, seriesId, options = {}) {
    if (!this.charts[chartId]) {
      throw new Error(`Chart with id ${chartId} does not exist`);
    }
    if (this.series[chartId][seriesId]) {
      console.warn(
        `Series with id ${seriesId} already exists on chart ${chartId}`
      );
      return this.series[chartId][seriesId];
    }
    const lineOptions = { ...LINE_COLORS, ...options };
    const series = this.charts[chartId].addSeries(LineSeries, lineOptions);
    this.series[chartId][seriesId] = series;
    console.log(
      `Line series with id ${seriesId} added to chart ${chartId} successfully`
    );
    return series;
  }

  removeChart(chartId) {
    if (!this.charts[chartId]) {
      throw new Error(`Chart with id ${chartId} does not exist`);
    }
    this.charts[chartId].remove();

    delete this.charts[chartId];
    delete this.series[chartId];

    console.log(`Chart with id ${chartId} removed successfully`);
    return true;
  }

  removeAllCharts() {
    const chartIds = Object.keys(this.charts);
    for (const chartId of chartIds) {
      this.removeChart(chartId);
    }
    console.log(`All charts removed successfully`);
    return true;
  }

  // This function will probably never be used unless we want to swap out a series for another. But we might as well just delete the chart instance and make a new one.
  removeSeries(chartId, seriesId) {
    if (!this.charts[chartId] || !this.series[chartId][seriesId]) {
      throw new Error(
        `Series with id ${seriesId} does not exist on chart ${chartId}`
      );
    }
    this.series[chartId][seriesId].remove();
    delete this.series[chartId][seriesId];
    console.log(
      `Series with id ${seriesId} removed from chart ${chartId} successfully`
    );
    return true;
  }

  getChart(chartId) {
    return this.charts[chartId] || null;
  }

  getSeries(chartId, seriesId) {
    if (!this.series[chartId] || !this.series[chartId][seriesId]) {
      throw new Error(
        `Series with id ${seriesId} does not exist on chart ${chartId}`
      );
    }
    return this.series[chartId][seriesId] || null;
  }

  hasChart(chartId) {
    return this.charts[chartId] ? true : false;
  }

  getChartIds() {
    return Object.keys(this.charts);
  }

  getChartCount() {
    return Object.keys(this.charts).length;
  }

  generateChartId(symbol, startDate, endDate, timeframe = "1d") {
    return `${symbol}-${startDate}-${endDate}-${timeframe}-chart`;
  }

  generateChartTitle(symbol) {
    return `${symbol}`;
  }

  generateSeriesId(symbol, startDate, endDate, timeframe = "1d") {
    return `${symbol}-${startDate}-${endDate}-${timeframe}-series`;
  }

  createDefaultChartContainer(
    id,
    title,
    width = DEFAULT_CHART_WIDTH,
    height = DEFAULT_CHART_HEIGHT
  ) {
    const app = document.getElementById("app");

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

  async initializeChart(
    symbol,
    startDate,
    endDate,
    timeframe = "1d",
    containerCreator = null,
    width = DEFAULT_CHART_WIDTH,
    height = DEFAULT_CHART_HEIGHT
  ) {
    const chartId = this.generateChartId(symbol, startDate, endDate, timeframe);
    const chartTitle = this.generateChartTitle(symbol);

    // Use default container creator if none provided
    const createContainer =
      containerCreator || this.createDefaultChartContainer.bind(this);
    const chartDiv = createContainer(chartId, chartTitle, width, height);

    const chart = this.addChart(chartId, chartDiv);

    // Add series and wait for it to be created
    const seriesId = this.generateSeriesId(
      symbol,
      startDate,
      endDate,
      timeframe
    );
    const series = await this.addCandlestickSeries(chartId, seriesId);

    // Fetch data from backend API
    const data = await this.fetchPriceData(
      symbol,
      startDate,
      endDate,
      timeframe
    );
    series.setData(data);
    chart.timeScale().fitContent();

    console.log("Created chart successfully");

    return chart;
  }

  async fetchPriceData(symbol, startDate, endDate, timeframe) {
    try {
      const response = await fetch(
        `http://localhost:3001/api/price-data/${symbol}?startDate=${startDate}&endDate=${endDate}&timeframe=${timeframe}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const quotes = data.quotes || data; // Handle both full response and quotes array

      // Transform data format for lightweight-charts
      return quotes.map((quote) => ({
        time: Math.floor(new Date(quote.date).getTime() / 1000), // Convert to Unix timestamp
        open: quote.open,
        high: quote.high,
        low: quote.low,
        close: quote.close,
        volume: quote.volume,
      }));
    } catch (error) {
      console.error("Error fetching price data:", error);
      throw error;
    }
  }
}

const chartManagerInstance = new ChartManager();
export default chartManagerInstance;
