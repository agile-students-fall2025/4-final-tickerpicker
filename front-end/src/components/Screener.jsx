import React from "react";

export default function Screener({ stocks, onAddToWatchlist }) {
  const formatMarketCap = (cap) => {
    if (cap >= 1000000000000) {
      return `$${(cap / 1000000000000).toFixed(2)}T`;
    } else if (cap >= 1000000000) {
      return `$${(cap / 1000000000).toFixed(2)}B`;
    } else if (cap >= 1000000) {
      return `$${(cap / 1000000).toFixed(2)}M`;
    }
    return `$${cap.toFixed(2)}`;
  };

  if (stocks.length === 0) {
    return (
      <div className="tp-card p-8 min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-black mb-2">
            No stocks found
          </p>
          <p className="text-sm text-tp-text-dim">
            Try adjusting your filters to see more results
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="tp-card p-6">
      <div className="max-h-[70vh] overflow-y-auto space-y-4">
        {stocks.map((stock, index) => (
          <div
            key={stock.ticker || stock.date || `stock-${index}`}
            className="tp-card p-6 flex items-start gap-6 hover:bg-tp-card/80 transition-colors"
          >
            {/* Left side - Symbol and Company */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-black">
                  {stock.ticker}
                </h3>
                <span className="text-sm text-tp-text-dim">
                  {stock.company}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <span className="text-xs text-tp-text-dim">Price:</span>
                  <span className="ml-2 text-sm font-medium text-black">
                    ${stock.price?.toFixed(2) || "N/A"}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-tp-text-dim">Market Cap:</span>
                  <span className="ml-2 text-sm font-medium text-black">
                    {formatMarketCap(stock.market_cap || 0)}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-tp-text-dim">P/E Ratio:</span>
                  <span className="ml-2 text-sm font-medium text-black">
                    {stock.pe_ratio?.toFixed(2) || "N/A"}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-tp-text-dim">Beta:</span>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      stock.beta && stock.beta > 1
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {stock.beta?.toFixed(2) || "N/A"}
                  </span>
                </div>

                {stock["52_week_range"] && (
                  <>
                    <div>
                      <span className="text-xs text-tp-text-dim">52W Low:</span>
                      <span className="ml-2 text-sm font-medium text-green-600">
                        ${stock["52_week_range"].low?.toFixed(2) || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-tp-text-dim">
                        52W High:
                      </span>
                      <span className="ml-2 text-sm font-medium text-red-600">
                        ${stock["52_week_range"].high?.toFixed(2) || "N/A"}
                      </span>
                    </div>
                  </>
                )}

                {stock.debt_to_equity !== undefined && (
                  <div>
                    <span className="text-xs text-tp-text-dim">
                      Debt-to-Equity:
                    </span>
                    <span className="ml-2 text-sm font-medium text-black">
                      {stock.debt_to_equity.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Chart placeholder and Add button */}
            <div className="flex flex-col items-end gap-4">
              <div className="w-48 h-32 tp-card bg-gray-100 flex items-center justify-center rounded-lg">
                <p className="text-xs text-tp-text-dim">Stock Chart</p>
              </div>
              <button
                onClick={() => onAddToWatchlist(stock.ticker)}
                className="tp-btn-primary text-xs px-4 py-2"
              >
                Add to Watchlist
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
