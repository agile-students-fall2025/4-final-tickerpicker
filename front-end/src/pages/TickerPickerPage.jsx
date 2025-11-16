import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import Filter from "../components/Filter.jsx";
import Screener from "../components/Screener.jsx";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export default function TickerPickerPage() {
  const { isAuthenticated } = useAuth();

  // Filter state
  const [filters, setFilters] = useState({
    price: { min: 0, max: 500 },
    marketCap: { min: 0, max: 5 * Math.pow(10,12) },
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
        // allStocks, filteredStocks  = mockSCreenerStocks
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

  // Filter stocks based on active filters, runs everytime 'filters' changes
  useEffect(() => {
    if (allStocks.length === 0) return;

    const filtered = allStocks.filter((stock) => {
      // compare the stock against every metric value the filter is set to
      let passes = true;
      
      for (metric of ['price', 'marketCap', 'peRatio', 'debtToEquity', 'beta']){
        // if null 0, otherwise keep original stock metric value
        const stockMetric = stock[metric] ?? 0;

        if (!(stockMetric >= filters[metric].min && stockMetric <= filters[metric].max)) {
            passes = false; break;
        } 
      }
      return passes;
    });

    setFilteredStocks(filtered);
  }, [filters, allStocks]);

  // Handle changes to filter only when not locked
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

  // when 'Apply Filter' is pressed
  function handleResetFilters() {
    if (!filterLocked) { 
      console.log("Lock not set!"); } 
    else {
      console.log("Lock set")
      setFilters({
      price: { min: 0, max: 500 },
      marketCap: { min: 0, max: 5 * Math.pow(10,12) }, //in Bil
      peRatio: { min: 0, max: 100 },
      debtToEquity: { min: 0, max: 3 },
      beta: { min: 0, max: 3 },
      });
    }
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
    <section className="tp-filter">
      {/* Left Column - Filter */}
      <div className="col-span-4 flex flex-col gap-8">
        {/* Filter Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <h2 className="text-[1.5em] font-semibold text-black">Ticker Filter</h2>
            <p className="text-mm text-tp-text-dim">Filter stocks by metrics</p>
          </div>
        </div>

        <Filter
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters} /* Function run when 'Apply Filter' button is pressed */
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
