// src/pages/StockPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Screener from "../components/Screener.jsx";

export default function StockPage() {
  const { ticker } = useParams(); // 从 /stock/:ticker 读参数
  const [stock, setStock] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        // Temporary: hardcode AAPL if ticker is undefined
        const symbol =
          ticker && ticker !== "undefined" ? ticker.toUpperCase() : "AAPL";
        console.log("StockPage: Fetching data for symbol:", symbol);

        // Calculate date range (last 6 months)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);

        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        const startDateStr = formatDate(startDate);
        const endDateStr = formatDate(endDate);

        const url = `http://localhost:3001/api/price-data/${symbol}?startDate=${startDateStr}&endDate=${endDateStr}&timeframe=1d`;
        console.log("StockPage: Fetching from URL:", url);

        const res = await fetch(url);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            `Request failed with status ${res.status}: ${
              errorData.message || errorData.error || "Unknown error"
            }`
          );
        }

        const data = await res.json();
        setStock(data);
      } catch (e) {
        console.error("Stock fetch failed:", e);
        setError(`Failed to load stock data: ${e.message}`);
        setStock(null);
      }
    })();
  }, [ticker]);

  const handleAddToWatchlist = (t) => {
    console.log("Add to watchlist:", t);
  };

  if (error) {
    return <div className="px-6 py-6 text-sm text-red-400">{error}</div>;
  }

  return (
    <div className="px-6 py-6">
      {stock ? (
        <Screener stocks={[stock]} onAddToWatchlist={handleAddToWatchlist} />
      ) : (
        <div className="text-sm text-tp-text-dim">Loading…</div>
      )}
    </div>
  );
}
