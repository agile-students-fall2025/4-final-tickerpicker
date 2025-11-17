import React from "react";
/**
 * @param {*} Props List of stocks to display, and function that adds a stock to the watchlist.
 * Formats stock data and renders all the stocks that match the filter parameters.
 */
export default function Screener({ stocks, onAddToWatchlist }) {
  const tril = Math.pow(10, 12);
  const bil = Math.pow(10, 9);
  const mil = Math.pow(10, 6);
  // Format market cap into human-readable string
  const formatMarketCap = (cap) => {
    if (cap >= tril) {
      return `$${(cap / tril).toFixed(2)}T`;
    } else if (cap >= bil) {
      return `$${(cap / bil).toFixed(2)}B`;
    } else if (cap >= mil) {
      return `$${(cap / mil).toFixed(2)}M`;
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
  // Render stock cards
  return (
    <div className="tp-card p-6">
      <div className="max-h-[70vh] overflow-y-auto space-y-4">
        {stocks.map((stock) => (
          <div
            key={stock.ticker}
            className="tp-card p-6 flex items-start gap-6 hover:bg-tp-card/80 transition-colors"
          >
            {/* Left side - Symbol and Company */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h3 className="text-xl font-semibold text-black">
                  {stock.ticker}
                </h3>
                <span className="text-sm text-tp-text-dim break-words">
                  {stock.company}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {/* Price */}
                <div>
                  <span className="text-xs text-tp-text-dim">Price:</span>
                  <span className="ml-2 text-sm font-medium text-black">
                    ${stock.price?.toFixed(2) || "N/A"}
                  </span>
                </div>
                {/* Market Cap */}
                <div>
                  <span className="text-xs text-tp-text-dim">Market Cap:</span>
                  <span className="ml-2 text-sm font-medium text-black">
                    {stock.marketCap ? formatMarketCap(stock.marketCap) : "N/A"}
                  </span>
                </div>
                {/* P/E Ratio */}
                <div>
                  <span className="text-xs text-tp-text-dim">P/E Ratio:</span>
                  <span className="ml-2 text-sm font-medium text-black">
                    {stock.peRatio != null ? stock.peRatio.toFixed(2) : "N/A"}
                  </span>
                </div>
                {/* Dividend Yield */}
                <div>
                  <span className="text-xs text-tp-text-dim">
                    Dividend Yield:
                  </span>
                  <span className="ml-2 text-sm font-medium text-black">
                    {stock.dividendYield != null
                      ? `${(stock.dividendYield * 100).toFixed(2)}%`
                      : "N/A"}
                  </span>
                </div>

                {stock.fiftyTwoWeekRange && (
                  <>
                    <div>
                      <span className="text-xs text-tp-text-dim">52W Low:</span>
                      <span className="ml-2 text-sm font-medium text-green-600">
                        $
                        {stock.fiftyTwoWeekRange.low != null
                          ? stock.fiftyTwoWeekRange.low.toFixed(2)
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-tp-text-dim">
                        52W High:
                      </span>
                      <span className="ml-2 text-sm font-medium text-red-600">
                        $
                        {stock.fiftyTwoWeekRange.high != null
                          ? stock.fiftyTwoWeekRange.high.toFixed(2)
                          : "N/A"}
                      </span>
                    </div>
                  </>
                )}
                {/* Debt-to-Equity */}
                {stock.debtToEquity != null && (
                  <div>
                    <span className="text-xs text-tp-text-dim">
                      Debt-to-Equity:
                    </span>
                    <span className="ml-2 text-sm font-medium text-black">
                      {stock.debtToEquity.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Add button */}
            <div className="flex flex-col items-end gap-4">
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
