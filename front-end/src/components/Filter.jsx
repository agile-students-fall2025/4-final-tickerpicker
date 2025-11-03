import React from "react";

const metrics = [
  {
    key: "sharePrice",
    label: "Share Price",
    description: "See stocks at the price you want",
    min: 0,
    max: 500,
    step: 1,
  },
  {
    key: "marketCap",
    label: "Market Cap",
    description: "Choose businesses by their size",
    min: 0,
    max: 5000000000000,
    step: 1000000000,
    formatValue: (val) => `$${(val / 1000000000).toFixed(1)}B`,
  },
  {
    key: "peRatio",
    label: "P/E",
    description: "Find the best earners for you",
    min: 0,
    max: 100,
    step: 0.1,
  },
  {
    key: "debtToEquity",
    label: "Debt-to-Equity",
    description: "Sort businesses by their leverage",
    min: 0,
    max: 3,
    step: 0.1,
  },
  {
    key: "beta",
    label: "Beta",
    description: "Sort stocks by their volatility",
    min: 0,
    max: 3,
    step: 0.1,
  },
];

export default function Filter({
  filters,
  onFilterChange,
  onReset,
  locked,
  onToggleLock,
}) {
  return (
    <div className="tp-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-black">Ticker Filter</h3>
        <button
  onClick={onToggleLock}
  className={
    locked
      ? "tp-btn-lock-locked text-xs px-3 py-1"
      : "tp-btn-white-outlined text-xs px-3 py-1"
  }
>
  {locked ? "Unlock" : "Lock"}
</button>
      </div>

      <ul className="space-y-4">
        {metrics.map((metric) => {
          const filterValues = filters[metric.key];
          const formatValue = metric.formatValue || ((val) => val.toFixed(1));

          return (
            <li key={metric.key} className="tp-card p-4">
              <h4 className="text-sm font-semibold text-black mb-3">
                {metric.label}
              </h4>
              <div className="flex flex-col gap-3">
                {/* Min/Max Range Labels */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-tp-text-dim">
                    Min: <span className="text-black font-medium">{formatValue(filterValues.min)}</span>
                  </span>
                  <span className="text-tp-text-dim">
                    Max: <span className="text-black font-medium">{formatValue(filterValues.max)}</span>
                  </span>
                </div>

                {/* Min Slider */}
                <div className="mb-3">
                  <label className="tp-label text-xs mb-1" htmlFor={`${metric.key}-min`}>
                    Min
                  </label>
                  <input
                    id={`${metric.key}-min`}
                    type="range"
                    min={metric.min}
                    max={filterValues.max}
                    step={metric.step}
                    value={Math.min(filterValues.min, filterValues.max)}
                    onChange={(e) =>
                      onFilterChange(metric.key, "min", e.target.value)
                    }
                    disabled={locked}
                    className="w-full h-2 bg-tp-border rounded-lg appearance-none cursor-pointer accent-tp-accent"
                  />
                </div>

                {/* Max Slider */}
                <div>
                  <label className="tp-label text-xs mb-1" htmlFor={`${metric.key}-max`}>
                    Max
                  </label>
                  <input
                    id={`${metric.key}-max`}
                    type="range"
                    min={filterValues.min}
                    max={metric.max}
                    step={metric.step}
                    value={Math.max(filterValues.max, filterValues.min)}
                    onChange={(e) =>
                      onFilterChange(metric.key, "max", e.target.value)
                    }
                    disabled={locked}
                    className="w-full h-2 bg-tp-border rounded-lg appearance-none cursor-pointer accent-tp-accent"
                  />
                </div>

                {/* Description */}
                <p className="text-xs text-tp-text-dim">{metric.description}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 pt-6 border-t border-tp-border">
        <button
          onClick={onReset}
          className="tp-btn-primary w-full"
          disabled={locked}
        >
          Apply Filter
        </button>
      </div>
    </div>
  );
}

