import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import Filter from "../components/Filter.jsx";
import Screener from "../components/Screener.jsx";

export default function TickerPickerPage() {
  const { isAuthenticated } = useAuth();

  // Mock stock data - standardized field names
  const defaultStocks = [
    {
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      price: 472.35,
      market_cap: 4000000000000,
      pe_ratio: 52.19,
      debt_to_equity: 0.15,
      beta: 2.12,
      "52_week_range": { low: 86.62, high: 195.62 },
    },
    {
      ticker: "AAPL",
      company: "Apple Inc.",
      price: 172.15,
      market_cap: 2800000000000,
      pe_ratio: 28.50,
      debt_to_equity: 1.73,
      beta: 1.20,
      "52_week_range": { low: 129.04, high: 182.94 },
    },
    {
      ticker: "TSLA",
      company: "Tesla, Inc.",
      price: 248.50,
      market_cap: 1440000000000,
      pe_ratio: 253.94,
      debt_to_equity: 0.08,
      beta: 2.45,
      "52_week_range": { low: 138.25, high: 299.29 },
    },
    {
      ticker: "MSFT",
      company: "Microsoft Corporation",
      price: 378.85,
      market_cap: 2800000000000,
      pe_ratio: 32.15,
      debt_to_equity: 0.42,
      beta: 0.88,
      "52_week_range": { low: 309.45, high: 420.82 },
    },
    {
      ticker: "GOOGL",
      company: "Alphabet Inc.",
      price: 139.92,
      market_cap: 1800000000000,
      pe_ratio: 24.68,
      debt_to_equity: 0.05,
      beta: 1.05,
      "52_week_range": { low: 115.55, high: 152.14 },
    },
    {
      ticker: "AMZN",
      company: "Amazon.com Inc.",
      price: 148.50,
      market_cap: 1500000000000,
      pe_ratio: 45.23,
      debt_to_equity: 1.12,
      beta: 1.35,
      "52_week_range": { low: 118.35, high: 189.77 },
    },
    {
      ticker: "META",
      company: "Meta Platforms Inc.",
      price: 485.20,
      market_cap: 1250000000000,
      pe_ratio: 22.15,
      debt_to_equity: 0.28,
      beta: 1.25,
      "52_week_range": { low: 198.43, high: 531.49 },
    },
    {
      ticker: "JPM",
      company: "JPMorgan Chase & Co.",
      price: 185.30,
      market_cap: 550000000000,
      pe_ratio: 12.45,
      debt_to_equity: 2.15,
      beta: 1.18,
      "52_week_range": { low: 135.19, high: 205.88 },
    },
    {
      ticker: "V",
      company: "Visa Inc.",
      price: 285.75,
      market_cap: 580000000000,
      pe_ratio: 35.20,
      debt_to_equity: 0.65,
      beta: 0.95,
      "52_week_range": { low: 235.50, high: 291.82 },
    },
    {
      ticker: "JNJ",
      company: "Johnson & Johnson",
      price: 158.20,
      market_cap: 420000000000,
      pe_ratio: 28.90,
      debt_to_equity: 0.48,
      beta: 0.62,
      "52_week_range": { low: 144.50, high: 175.98 },
    },
  ];

  // Filter state
  const [filters, setFilters] = useState({
    sharePrice: { min: 0, max: 500 },
    marketCap: { min: 0, max: 5000000000000 },
    peRatio: { min: 0, max: 100 },
    debtToEquity: { min: 0, max: 3 },
    beta: { min: 0, max: 3 },
  });

  const [filterLocked, setFilterLocked] = useState(false);
  const [filteredStocks, setFilteredStocks] = useState(defaultStocks);
  const [watchlists, setWatchlists] = useState([]);

  // Load watchlists from localStorage (same pattern as WatchlistPage)
  useEffect(() => {
    const defaultWatchlists = [
      { id: 1, name: "Tech Stocks", stocks: ["AAPL", "MSFT", "GOOGL"] },
      { id: 2, name: "My Favorites", stocks: ["NVDA", "TSLA"] },
    ];
    setWatchlists(defaultWatchlists);
  }, []);

  // Filter stocks based on active filters
  useEffect(() => {
    const filtered = defaultStocks.filter((stock) => {
      const price = stock.price || 0;
      const marketCap = stock.market_cap || 0;
      const peRatio = stock.pe_ratio || 0;
      const debtToEquity = stock.debt_to_equity || 0;
      const beta = stock.beta || 0;

      return (
        price >= filters.sharePrice.min &&
        price <= filters.sharePrice.max &&
        marketCap >= filters.marketCap.min &&
        marketCap <= filters.marketCap.max &&
        peRatio >= filters.peRatio.min &&
        peRatio <= filters.peRatio.max &&
        debtToEquity >= filters.debtToEquity.min &&
        debtToEquity <= filters.debtToEquity.max &&
        beta >= filters.beta.min &&
        beta <= filters.beta.max
      );
    });

    setFilteredStocks(filtered);
  }, [filters]);

  function handleFilterChange(metric, type, value) {
    if (filterLocked) return;

    setFilters((prev) => {
      const newValue = parseFloat(value);
      const currentFilter = prev[metric];
      
      // Ensure min doesn't exceed max and max doesn't go below min
      const updatedFilter = {
        ...currentFilter,
        [type]: newValue,
      };

      // If setting min, ensure it doesn't exceed max
      if (type === "min" && updatedFilter.min > updatedFilter.max) {
        updatedFilter.min = updatedFilter.max;
      }
      
      // If setting max, ensure it doesn't go below min
      if (type === "max" && updatedFilter.max < updatedFilter.min) {
        updatedFilter.max = updatedFilter.min;
      }

      return {
        ...prev,
        [metric]: updatedFilter,
      };
    });
  }

  function handleResetFilters() {
    setFilters({
      sharePrice: { min: 0, max: 500 },
      marketCap: { min: 0, max: 5000000000000 },
      peRatio: { min: 0, max: 100 },
      debtToEquity: { min: 0, max: 3 },
      beta: { min: 0, max: 3 },
    });
  }

  function handleAddToWatchlist(ticker) {
    // Get first watchlist or create one if none exists
    const targetWatchlist = watchlists[0] || {
      id: 1,
      name: "My Watchlist",
      stocks: [],
    };

    // Check if stock already exists
    if (targetWatchlist.stocks.includes(ticker)) {
      alert(`${ticker} is already in your watchlist`);
      return;
    }

    // Add to watchlist
    const updatedWatchlist = {
      ...targetWatchlist,
      stocks: [...targetWatchlist.stocks, ticker],
    };

    if (watchlists.length === 0) {
      setWatchlists([updatedWatchlist]);
    } else {
      setWatchlists(
        watchlists.map((wl) =>
          wl.id === targetWatchlist.id ? updatedWatchlist : wl
        )
      );
    }

    alert(`${ticker} added to watchlist`);
  }

  if (!isAuthenticated) {
    console.log(
      "Make sure the user is valid and authenticated when viewing ticker picker"
    );
    return null;
  }

  return (
    <section className="w-full grid grid-cols-12 gap-16">
      {/* Left Column - Filter */}
      <div className="col-span-4 flex flex-col gap-8">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-black">Ticker Filter</h2>
            <p className="text-sm text-tp-text-dim">
              Filter stocks by metrics
            </p>
          </div>
        </div>

        <Filter
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          locked={filterLocked}
          onToggleLock={() => setFilterLocked(!filterLocked)}
        />
      </div>

      {/* Right Column - Screener */}
      <div className="col-span-8 flex flex-col gap-8">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-black">Ticker Picker</h2>
            <p className="text-sm text-tp-text-dim">
              {filteredStocks.length} stocks found
            </p>
          </div>
        </div>

        <Screener
          stocks={filteredStocks}
          onAddToWatchlist={handleAddToWatchlist}
        />
      </div>
    </section>
  );
}

