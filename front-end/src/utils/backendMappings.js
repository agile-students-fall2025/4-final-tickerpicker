export function mapBackendStocksToClient(items) {
    if (!Array.isArray(items)) return [];
    return items.map((s) => ({
      ticker: s.ticker,
      company: s.company,
      price: s.price ?? 0,
      market_cap: s.marketCap ?? 0, // CamelCase change to XX_XX format
      pe_ratio: s.peRatio ?? 0,
      debt_to_equity: s.debtToEquity ?? 0,
      beta: s.beta ?? null,
      "52_week_range": null,
    }));
  }