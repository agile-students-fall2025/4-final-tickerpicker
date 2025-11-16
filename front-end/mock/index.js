// mock/index.js
import { STOCKS_BY_TICKER } from "./stocks.js";

export function setupMocks() {
  const originalFetch = window.fetch;

  window.__MOCKS_ON__ = true;
  window.__MOCK_HITS__ = 0;

  window.fetch = async (url, options) => {
    const href = typeof url === "string" ? url : url?.url ?? "";

    // 匹配 /api/stocks/XXX 这种路径
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
        //如果mock里没有这个ticker 返回404 避免404让json()崩掉
        return new Response(
          JSON.stringify({ error: `Unknown ticker: ${ticker}` }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // 不是 /api/stocks/* 的请求，照常走原始 fetch
    return originalFetch(url, options);
  };

  console.log("Mock API enabled via USE_MOCK (multi-ticker)");
}
