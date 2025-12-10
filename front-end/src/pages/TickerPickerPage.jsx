import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import Filter from "../components/Filter.jsx";
import Screener from "../components/Screener.jsx";
import SortMenu, { sortStocks } from "../components/SortMenu.jsx";

// import utils
import { mapBackendStocksToClient } from "../utils/backendMappings.js";

const USE_MOCK = false;
const API_BASE_URL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : ""; // Empty string = relative paths (nginx will proxy)

export default function TickerPickerPage() {
  const { isAuthenticated, accessToken } = useAuth();

  // Filter state
  const [filters, setFilters] = useState({
    price: { min: 0, max: 500 },
    marketCap: { min: 0, max: 5 * Math.pow(10, 12) },
    peRatio: { min: 0, max: 100 },
    debtToEquity: { min: 0, max: 3 },
    beta: { min: 0, max: 3 },
  });

  const [filterLocked, setFilterLocked] = useState(false);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [watchlists, setWatchlists] = useState([]);
  const [allStocks, setAllStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWatchlists, setIsLoadingWatchlists] = useState(false);

  async function fetchWatchlists() {
    if (!isAuthenticated) return;
    setIsLoadingWatchlists(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/watchlists/initial`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!res.ok) {
        console.error("Failed to fetch watchlists:", res.status);
        setWatchlists([]);
        return;
      }
      const data = await res.json();
      setWatchlists(data.watchlists || []);
    } catch (err) {
      console.error("Error loading watchlists:", err);
      setWatchlists([]);
    } finally {
      setIsLoadingWatchlists(false);
    }
  }

  async function fetchFilteredStocksFromApi(currentFilters) {
    setIsLoading(true);
    try {
      // Transform filters to match backend expectations
      // Backend expects 'sharePrice' instead of 'price'
      const backendFilters = {
        ...currentFilters,
        sharePrice: currentFilters.price,
      };
      // Remove 'price' key if it exists (to avoid confusion)
      delete backendFilters.price;

      const response = await fetch(`${API_BASE_URL}/api/dashboard/filter`, {
        method: "POST",
        headers: {

          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          symbolsParam: [
            "AAPL",
            "MSFT",
            "GOOGL",
            "AMZN",
            "NVDA",
            "META",
            "TSLA",
            "AMD",
            "NFLX",
            "AVGO",
          ],
          filters: backendFilters,
        }),
      });

      if (response.status === 401) {
        console.error("Unauthorized (401). Please sign in.");
        setAllStocks([]);
        setFilteredStocks([]);
        return;
      }
      
      if (!response.ok) {
        console.error(
          "Dashboard API error:",
          response.status,
          await response.text()
        );
        setAllStocks([]);
        setFilteredStocks([]);
        return;
      }
      // response should be {count, items}
      const data = await response.json();
      const normalized = mapBackendStocksToClient(data.items || []);
      // normalized should be collection of JSON stock objects
      setAllStocks(normalized);
      setFilteredStocks(normalized);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setAllStocks([]);
      setFilteredStocks([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const loadData = async () => {
      console.log("TickerPickerPage: USE_MOCK =", USE_MOCK);
      if (USE_MOCK) {
        const { mockScreenerStocks, mockWatchlists } = await import(
          "../../mock/data.js"
        );
        setAllStocks(mockScreenerStocks);
        setFilteredStocks(mockScreenerStocks);
        setWatchlists(mockWatchlists);
      } else {
        // fetch stocks from API with filters set
        if (!isAuthenticated) return;
        await fetchFilteredStocksFromApi(filters);
        await fetchWatchlists();
      }
    };
    loadData();
  }, [isAuthenticated]);

  // Filter stocks based on active filters, runs everytime 'filters' changes
  useEffect(() => {
    if (!USE_MOCK) return;
    if (allStocks.length === 0) return;

    const filtered = allStocks.filter((stock) => {
      // compare the stock against every metric value the filter is set to
      let passes = true;

      for (metric of [
        "price",
        "marketCap",
        "peRatio",
        "debtToEquity",
        "beta",
      ]) {
        // if null 0, otherwise keep original stock metric value
        const stockMetric = stock[metric] ?? 0;

        if (
          !(
            stockMetric >= filters[metric].min &&
            stockMetric <= filters[metric].max
          )
        ) {
          passes = false;
          break;
        }
      }
      return passes;
    });

    setFilteredStocks(filtered);
  }, [filters, allStocks]);

  // Sort 'filtered' stocks evertime SortMenu is changed
  const [selectedMetric, setSelectedMetric] = useState("price");
  useEffect(() => {
    // for now we will only sort by price
    
    setFilteredStocks(
      sortStocks(filteredStocks, selectedMetric) 
    )
  }, [selectedMetric])

  // Handle changes to filter only when not locked
  // When changing filters, the results gets updated automatically
  // but this is buggy right now... Ig we can just click on Apply filter button for now
  // useEffect(() => {
  //   if (USE_MOCK) return;
  //   const h = setTimeout(() => {
  //     fetchFilteredStocksFromApi(filters);
  //   }, 300);
  //   return () => clearTimeout(h);
  // }, [filters]);
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

  async function handleApplyFilters() {
    if (USE_MOCK) {
      console.log(
        "(this is just mocking) Apply Filter clicked client-side filtering"
      );
      return;
    }
    if (!isAuthenticated) {
      console.log("Cannot apply filters: user not authenticated.");
      return;
    }
    await fetchFilteredStocksFromApi(filters);
  }

  function handleResetFilters() {
    if (!filterLocked) {
      console.log("Lock not set!");
    } else {
      console.log("Lock set");
      setFilters({
        price: { min: 0, max: 500 },
        marketCap: { min: 0, max: 5 * Math.pow(10, 12) }, //in Bil
        peRatio: { min: 0, max: 100 },
        debtToEquity: { min: 0, max: 3 },
        beta: { min: 0, max: 3 },
      });
    }
  }

  async function handleAddToWatchlist(ticker, watchlistId) {
    if (USE_MOCK) {
      const updated = watchlists.map((wl) =>
        wl.id === watchlistId
          ? { ...wl, stocks: wl.stocks.includes(ticker) ? wl.stocks : [...wl.stocks, ticker] }
          : wl
      );
      setWatchlists(updated);
      alert(`${ticker} added to watchlist`);
      return;
    }

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
          body: JSON.stringify({ symbol: ticker }),
        }
      );

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        alert(error.error || "Failed to add to watchlist.");
        return;
      }

      const data = await res.json();
      const updatedWatchlist = data.watchlist;
      setWatchlists((prev) =>
        prev.map((wl) =>
          wl.id === updatedWatchlist.id ? { ...wl, ...updatedWatchlist } : wl
        )
      );
      alert(`${ticker} added to ${updatedWatchlist.name}`);
    } catch (err) {
      console.error("Add to watchlist failed:", err);
      alert("Failed to add to watchlist.");
    }
  }

  if (!isAuthenticated) {
    console.log(
      "Make sure the user is valid and authenticated when viewing ticker picker"
    );
    return null;
  }

  return (
    <section className="flex flex-col md:grid md:grid-cols-12 gap-8 md:gap-16">
      {/* Left Column - Filter */}
      <div className="md:col-span-4 flex flex-col gap-8">
        {/* Filter Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <h2 className="text-[1.5em] font-semibold text-black">
              Ticker Filter
            </h2>
            <p className="text-mm text-tp-text-dim">Filter stocks by metrics</p>
          </div>
        </div>

        <Filter
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={
            handleResetFilters
          } /* Function run when 'Apply Filter' button is pressed */
          locked={filterLocked}
          onToggleLock={() => setFilterLocked(!filterLocked)}
          onApply={handleApplyFilters}
        />
      </div>

      {/* Right Column - Screener */}
      <div className="md:col-span-8 flex flex-col gap-8">
        {/* Screener Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-black">Ticker Picker</h2>
            <p className="text-sm text-tp-text-dim">
              {filteredStocks.length} stocks found
            </p>
          </div>
          {/* Sort Menu, only sorts stocks by 'price' for now */}
          <SortMenu
            value={selectedMetric}
            onChange={(newValue) => setSelectedMetric(newValue)}
          />
        </div>

        {/* Watchlists overview */}
        <div className="tp-card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-black">Your Watchlists</h3>
            {isLoadingWatchlists && (
              <span className="text-xs text-tp-text-dim">Loading...</span>
            )}
          </div>
          {watchlists.length === 0 ? (
            <p className="text-xs text-tp-text-dim">
              No watchlists yet. Add a stock to start one.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {watchlists.map((wl) => (
                <span
                  key={wl.id}
                  className="px-3 py-1 text-xs rounded-full bg-black text-white border border-black"
                >
                  {wl.name} ({wl.stocks?.length || 0})
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          {isLoading ? (
            <div className="tp-card p-8 min-h-[600px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-semibold text-black mb-2">
                  Loading stocks...
                </p>
                <p className="text-sm text-tp-text-dim">
                  Applying filters and fetching data
                </p>
              </div>
            </div>
          ) : (
            <Screener
              stocks={filteredStocks}
              watchlists={watchlists}
              onAddToWatchlist={handleAddToWatchlist}
            />
          )}
        </div>
      </div>
    </section>
  );
}
