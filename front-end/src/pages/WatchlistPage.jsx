import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export default function WatchlistPage() {
  const { isAuthenticated } = useAuth();

  // State management
  const [watchlists, setWatchlists] = useState([]);
  const [selectedWatchlistId, setSelectedWatchlistId] = useState(null);
  const [newStockSymbol, setNewStockSymbol] = useState("");
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [stockMessage, setStockMessage] = useState({ type: "", text: "" });
  const [watchlistMessage, setWatchlistMessage] = useState({
    type: "",
    text: "",
  });
  const [priceDataMap, setPriceDataMap] = useState({});

  // Load initial data based on VITE_USE_MOCK setting
  useEffect(() => {
    const loadInitialData = async () => {
      console.log(
        "WatchlistPage: VITE_USE_MOCK =",
        import.meta.env.VITE_USE_MOCK
      );
      console.log("WatchlistPage: USE_MOCK =", USE_MOCK);

      if (USE_MOCK) {
        // Load mock data
        const { mockWatchlists, mockPriceData } = await import(
          "../../mock/data.js"
        );
        console.log("WatchlistPage: Loaded mock watchlists:", mockWatchlists);
        setWatchlists(mockWatchlists);
        setSelectedWatchlistId(mockWatchlists[0]?.id || null);
        setPriceDataMap(mockPriceData);
      } else {
        // In production, fetch from API
        // TODO: Implement API calls when backend is ready
        // Example:
        // const response = await fetch('/api/watchlists');
        // const data = await response.json();
        // setWatchlists(data);
        console.log("WatchlistPage: USE_MOCK is false, no data loaded");
        setWatchlists([]);
        setSelectedWatchlistId(null);
        setPriceDataMap({});
      }
    };

    loadInitialData();
  }, []);

  if (!isAuthenticated) {
    console.log(
      "Make sure the user is valid and authenticated when viewing watchlist"
    );
    return null;
  }

  const selectedWatchlist = watchlists.find(
    (wl) => wl.id === selectedWatchlistId
  );

  function handleCreateWatchlist(e) {
    e.preventDefault();
    setWatchlistMessage({ type: "", text: "" });
    const trimmedName = newWatchlistName.trim();

    if (!trimmedName) {
      setWatchlistMessage({
        type: "err",
        text: "Watchlist name cannot be empty.",
      });
      return;
    }

    // Check for duplicate names
    if (
      watchlists.some(
        (wl) => wl.name.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      setWatchlistMessage({
        type: "err",
        text: "A watchlist with this name already exists.",
      });
      return;
    }

    // Create new watchlist
    const newId = Math.max(...watchlists.map((wl) => wl.id), 0) + 1;
    const newWatchlist = {
      id: newId,
      name: trimmedName,
      stocks: [],
    };

    setWatchlists([...watchlists, newWatchlist]);
    setSelectedWatchlistId(newId);
    setNewWatchlistName("");
    setWatchlistMessage({
      type: "ok",
      text: "Watchlist created successfully.",
    });
  }

  function handleSelectWatchlist(e) {
    const watchlistId = parseInt(e.target.value);
    setSelectedWatchlistId(watchlistId);
  }

  function handleAddStock(e) {
    e.preventDefault();
    setStockMessage({ type: "", text: "" });

    if (!selectedWatchlistId) {
      setStockMessage({
        type: "err",
        text: "Please select a watchlist first.",
      });
      return;
    }

    const trimmedSymbol = newStockSymbol.trim().toUpperCase();

    if (!trimmedSymbol) {
      setStockMessage({ type: "err", text: "Stock symbol cannot be empty." });
      return;
    }

    // Check if stock already exists in selected watchlist
    const selectedWatchlist = watchlists.find(
      (wl) => wl.id === selectedWatchlistId
    );
    if (selectedWatchlist.stocks.includes(trimmedSymbol)) {
      setStockMessage({
        type: "err",
        text: "Stock already exists in this watchlist.",
      });
      return;
    }

    // Add stock to selected watchlist
    setWatchlists(
      watchlists.map((wl) => {
        if (wl.id === selectedWatchlistId) {
          return { ...wl, stocks: [...wl.stocks, trimmedSymbol] };
        }
        return wl;
      })
    );

    setNewStockSymbol("");
    setStockMessage({
      type: "ok",
      text: `Stock ${trimmedSymbol} added successfully.`,
    });
  }

  function handleRemoveStock(symbol) {
    if (!selectedWatchlistId) return;

    setWatchlists(
      watchlists.map((wl) => {
        if (wl.id === selectedWatchlistId) {
          return { ...wl, stocks: wl.stocks.filter((s) => s !== symbol) };
        }
        return wl;
      })
    );

    setStockMessage({
      type: "ok",
      text: `Stock ${symbol} removed successfully.`,
    });
  }

  return (
    <section className="w-full grid grid-cols-12 gap-16">
      <div className="col-span-6 flex flex-col gap-10">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-black">My Watchlists</h2>
            <p className="text-sm text-tp-text-dim">
              Manage your stock watchlists
            </p>
          </div>
        </div>

        {/* Watchlist Selector */}
        <div className="tp-card flex flex-col gap-6 p-8">
          <h3 className="text-lg font-semibold text-black">Select Watchlist</h3>
          <div>
            <label className="tp-label pb-2" htmlFor="watchlistSelect">
              Current Watchlist:
            </label>
            <select
              id="watchlistSelect"
              value={selectedWatchlistId || ""}
              onChange={handleSelectWatchlist}
              className="tp-input"
            >
              {watchlists.map((wl) => (
                <option key={wl.id} value={wl.id}>
                  {wl.name} ({wl.stocks.length} stocks)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Create New Watchlist Card */}
        <div className="tp-card flex flex-col gap-6 p-8">
          <h3 className="text-lg font-semibold text-black">
            Create New Watchlist
          </h3>
          <form
            className="flex flex-col gap-6"
            onSubmit={handleCreateWatchlist}
          >
            <div>
              <label className="tp-label pb-2" htmlFor="newWatchlistName">
                Watchlist Name:
              </label>
              <input
                id="newWatchlistName"
                type="text"
                value={newWatchlistName}
                onChange={(e) => setNewWatchlistName(e.target.value)}
                placeholder="enter watchlist name here"
                className="tp-input"
                autoComplete="off"
              />
            </div>
            {watchlistMessage.text && (
              <p
                className={
                  watchlistMessage.type === "ok"
                    ? "text-sm text-green-400"
                    : "tp-error"
                }
              >
                {watchlistMessage.text}
              </p>
            )}
            <button type="submit" className="tp-btn-primary w-32">
              Create
            </button>
          </form>
        </div>

        {/* Add Stock Card */}
        <div className="tp-card flex flex-col gap-6 p-8">
          <h3 className="text-lg font-semibold text-black">Add Stock</h3>
          <form className="flex flex-col gap-6" onSubmit={handleAddStock}>
            <div>
              <label className="tp-label pb-2" htmlFor="newStockSymbol">
                Stock Symbol:
              </label>
              <input
                id="newStockSymbol"
                type="text"
                value={newStockSymbol}
                onChange={(e) => setNewStockSymbol(e.target.value)}
                placeholder="e.g., AAPL, MSFT"
                className="tp-input"
                autoComplete="off"
              />
            </div>
            {stockMessage.text && (
              <p
                className={
                  stockMessage.type === "ok"
                    ? "text-sm text-green-400"
                    : "tp-error"
                }
              >
                {stockMessage.text}
              </p>
            )}
            <button type="submit" className="tp-btn-primary w-32">
              Add
            </button>
          </form>
        </div>
      </div>

      {/* Right Column - Stock List Display */}
      <div className="col-span-6 flex flex-col gap-8">
        <div className="tp-card p-6 min-h-[420px]">
          <h3 className="text-lg font-semibold text-black pb-4">
            {selectedWatchlist
              ? selectedWatchlist.name
              : "No Watchlist Selected"}
          </h3>
          {selectedWatchlist && selectedWatchlist.stocks.length > 0 ? (
            <div className="text-sm text-black">
              <ul className="space-y-3">
                {selectedWatchlist.stocks.map((symbol) => {
                  const priceData = priceDataMap[symbol];
                  return (
                    <li
                      key={symbol}
                      className="tp-card p-4 flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-black text-lg">
                          {symbol}
                        </span>
                        {priceData && (
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-black">
                              ${priceData.price.toFixed(2)}
                            </span>
                            <span
                              className={
                                priceData.change >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {priceData.change >= 0 ? "+" : ""}
                              {priceData.change.toFixed(2)} (
                              {priceData.changePercent >= 0 ? "+" : ""}
                              {priceData.changePercent.toFixed(2)}%)
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveStock(symbol)}
                        className="tp-btn-primary text-xs px-3 py-1"
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : selectedWatchlist ? (
            <div className="text-sm text-tp-text-dim text-center py-8">
              This watchlist is empty. Add stocks using the form on the left.
            </div>
          ) : (
            <div className="text-sm text-tp-text-dim text-center py-8">
              Please select a watchlist to view stocks.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
