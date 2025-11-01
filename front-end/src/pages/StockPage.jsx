// pages/StockPage.jsx
import React from "react";
import Screener from "../components/Screener.jsx";

export default function StockPage() {
  // Hardcoded AAPL metrics
  const stock = {
    ticker: "AAPL",
    company: "Apple Inc.",
    price: 172.15,
    market_cap: 2800000000000, // $2.80T
    pe_ratio: 28.5,
    beta: 1.20,
    debt_to_equity: 1.73,
    "52_week_range": { low: 129.04, high: 182.94 },
  };

  const handleAddToWatchlist = (ticker) => {
    console.log("Add to watchlist:", ticker);
    // hook this to your watchlist logic when ready
  };

  return (
    <div className="px-6 py-6">
      <Screener stocks={[stock]} onAddToWatchlist={handleAddToWatchlist} />
    </div>
  );
}

