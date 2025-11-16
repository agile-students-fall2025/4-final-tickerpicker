import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ChartManager from "../charts/ChartManager.js";

const USE_MOCK = false

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  // Chart refs
  const nasdaqRef = useRef(null);
  const sp500Ref = useRef(null);
  const nikkeiRef = useRef(null);
  const europeanRef = useRef(null);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [chartErrors, setChartErrors] = useState({});
  const chartIdsRef = useRef([]);

  // Data states
  const [watchlists, setWatchlists] = useState([]);
  const [recommendedPicks, setRecommendedPicks] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);

  // Calculate date range (last 6 months)
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 180); // 6 months ago

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    };
  };

  // Load data based on USE_MOCK setting
  useEffect(() => {
    const loadData = async () => {
      console.log("HomePage: USE_MOCK =", USE_MOCK);

      if (USE_MOCK) {
        // Load mock data
        const { mockWatchlists, mockRecommendedPicks, mockTopPerformers } =
          await import("../../mock/data.js");
        console.log("HomePage: Loaded mock data:", {
          watchlists: mockWatchlists,
          recommendedPicks: mockRecommendedPicks,
          topPerformers: mockTopPerformers.length,
        });
        setWatchlists(mockWatchlists);
        setRecommendedPicks(mockRecommendedPicks);
        setTopPerformers(mockTopPerformers);
      } else {
        // In production, fetch from API
        // TODO: Implement API calls when backend is ready
        console.log("HomePage: USE_MOCK is false, no data loaded");
        setWatchlists([]);
        setRecommendedPicks([]);
        setTopPerformers([]);
      }
    };

    loadData();
  }, []);

  // Initialize charts
  useEffect(() => {
    const { startDate, endDate } = getDateRange();
    const chartConfigs = [
      {
        symbol: "^IXIC",
        ref: nasdaqRef,
        name: "NASDAQ",
        width: 600,
        height: 250,
      },
      {
        symbol: "^GSPC",
        ref: sp500Ref,
        name: "S&P 500",
        width: 600,
        height: 250,
      },
      {
        symbol: "^N225",
        ref: nikkeiRef,
        name: "Nikkei 225",
        width: 600,
        height: 250,
      },
      {
        symbol: "^STOXX50E",
        ref: europeanRef,
        name: "Euro STOXX 50",
        width: 600,
        height: 250,
      },
    ];

    const initializeCharts = async () => {
      setLoading(true);
      const errors = {};

      for (const config of chartConfigs) {
        if (config.ref.current) {
          try {
            // Clear existing content
            config.ref.current.innerHTML = "";

            // Create container creator function for this chart
            const containerCreator = (chartId, chartTitle, width, height) => {
              const containerDiv = document.createElement("div");
              containerDiv.id = chartId;

              // Use fixed dimensions - lightweight-charts will use container size
              // Set explicit width/height so chart renders at correct size
              containerDiv.style.width = `${width}px`;
              containerDiv.style.height = `${height}px`;
              containerDiv.style.margin = "0 auto";
              containerDiv.style.position = "relative";

              // Append to the ref's current element
              if (config.ref.current) {
                config.ref.current.appendChild(containerDiv);
              }

              return containerDiv;
            };

            // Initialize chart
            await ChartManager.initializeChart(
              config.symbol,
              startDate,
              endDate,
              "1d",
              containerCreator,
              config.width,
              config.height
            );

            // Store chart ID for cleanup
            const chartId = ChartManager.generateChartId(
              config.symbol,
              startDate,
              endDate,
              "1d"
            );
            chartIdsRef.current.push(chartId);
          } catch (error) {
            console.error(`Error initializing ${config.name} chart:`, error);
            errors[config.name] = error.message;
          }
        }
      }

      setChartErrors(errors);
      setLoading(false);
    };

    initializeCharts();

    // Cleanup function
    return () => {
      chartIdsRef.current.forEach((chartId) => {
        try {
          if (ChartManager.hasChart(chartId)) {
            ChartManager.removeChart(chartId);
          }
        } catch (error) {
          // Ignore cleanup errors
        }
      });
      chartIdsRef.current = [];
    };
  }, []);

  if (!isAuthenticated) {
    console.log(
      "Make sure the user is valid and authenticated when viewing home"
    );
    return null;
  }

  const defaultWatchlist = watchlists[0];
  const watchlistStocks = defaultWatchlist?.stocks || [];

  return (
    <section className="w-full flex flex-col gap-16">
      {/* Top Section - Two Columns */}
      <div className="grid grid-cols-12 gap-16">
        {/* Left Column - Watchlist */}
        <div className="col-span-6 flex flex-col gap-8">
          <div className="tp-card p-8 min-h-[420px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-black">WatchList</h2>
              <Link
                to="/watchlist"
                className="text-sm text-tp-accent hover:underline"
              >
                View All
              </Link>
            </div>

            {defaultWatchlist && watchlistStocks.length > 0 ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-tp-text-dim mb-2">
                  {defaultWatchlist.name}
                </p>
                <ul className="space-y-2">
                  {watchlistStocks.slice(0, 5).map((symbol) => (
                    <li
                      key={symbol}
                      className="tp-card p-3 flex items-center justify-between"
                    >
                      <span className="font-semibold text-black">{symbol}</span>
                      <Link
                        to={`/stock/${symbol}`}
                        className="text-sm text-tp-text-dim hover:underline"
                      >
                        View →
                      </Link>
                    </li>
                  ))}
                </ul>
                {watchlistStocks.length > 5 && (
                  <p className="text-xs text-tp-text-dim mt-2">
                    +{watchlistStocks.length - 5} more stocks
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-sm text-tp-text-dim mb-4 text-center">
                  No watchlists yet. Create one to track your favorite stocks.
                </p>
                <Link to="/watchlist" className="tp-btn-primary text-sm">
                  Create Watchlist
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Recommended Picks */}
        <div className="col-span-6 flex flex-col gap-8">
          <div className="tp-card p-8 min-h-[420px]">
            <h3 className="text-lg font-semibold text-black mb-4">
              Recommended Ticker Picks
            </h3>

            <div className="flex flex-col gap-3">
              {recommendedPicks.length > 0 ? (
                <ul className="space-y-2">
                  {recommendedPicks.map((stock) => (
                    <li
                      key={stock.symbol}
                      className="tp-card p-4 flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-black text-lg">
                          {stock.symbol}
                        </span>
                        <span className="text-xs text-tp-text-dim">
                          {stock.company}
                        </span>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-black text-sm">
                            ${stock.price.toFixed(2)}
                          </span>
                          <span
                            className={
                              stock.change >= 0
                                ? "text-green-600 text-sm"
                                : "text-red-600 text-sm"
                            }
                          >
                            {stock.change >= 0 ? "+" : ""}
                            {stock.change.toFixed(2)} (
                            {stock.changePercent >= 0 ? "+" : ""}
                            {stock.changePercent.toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                      <Link to={`/stock/${stock.symbol}`}>
                        <button className="tp-btn-primary text-xs px-3 py-1">
                          View
                        </button>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-sm text-tp-text-dim text-center">
                    No recommended picks available.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Charts */}
      <div className="flex flex-col gap-8">
        {/* Top 20 Performers List */}
        <div className="tp-card p-6">
          <h3 className="text-lg font-semibold text-black mb-4">
            Top 20 Performers
          </h3>

          <div className="flex flex-col gap-2">
            {topPerformers.length > 0 ? (
              <ul className="space-y-2">
                {topPerformers
                  .sort((a, b) => b.changePercent - a.changePercent)
                  .map((stock, index) => (
                    <li
                      key={stock.symbol}
                      className="tp-card p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-tp-text-dim text-sm font-medium w-8">
                          #{index + 1}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-semibold text-black text-lg">
                            {stock.symbol}
                          </span>
                          <span className="text-xs text-tp-text-dim">
                            {stock.company}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-black text-sm font-medium">
                          ${stock.price.toFixed(2)}
                        </span>
                        <span
                          className={
                            stock.change >= 0
                              ? "text-green-600 text-sm font-medium"
                              : "text-red-600 text-sm font-medium"
                          }
                        >
                          {stock.change >= 0 ? "+" : ""}
                          {stock.change.toFixed(2)} (
                          {stock.changePercent >= 0 ? "+" : ""}
                          {stock.changePercent.toFixed(2)}%)
                        </span>
                        <Link
                          to={`/stock/${stock.symbol}`}>
                          <button className="tp-btn-primary text-xs px-3 py-1">
                            View
                        </button>
                        </Link>
                        
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-sm text-tp-text-dim text-center">
                  No top performers data available.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Index Charts - One per row */}
        <div className="flex flex-col gap-4">
          {/* NASDAQ */}
          <div className="tp-card p-6 overflow-hidden">
            <h4 className="text-sm font-semibold text-black mb-4">NASDAQ</h4>
            {loading && (
              <div className="flex items-center justify-center h-[250px]">
                <p className="text-xs text-tp-text-dim">Loading...</p>
              </div>
            )}
            {chartErrors["NASDAQ"] && (
              <div className="flex items-center justify-center h-[250px]">
                <p className="text-xs text-red-400">Error loading chart</p>
              </div>
            )}
            <div ref={nasdaqRef} className="w-full flex justify-center"></div>
          </div>

          {/* S&P 500 */}
          <div className="tp-card p-6 overflow-hidden">
            <h4 className="text-sm font-semibold text-black mb-4">S&P 500</h4>
            {loading && (
              <div className="flex items-center justify-center h-[250px]">
                <p className="text-xs text-tp-text-dim">Loading...</p>
              </div>
            )}
            {chartErrors["S&P 500"] && (
              <div className="flex items-center justify-center h-[250px]">
                <p className="text-xs text-red-400">Error loading chart</p>
              </div>
            )}
            <div ref={sp500Ref} className="w-full flex justify-center"></div>
          </div>

          {/* Nikkei 225 */}
          <div className="tp-card p-6 overflow-hidden">
            <h4 className="text-sm font-semibold text-black mb-4">
              Nikkei 225
            </h4>
            {loading && (
              <div className="flex items-center justify-center h-[250px]">
                <p className="text-xs text-tp-text-dim">Loading...</p>
              </div>
            )}
            {chartErrors["Nikkei 225"] && (
              <div className="flex items-center justify-center h-[250px]">
                <p className="text-xs text-red-400">Error loading chart</p>
              </div>
            )}
            <div ref={nikkeiRef} className="w-full flex justify-center"></div>
          </div>

          {/* European Index */}
          <div className="tp-card p-6 overflow-hidden">
            <h4 className="text-sm font-semibold text-black mb-4">
              Euro STOXX 50
            </h4>
            {loading && (
              <div className="flex items-center justify-center h-[250px]">
                <p className="text-xs text-tp-text-dim">Loading...</p>
              </div>
            )}
            {chartErrors["Euro STOXX 50"] && (
              <div className="flex items-center justify-center h-[250px]">
                <p className="text-xs text-red-400">Error loading chart</p>
              </div>
            )}
            <div ref={europeanRef} className="w-full flex justify-center"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
