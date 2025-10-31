import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ChartManager from "../charts/ChartManager.js";

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

  // Watchlist data (read from localStorage, same as WatchlistPage)
  const [watchlists, setWatchlists] = useState([]);

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

  // Load watchlists from localStorage
  useEffect(() => {
    const defaultWatchlists = [
      { id: 1, name: "Tech Stocks", stocks: ["AAPL", "MSFT", "GOOGL"] },
      { id: 2, name: "My Favorites", stocks: ["NVDA", "TSLA"] },
    ];
    setWatchlists(defaultWatchlists);
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
                      <span className="text-sm text-tp-text-dim">View →</span>
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
              <ul className="space-y-2">
                {[
                  {
                    symbol: "AAPL",
                    company: "Apple Inc.",
                    price: 172.15,
                    change: 2.45,
                    changePercent: 1.44,
                  },
                  {
                    symbol: "NVDA",
                    company: "NVIDIA Corporation",
                    price: 472.35,
                    change: 12.5,
                    changePercent: 2.71,
                  },
                  {
                    symbol: "MSFT",
                    company: "Microsoft Corporation",
                    price: 378.85,
                    change: -1.25,
                    changePercent: -0.33,
                  },
                  {
                    symbol: "GOOGL",
                    company: "Alphabet Inc.",
                    price: 139.92,
                    change: 3.12,
                    changePercent: 2.28,
                  },
                  {
                    symbol: "AMZN",
                    company: "Amazon.com Inc.",
                    price: 148.5,
                    change: 2.8,
                    changePercent: 1.92,
                  },
                ].map((stock) => (
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
                    <button className="tp-btn-primary text-xs px-3 py-1">
                      View
                    </button>
                  </li>
                ))}
              </ul>
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
            <ul className="space-y-2">
              {[
                {
                  symbol: "NVDA",
                  company: "NVIDIA Corporation",
                  price: 472.35,
                  change: 12.5,
                  changePercent: 2.71,
                },
                {
                  symbol: "GOOGL",
                  company: "Alphabet Inc.",
                  price: 139.92,
                  change: 3.12,
                  changePercent: 2.28,
                },
                {
                  symbol: "AMZN",
                  company: "Amazon.com Inc.",
                  price: 148.5,
                  change: 2.8,
                  changePercent: 1.92,
                },
                {
                  symbol: "META",
                  company: "Meta Platforms Inc.",
                  price: 485.2,
                  change: 8.5,
                  changePercent: 1.78,
                },
                {
                  symbol: "TSLA",
                  company: "Tesla, Inc.",
                  price: 248.5,
                  change: 4.25,
                  changePercent: 1.74,
                },
                {
                  symbol: "AVGO",
                  company: "Broadcom Inc.",
                  price: 1250.0,
                  change: 20.0,
                  changePercent: 1.63,
                },
                {
                  symbol: "COST",
                  company: "Costco Wholesale Corp.",
                  price: 780.5,
                  change: 12.3,
                  changePercent: 1.6,
                },
                {
                  symbol: "AMD",
                  company: "Advanced Micro Devices",
                  price: 125.75,
                  change: 1.95,
                  changePercent: 1.57,
                },
                {
                  symbol: "NFLX",
                  company: "Netflix, Inc.",
                  price: 495.8,
                  change: 7.25,
                  changePercent: 1.48,
                },
                {
                  symbol: "CRM",
                  company: "Salesforce, Inc.",
                  price: 245.6,
                  change: 3.5,
                  changePercent: 1.45,
                },
                {
                  symbol: "AAPL",
                  company: "Apple Inc.",
                  price: 172.15,
                  change: 2.45,
                  changePercent: 1.44,
                },
                {
                  symbol: "ADBE",
                  company: "Adobe Inc.",
                  price: 525.4,
                  change: 7.2,
                  changePercent: 1.39,
                },
                {
                  symbol: "INTC",
                  company: "Intel Corporation",
                  price: 38.25,
                  change: 0.5,
                  changePercent: 1.32,
                },
                {
                  symbol: "CMCSA",
                  company: "Comcast Corporation",
                  price: 42.8,
                  change: 0.55,
                  changePercent: 1.3,
                },
                {
                  symbol: "TXN",
                  company: "Texas Instruments",
                  price: 165.3,
                  change: 2.1,
                  changePercent: 1.29,
                },
                {
                  symbol: "QCOM",
                  company: "QUALCOMM Inc.",
                  price: 142.5,
                  change: 1.8,
                  changePercent: 1.28,
                },
                {
                  symbol: "AMAT",
                  company: "Applied Materials",
                  price: 185.75,
                  change: 2.3,
                  changePercent: 1.25,
                },
                {
                  symbol: "ISRG",
                  company: "Intuitive Surgical",
                  price: 385.9,
                  change: 4.75,
                  changePercent: 1.25,
                },
                {
                  symbol: "MU",
                  company: "Micron Technology",
                  price: 98.5,
                  change: 1.2,
                  changePercent: 1.23,
                },
                {
                  symbol: "KLAC",
                  company: "KLA Corporation",
                  price: 595.8,
                  change: 7.15,
                  changePercent: 1.22,
                },
              ]
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
                      <button className="tp-btn-primary text-xs px-3 py-1">
                        View
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
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
