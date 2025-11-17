// mock/index.js
import { STOCKS_BY_TICKER } from "./stocks.js";

export function setupMocks() {
  const originalFetch = window.fetch;

  window.__MOCKS_ON__ = true;
  window.__MOCK_HITS__ = 0;

  window.fetch = async (url, options) => {
    const href = typeof url === "string" ? url : url?.url ?? "";

    // ---------------------------------------------------
    // 1) MOCKED STOCKS — KEEP EXACTLY AS BEFORE
    // ---------------------------------------------------
    const match = href.match(/\/api\/stocks\/([^/?#]+)/);

    if (match) {
      const ticker = match[1].toUpperCase();
      const stock = STOCKS_BY_TICKER[ticker];

      if (stock) {
        window.__MOCK_HITS__++;
        return new Response(JSON.stringify(stock), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } else {
        return new Response(
          JSON.stringify({ error: `Unknown ticker: ${ticker}` }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }
    //forward notifications to backend
    if (
      href.startsWith("/api/notification-stocks") ||
      href.startsWith("/api/notifications") ||
      href.startsWith("/api/calendar-events")
    ) {
      console.log("[MOCK FORWARD] → http://localhost:3001" + href);
      return originalFetch("http://localhost:3001" + href, options);
    }

    //everything else - normal fetch
    return originalFetch(url, options);
  };

  console.log("Mock API enabled via VITE_USE_MOCK (multi-ticker)");
}
