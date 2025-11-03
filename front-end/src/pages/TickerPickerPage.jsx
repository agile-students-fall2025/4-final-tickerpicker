import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import Filter from "../components/Filter.jsx";
import Screener from "../components/Screener.jsx";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export default function TickerPickerPage() {
  const { isAuthenticated } = useAuth();

  // Filter state
  const [filters, setFilters] = useState({
    sharePrice: { min: 0, max: 500 },
    marketCap: { min: 0, max: 5000000000000 },
    peRatio: { min: 0, max: 100 },
    debtToEquity: { min: 0, max: 3 },
    beta: { min: 0, max: 3 },
  });

  const [filterLocked, setFilterLocked] = useState(false);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [watchlists, setWatchlists] = useState([]);
  const [allStocks, setAllStocks] = useState([]);

  // Load initial data based on VITE_USE_MOCK setting
  useEffect(() => {
    const loadData = async () => {
      console.log(
        "TickerPickerPage: VITE_USE_MOCK =",
        import.meta.env.VITE_USE_MOCK
      );
      console.log("TickerPickerPage: USE_MOCK =", USE_MOCK);

      if (USE_MOCK) {
        // Load mock data
        const { mockScreenerStocks, mockWatchlists } = await import(
          "../../mock/data.js"
        );
        console.log("TickerPickerPage: Loaded mock data:", {
          stocks: mockScreenerStocks.length,
          watchlists: mockWatchlists,
        });
        setAllStocks(mockScreenerStocks);
        setFilteredStocks(mockScreenerStocks);
        setWatchlists(mockWatchlists);
      } else {
        // In production, fetch from API
        // TODO: Implement API calls when backend is ready
        console.log("TickerPickerPage: USE_MOCK is false, no data loaded");
        setAllStocks([]);
        setFilteredStocks([]);
        setWatchlists([]);
      }
    };

    loadData();
  }, []);

  // Filter stocks based on active filters
  useEffect(() => {
    if (allStocks.length === 0) return;

    const filtered = allStocks.filter((stock) => {
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
  }, [filters, allStocks]);

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
            <p className="text-sm text-tp-text-dim">Filter stocks by metrics</p>
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
