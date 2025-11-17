// src/pages/StockPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Screener from "../components/Screener.jsx";

export default function StockPage() {
  const { ticker } = useParams();        // 从 /stock/:ticker 读参数
  const [stock, setStock] = useState(null);
  const [error, setError] = useState(null);
  const [notifEnabled, setNotifEnabled] = useState(false);


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
    })
    
    ();
  }, [ticker]);

  //after fetching data - check if notifications are enabled
  useEffect(() => {
    if (!ticker) return;

    (async () => {
      const res = await fetch("http://localhost:3001/api/notification-stocks")
      if (res.ok) {
        const data = await res.json();
        setNotifEnabled(data.enabled);
      }
    })();
  }, [ticker]);

  //toggles notifications for this stock
const handleToggleNotifications = async () => {
  const symbol = ticker.toUpperCase();

  const res = await fetch("/api/notification-stocks", {
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
};



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
        <>
          {/* --- NOTIFICATION TOGGLE BUTTON --- */}
          <button
            onClick={handleToggleNotifications}
            className="px-3 py-1 mb-4 rounded-md border border-tp-border text-xs hover:bg-tp-surface-subtle"
          >
            {notifEnabled
              ? `Disable notifications for ${ticker.toUpperCase()}`
              : `Enable notifications for ${ticker.toUpperCase()}`}
          </button>
  
          <Screener stocks={[stock]} onAddToWatchlist={handleAddToWatchlist} />
        </>
      ) : (
        <div className="text-sm text-tp-text-dim">Loading…</div>
      )}
    </div>
  );
  
}