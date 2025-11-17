/*
takes an array of stocks
returns an JSON object describing each stock
*/
export function mapBackendStocksToClient(items) {
    if (!Array.isArray(items)) return [];
    return items.map((s) => ({
      ticker: s.ticker,
      company: s.company,
      price: s.price ?? null,
      marketCap: s.marketCap ?? null,
      peRatio: s.peRatio ?? null,
      debtToEquity: s.debtToEquity ?? null,
      dividendYield: s.dividendYield ?? null,
      beta: s.beta ?? null,
      fiftyTwoWeekRange: s.fiftyTwoWeekRange ?? null,
    }));
  }