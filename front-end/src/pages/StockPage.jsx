// src/pages/StockPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Screener from "../components/Screener.jsx";
import ChartManager from "../charts/ChartManager.js";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : ""; // Empty string = relative paths (nginx will proxy)

export default function StockPage() {
  const { ticker } = useParams();
  const { isAuthenticated, accessToken } = useAuth();
  const [stock, setStock] = useState(null);
  const [error, setError] = useState(null);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(null);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [watchlists, setWatchlists] = useState([]);

  // Chart ref
  const chartRef = useRef(null);
  const chartIdRef = useRef(null);

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

  // 1) Fetch stock data
  useEffect(() => {
    if (!ticker) return;

    (async () => {
      try {
        setError(null);
        const symbol = ticker.toUpperCase();

        const res = await fetch(`${API_BASE_URL}/api/stocks/${symbol}`);
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const data = await res.json();
        const s = Array.isArray(data) ? data[0] : data;

        setStock(s);
      } catch (e) {
        console.error("Stock fetch failed:", e);
        setError("Failed to load stock data for this ticker.");
        setStock(null);
      }
    })
    
    ();
  }, [ticker]);


  // 2) Check if notifications are enabled for this ticker
  useEffect(() => {
    if (!ticker) return;

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/notification-stocks`);
        if (res.ok) {
          const data = await res.json();
          setNotifEnabled(data.enabled);
        }
      } catch (err) {
        console.error("Failed to load notification status:", err);
      }
    })();
  }, [ticker]);

  // 3) Load watchlists for add-to-watchlist picker
  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/watchlists/initial`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) {
          console.error("Failed to load watchlists:", res.status);
          setWatchlists([]);
          return;
        }
        const data = await res.json();
        setWatchlists(data.watchlists || []);
      } catch (err) {
        console.error("Error fetching watchlists:", err);
        setWatchlists([]);
      }
    })();
  }, [isAuthenticated, accessToken]);

  // 3) Initialize chart when ticker and stock are available
  useEffect(() => {
    if (!ticker || !stock) return;

    const initializeChart = async () => {
      if (!chartRef.current) {
        console.warn("Chart ref not available yet");
        return;
      }

      try {
        setChartLoading(true);
        setChartError(null);

        const symbol = ticker.toUpperCase();
        const { startDate, endDate } = getDateRange();

        // Clear existing content
        chartRef.current.innerHTML = "";

        // Create container creator function for this chart
        const containerCreator = (chartId, chartTitle, width, height) => {
          const containerDiv = document.createElement("div");
          containerDiv.id = chartId;

          // Set explicit width/height
          containerDiv.style.width = `${width}px`;
          containerDiv.style.height = `${height}px`;
          containerDiv.style.margin = "0 auto";
          containerDiv.style.position = "relative";

          // Append to the ref's current element
          if (chartRef.current) {
            chartRef.current.appendChild(containerDiv);
          }

          return containerDiv;
        };

        // Calculate responsive chart width
        const getChartWidth = () => {
          if (typeof window !== "undefined") {
            const width = window.innerWidth;
            if (width < 640) return Math.min(width - 64, 400); // Mobile: full width minus padding
            if (width < 1024) return 600; // Tablet
            return 800; // Desktop
          }
          return 800; // Default
        };

        // Initialize chart
        await ChartManager.initializeChart(
          symbol,
          startDate,
          endDate,
          "1d",
          containerCreator,
          getChartWidth(), // responsive width
          400 // height
        );

        // Store chart ID for cleanup
        const chartId = ChartManager.generateChartId(
          symbol,
          startDate,
          endDate,
          "1d"
        );
        chartIdRef.current = chartId;

        setChartLoading(false);
      } catch (error) {
        console.error("Error initializing chart:", error);
        setChartError(error.message);
        setChartLoading(false);
      }
    };

    // Use setTimeout to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      initializeChart();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (chartIdRef.current) {
        try {
          if (ChartManager.hasChart(chartIdRef.current)) {
            ChartManager.removeChart(chartIdRef.current);
          }
        } catch (error) {
          // Ignore cleanup errors
        }
      }
      chartIdRef.current = null;
    };
  }, [ticker, stock]); // Depend on both ticker and stock

  // 4) Toggle notifications for this stock
  const handleToggleNotifications = async () => {
    if (!ticker) return;
    const symbol = ticker.toUpperCase();
    console.log("[StockPage] toggle button clicked", {
      symbol,
      notifEnabledBefore: notifEnabled,
    });
    try {
      const res = await fetch(`${API_BASE_URL}/api/notification-stocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          enabled: !notifEnabled,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotifEnabled(data.enabled);
      }
    } catch (err) {
      console.error("Failed to toggle notifications:", err);
    }
  };

  const handleAddToWatchlist = async (symbol, watchlistId) => {
    if (!isAuthenticated) {
      alert("Please sign in to save to a watchlist.");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/watchlists/${watchlistId}/stocks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ symbol }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to add to watchlist.");
        return;
      }
      const data = await res.json();
      const updated = data.watchlist;
      setWatchlists((prev) =>
        prev.map((wl) => (wl.id === updated.id ? { ...wl, ...updated } : wl))
      );
      alert(`${symbol} added to ${updated.name}`);
    } catch (err) {
      console.error("Add to watchlist failed:", err);
      alert("Failed to add to watchlist.");
    }
  };

  if (error) {
    return <div className="px-6 py-6 text-sm text-red-400">{error}</div>;
  }

  return (
    <div className="px-4 py-4 md:px-6 md:py-6 flex flex-col gap-6 md:gap-8">
      {stock ? (
        <>
          {/* Stock Details + Notification toggle */}
          <>
            {/* ---- NOTIFICATION TOGGLE BUTTON ---- */}
            {/* Notification Toggle */}
            <button
              type="button"
              onClick={handleToggleNotifications}
              className={`px-4 py-2 rounded-xl border text-sm transition ${
                notifEnabled
                  ? "bg-green-50 border-green-600 text-green-700"
                  : "bg-red-50 border-red-400 text-red-700 hover:bg-red-100"
              }`}
            >
              {notifEnabled
                ? `Price Alerts for ${ticker.toUpperCase()}: ON`
                : `Enable Price Alerts for ${ticker.toUpperCase()}: OFF`}
            </button>


            <Screener
              stocks={[stock]}
              watchlists={watchlists}
              onAddToWatchlist={handleAddToWatchlist}
            />
          </>

          {/* Price Chart */}
          <div className="tp-card p-4 md:p-6">
            <h3 className="text-lg font-semibold text-black mb-4">
              {stock.ticker} Price Chart
            </h3>
            <div className="relative">
              {chartLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                  <p className="text-xs text-tp-text-dim">Loading chart...</p>
                </div>
              )}
              {chartError && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                  <p className="text-xs text-red-400">
                    Error loading chart: {chartError}
                  </p>
                </div>
              )}
              <div
                ref={chartRef}
                className="w-full flex justify-center min-h-[400px]"
              ></div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-sm text-tp-text-dim">Loading…</div>
      )}
    </div>
  );
  
}
