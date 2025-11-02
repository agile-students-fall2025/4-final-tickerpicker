// src/pages/StockPage.jsx
import React, { useEffect, useState } from "react";
import Screener from "../components/Screener.jsx";

export default function StockPage() {
  const [stock, setStock] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/stocks/AAPL");
        const data = await res.json();
        setStock(Array.isArray(data) ? data[0] : data);
      } catch (e) {
        console.error("Stock fetch failed:", e);
      }
    })();
  }, []);

  const handleAddToWatchlist = (ticker) => {
    console.log("Add to watchlist:", ticker);
  };

  return (
    <div className="px-6 py-6">
      {stock ? (
        <Screener stocks={[stock]} onAddToWatchlist={handleAddToWatchlist} />
      ) : (
        <div>Loading…</div>
      )}
    </div>
  );
}
