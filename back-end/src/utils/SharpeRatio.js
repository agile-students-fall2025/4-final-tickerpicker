/**
 * Calculates the Sharpe Ratio for a given set of price data
 *
 * Sharpe Ratio = (Average Daily Return - Risk-Free Rate) / Standard Deviation of Returns
 *
 * For simplicity, we'll use 0 as the risk-free rate (or you can use a small value like 0.0001 for daily rate)
 *
 * @param {Array} priceData - Array of price objects with 'close' property (or 'date' and 'close')
 * @param {number} riskFreeRate - Daily risk-free rate (default: 0, can be set to annual rate / 252)
 * @returns {number|null} Sharpe ratio, or null if insufficient data
 */
export function calculateSharpeRatio(priceData, riskFreeRate = 0) {
  if (!priceData || priceData.length < 2) {
    return null;
  }

  // Extract closing prices and sort by date if needed
  const prices = priceData
    .map((quote) => {
      // Handle different data formats
      const close = quote.close ?? quote.adjClose ?? null;
      // Date can be a timestamp (number) or Date object
      let date;
      if (quote.date) {
        date =
          typeof quote.date === "number"
            ? new Date(quote.date * 1000)
            : new Date(quote.date);
      } else {
        date = new Date(); // Fallback to current date if no date provided
      }
      return { date, close };
    })
    .filter(
      (q) => q.close != null && !isNaN(q.close) && !isNaN(q.date.getTime())
    )
    .sort((a, b) => a.date - b.date);

  if (prices.length < 2) {
    return null;
  }

  // Calculate daily returns
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    const prevClose = prices[i - 1].close;
    const currClose = prices[i].close;

    if (prevClose > 0) {
      const dailyReturn = (currClose - prevClose) / prevClose;
      returns.push(dailyReturn);
    }
  }

  if (returns.length === 0) {
    return null;
  }

  // Calculate average return
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

  // Calculate standard deviation
  const variance =
    returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) /
    returns.length;
  const stdDev = Math.sqrt(variance);

  // Avoid division by zero
  if (stdDev === 0) {
    return null;
  }

  // Calculate Sharpe Ratio
  // Annualize by multiplying by sqrt(252) for daily data
  const excessReturn = avgReturn - riskFreeRate;
  const sharpeRatio = (excessReturn / stdDev) * Math.sqrt(252);

  return sharpeRatio;
}
