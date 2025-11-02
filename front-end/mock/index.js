// mock/index.js
import { AAPL_stock } from "./stocks.js";

export function setupMocks() {
  const originalFetch = window.fetch;

  // mark that mocks are ON (we'll read this from the page)
  window.__MOCKS_ON__ = true;
  window.__MOCK_HITS__ = 0;

  window.fetch = async (url, options) => {
    const href = typeof url === "string" ? url : url?.url ?? "";

    if (href.endsWith("/api/stocks/AAPL")) {
      window.__MOCK_HITS__++;
      return new Response(JSON.stringify(AAPL_stock), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return originalFetch(url, options);
  };

  console.log("Mock API enabled via VITE_USE_MOCK");
}
