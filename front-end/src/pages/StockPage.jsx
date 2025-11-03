// src/pages/StockPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Screener from "../components/Screener.jsx";

export default function StockPage() {
  const { ticker } = useParams();        // 从 /stock/:ticker 读参数
  const [stock, setStock] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticker) return;

    (async () => {
      try {
        setError(null);
        const symbol = ticker.toUpperCase();

        const res = await fetch(`/api/stocks/${symbol}`);
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
    })();
  }, [ticker]);

  const handleAddToWatchlist = (t) => {
    console.log("Add to watchlist:", t);
  };

  if (error) {
    return (
      <div className="px-6 py-6 text-sm text-red-400">
        {error}
      </div>
    );
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