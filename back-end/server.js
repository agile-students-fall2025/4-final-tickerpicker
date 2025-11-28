import express, { json } from "express";
import cors from "cors";
import dashboardRouter from "./src/routes/dashboard.js";
import homeRouter from "./src/routes/home.js";
import authRouter from "./src/routes/auth.js";
import { toStock } from "./src/utils/MetricsFilters.js";
import {
  queryPriceData,
  getFundamentals,
  getCalendarEvents,
  getEventsFromChart,
  fetchQuotes,
} from "./src/data/DataFetcher.js";

// import env, if finally we are going to use like a yFinance key or something
// import dotenv from "dotenv";
// dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Mock data storage (in-memory for now, will be replaced with database later)
const mockAlerts = new Map(); // Map<alertId, alert>
const mockNotifications = new Map(); // Map<notificationId, notification>
const mockNotificationStocks = new Set(); // Set of stock symbols that have notifications enabled
const mockTrackedEvents = new Map(); // Map<eventId, event> - tracks events we've already notified about
const DEFAULT_DAYS_BEFORE = 60; // Default: notify 60 days before events

// ---- Mock watchlist data (in-memory for now) ----
//JUST A SAMPLE TO MAKE THE WATCHLIST PAGE NON-EMPTY
const mockWatchlists = [
  {
    id: 1,
    name: "Tech Giants",
    stocks: ["AAPL", "MSFT", "GOOGL"],
  },
  {
    id: 2,
    name: "Energy",
    stocks: ["XOM", "CVX"],
  },
];

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get("/api/price-data/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const { startDate, endDate, timeframe = "1d" } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: "startDate and endDate are required",
      });
    }

    const data = await queryPriceData(symbol, startDate, endDate, timeframe);
    res.json(data);
  } catch (error) {
    console.error("Error fetching price data:", error);
    res.status(500).json({
      error: "Failed to fetch price data",
      message: error.message,
    });
  }
});

app.get("/api/fundamentals/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await getFundamentals(symbol);
    res.json(data);
  } catch (error) {
    console.error("Error fetching fundamentals:", error);
    res.status(500).json({
      error: "Failed to fetch fundamentals",
      message: error.message,
    });
  }
});

// ------------------------------------------------------------
// Notifications & Alerts for Stock Events

//list all monitored stocks - return as array
app.get("/api/notification-stocks", async (req, res) => {
  try {
    const stocks = Array.from(mockNotificationStocks);
    res.json({ stocks });
  } catch (error) {
    console.error("Error fetching notification stocks:", error);
    res.status(500).json({
      error: "Failed to fetch notification stocks",
      message: error.message,
    });
  }
});

// Create a new notification
app.post("/api/notifications", (req, res) => {
  const id = Date.now().toString();
  const notification = {
    id,
    isRead: false,
    createdAt: new Date().toISOString(),
    ...req.body,
  };

  mockNotifications.set(id, notification);
  res.json(notification);
});



// enable/disable notifs
app.post("/api/notification-stocks", async (req, res) => {
  try {
    const { symbol, enabled } = req.body;

    if (!symbol) {
      return res.status(400).json({
        error: "symbol is required",
      });
    }

    const symbolUpper = symbol.toUpperCase();

    if (enabled === true || enabled === undefined) {
      // Enable notifications for this stock
      mockNotificationStocks.add(symbolUpper);

      // Optionally generate new calendar-based notifications for this symbol
      // (this uses your existing helper)
      await checkCalendarEventsForSymbol(symbolUpper);

      // Get all notifications for this symbol from the last 90 days
      const recentNotifications = getRecentNotificationsForSymbol(
        symbolUpper,
        90
      );

      // Log them in the backend terminal
      console.log(
        `[Notifications] Recent notifications for ${symbolUpper} (last 90 days):`,
        recentNotifications
      );

      return res.json({
        success: true,
        symbol: symbolUpper,
        enabled: true,
        message: `Notifications enabled for ${symbolUpper} (all event types)`,
        notifications: recentNotifications, // <-- send to frontend too
      });
    } else if (enabled === false) {
      // Disable notifications for this stock
      mockNotificationStocks.delete(symbolUpper);
      return res.json({
        success: true,
        symbol: symbolUpper,
        enabled: false,
        message: `Notifications disabled for ${symbolUpper}`,
      });
    } else {
      return res.status(400).json({
        error: "enabled must be true or false",
      });
    }
  } catch (error) {
    console.error("Error toggling notification stock:", error);
    res.status(500).json({
      error: "Failed to toggle notification stock",
      message: error.message,
    });
  }
});


//check is a stock is in notifications stock list
app.get("/api/notification-stocks/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const symbolUpper = symbol.toUpperCase();
    const isEnabled = mockNotificationStocks.has(symbolUpper);

    res.json({
      symbol: symbolUpper,
      enabled: isEnabled,
    });
  } catch (error) {
    console.error("Error checking notification stock:", error);
    res.status(500).json({
      error: "Failed to check notification stock",
      message: error.message,
    });
  }
});

//get all notifications
app.get("/api/notifications", async (req, res) => {
  try {
    const { unreadOnly, limit } = req.query;

    // Get all notifications
    let notifications = Array.from(mockNotifications.values());

    // Filter by unread if requested
    if (unreadOnly === "true") {
      notifications = notifications.filter((n) => !n.isRead);
    }

    // Sort by createdAt descending (newest first)
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Limit results if requested
    if (limit) {
      notifications = notifications.slice(0, parseInt(limit));
    }

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      error: "Failed to fetch notifications",
      message: error.message,
    });
  }
});

//counts unread notifs
app.get("/api/notifications/unread-count", async (req, res) => {
  try {
    const allNotifications = Array.from(mockNotifications.values());
    const count = allNotifications.filter((n) => !n.isRead).length;

    res.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({
      error: "Failed to fetch unread count",
      message: error.message,
    });
  }
});

//mark a notif as read
app.put("/api/notifications/:notificationId/read", async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = mockNotifications.get(notificationId);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    notification.isRead = true;
    mockNotifications.set(notificationId, notification);
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      error: "Failed to mark notification as read",
      message: error.message,
    });
  }
});

// Helper: get notifications for a symbol within the last N days
function getRecentNotificationsForSymbol(symbolUpper, daysBack) {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(now.getDate() - daysBack);

  return Array.from(mockNotifications.values()).filter((n) => {
    if (!n.symbol || !n.createdAt) return false;
    if (n.symbol.toUpperCase() !== symbolUpper) return false;

    const created = new Date(n.createdAt);
    return created >= cutoff;
  });
}


// Helper function to check calendar events and create notifications
async function checkCalendarEventsForSymbol(symbol) {
  try {
    const symbolUpper = symbol.toUpperCase();
    const today = new Date();

    // Make sure notifications are actually enabled for this symbol
    if (!mockNotificationStocks.has(symbolUpper)) {
      console.log(
        `[checkCalendarEventsForSymbol] ${symbolUpper} is NOT enabled. Skipping.`
      );
      return;
    }

    // 1) Fetch calendar events (earnings, dividend dates, etc.)
    const calendarData = await getCalendarEvents(symbolUpper);
    console.log(
      `[checkCalendarEventsForSymbol] calendarData for ${symbolUpper}:`,
      JSON.stringify(calendarData?.calendarEvents ?? null, null, 2)
    );

    // 2) Fetch chart events (dividends/splits over next 90 days)
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 90); // next 90 days

    const startDate = today.toISOString().split("T")[0];
    const endDate = futureDate.toISOString().split("T")[0];

    const chartEvents = await getEventsFromChart(symbolUpper, startDate, endDate);
    console.log(
      `[checkCalendarEventsForSymbol] chartEvents for ${symbolUpper}:`,
      JSON.stringify(chartEvents ?? null, null, 2)
    );

    // --------------------------------------------------
    // EARNINGS NOTIFICATIONS
    // --------------------------------------------------
    const earningsDatesRaw =
      calendarData?.calendarEvents?.earnings?.earningsDate;

    if (earningsDatesRaw) {
      const earningsDates = Array.isArray(earningsDatesRaw)
        ? earningsDatesRaw
        : [earningsDatesRaw];

      earningsDates.forEach((earningsDate) => {
        if (!earningsDate) return;

        let eventDate;

        // Case 1: yahoo-finance2 returns a JS Date (what your npx output shows)
        if (earningsDate instanceof Date) {
          eventDate = earningsDate;
        }
        // Case 2: if it were a Unix timestamp in seconds
        else if (typeof earningsDate === "number") {
          eventDate = new Date(earningsDate * 1000);
        } else {
          console.warn(
            "[checkCalendarEventsForSymbol] Unknown earningsDate type:",
            earningsDate
          );
          return;
        }

        const daysUntil = Math.ceil(
          (eventDate - today) / (1000 * 60 * 60 * 24)
        );

        if (daysUntil >= 0 && daysUntil <= DEFAULT_DAYS_BEFORE) {
          const eventId = `earnings-${symbolUpper}-${eventDate.toISOString()}`;

          if (!mockTrackedEvents.has(eventId)) {
            const notificationId = Date.now().toString();
            const notification = {
              id: notificationId,
              symbol: symbolUpper,
              eventType: "earnings",
              eventDate: eventDate.toISOString(),
              daysUntil,
              message: `${symbolUpper} earnings on ${eventDate.toLocaleDateString()} (${
                daysUntil === 0
                  ? "today"
                  : `${daysUntil} day${daysUntil > 1 ? "s" : ""} away`
              })`,
              isRead: false,
              createdAt: new Date().toISOString(),
            };

            mockNotifications.set(notificationId, notification);
            mockTrackedEvents.set(eventId, {
              eventId,
              notifiedAt: new Date().toISOString(),
            });

            console.log("[NOTIF CREATED - EARNINGS]", notification);
          }
        }
      });
    }

    // --------------------------------------------------
    // DIVIDEND NOTIFICATIONS (from chart events)
    // --------------------------------------------------
    if (chartEvents?.dividends && chartEvents.dividends.length > 0) {
      chartEvents.dividends.forEach((dividend) => {
        if (!dividend?.date) return;

        let eventDate;

        // yahoo-finance2 chart() usually returns timestamp (seconds)
        if (dividend.date instanceof Date) {
          eventDate = dividend.date;
        } else if (typeof dividend.date === "number") {
          eventDate = new Date(dividend.date * 1000);
        } else {
          console.warn(
            "[checkCalendarEventsForSymbol] Unknown dividend date type:",
            dividend.date
          );
          return;
        }

        const daysUntil = Math.ceil(
          (eventDate - today) / (1000 * 60 * 60 * 24)
        );

        if (daysUntil >= 0 && daysUntil <= DEFAULT_DAYS_BEFORE) {
          const eventId = `dividend-${symbolUpper}-${eventDate.toISOString()}`;

          if (!mockTrackedEvents.has(eventId)) {
            const notificationId = Date.now().toString();
            const notification = {
              id: notificationId,
              symbol: symbolUpper,
              eventType: "dividend",
              eventDate: eventDate.toISOString(),
              daysUntil,
              amount: dividend.amount,
              message: `${symbolUpper} dividend of $${
                dividend.amount?.toFixed?.(2) ?? "N/A"
              } on ${eventDate.toLocaleDateString()} (${
                daysUntil === 0
                  ? "today"
                  : `${daysUntil} day${daysUntil > 1 ? "s" : ""} away`
              })`,
              isRead: false,
              createdAt: new Date().toISOString(),
            };

            mockNotifications.set(notificationId, notification);
            mockTrackedEvents.set(eventId, {
              eventId,
              notifiedAt: new Date().toISOString(),
            });

            console.log("[NOTIF CREATED - DIVIDEND]", notification);
          }
        }
      });
    }
  } catch (error) {
    console.error(`Error checking calendar events for ${symbol}:`, error);
  }
}

// TEMP: seed a fake notification to test /api/notifications
app.post("/api/notifications/debug-seed", (req, res) => {
  const id = Date.now().toString();
  const notification = {
    id,
    symbol: "DEBUG",
    eventType: "test",
    message: "This is a debug notification",
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  console.log("[DEBUG-SEED] Creating notification", notification);

  mockNotifications.set(id, notification);
  res.json(notification);
});



// Endpoint to manually check calendar events for a symbol
app.post("/api/calendar-events/check", async (req, res) => {
  try {
    const { symbol } = req.body;
    if (!symbol) {
      return res.status(400).json({ error: "symbol is required" });
    }

    await checkCalendarEventsForSymbol(symbol);
    res.json({
      success: true,
      message: `Calendar events checked for ${symbol}`,
    });
  } catch (error) {
    console.error("Error checking calendar events:", error);
    res.status(500).json({
      error: "Failed to check calendar events",
      message: error.message,
    });
  }
});

// ------------------------------------------------------------
// Watchlist API (used by WatchlistPage when USE_MOCK=false)

// Create a new watchlist
app.post("/api/watchlists", (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "Watchlist name cannot be empty.",
      });
    }

    const trimmedName = name.trim();

    // Prevent duplicate names (case-insensitive)
    const exists = mockWatchlists.some(
      (wl) => wl.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) {
      return res.status(400).json({
        error: "A watchlist with this name already exists.",
      });
    }

    const newId =
      mockWatchlists.length > 0
        ? Math.max(...mockWatchlists.map((wl) => wl.id)) + 1
        : 1;

    const newWatchlist = {
      id: newId,
      name: trimmedName,
      stocks: [],
    };

    mockWatchlists.push(newWatchlist);

    return res.status(201).json(newWatchlist);
  } catch (error) {
    console.error("Error creating watchlist:", error);
    res.status(500).json({
      error: "Failed to create watchlist",
      message: error.message,
    });
  }
});

// Remove a stock from a watchlist
app.delete("/api/watchlists/:watchlistId/stocks/:symbol", (req, res) => {
  try {
    const watchlistId = parseInt(req.params.watchlistId, 10);
    const symbolParam = req.params.symbol;

    if (!symbolParam) {
      return res.status(400).json({ error: "symbol is required" });
    }

    const symbolUpper = symbolParam.toUpperCase();

    const watchlist = mockWatchlists.find((wl) => wl.id === watchlistId);
    if (!watchlist) {
      return res.status(404).json({ error: "Watchlist not found" });
    }

    // If the symbol is not in this watchlist, just return current watchlist
    if (!watchlist.stocks.includes(symbolUpper)) {
      return res.json({ watchlist });
    }

    // Remove symbol
    watchlist.stocks = watchlist.stocks.filter(
      (s) => s.toUpperCase() !== symbolUpper
    );

    return res.json({ watchlist });
  } catch (error) {
    console.error("Error removing stock from watchlist:", error);
    res.status(500).json({
      error: "Failed to remove stock from watchlist",
      message: error.message,
    });
  }
});

// GET /api/watchlists/initial
// Returns:
//   - watchlists: [{ id, name, stocks: [symbols...] }]
//   - priceDataMap: { [symbol]: { price, change, changePercent } }
app.get("/api/watchlists/initial", async (req, res) => {
  try {
    // 1. Use our mock watchlists for now (later, replace with DB)
    const watchlists = mockWatchlists;

    // 2. Collect all unique symbols across all watchlists
    const allSymbols = Array.from(
      new Set(watchlists.flatMap((wl) => wl.stocks))
    );

    if (allSymbols.length === 0) {
      return res.json({ watchlists: [], priceDataMap: {} });
    }

    // 3. Fetch live quotes from Yahoo Finance
    const quotes = await fetchQuotes(allSymbols);

    // 4. Build priceDataMap in the shape the front end expects
    const priceDataMap = {};

    for (const symbol of allSymbols) {
      const quote = quotes[symbol];

      if (!quote) {
        // If quote failed, still include the key with nulls
        priceDataMap[symbol] = {
          price: null,
          change: null,
          changePercent: null,
        };
        continue;
      }

      // yahoo-finance2 typical fields
      const price =
        quote.regularMarketPrice ??
        quote.postMarketPrice ??
        quote.preMarketPrice ??
        quote.previousClose ??
        null;

      const change =
        quote.regularMarketChange ??
        (price != null && quote.previousClose != null
          ? price - quote.previousClose
          : null);

      const changePercent =
        quote.regularMarketChangePercent ??
        (change != null && quote.previousClose
          ? (change / quote.previousClose) * 100
          : null);

      priceDataMap[symbol] = {
        price: typeof price === "number" ? price : null,
        change: typeof change === "number" ? change : null,
        changePercent: typeof changePercent === "number" ? changePercent : null,
      };
    }

    res.json({
      watchlists,
      priceDataMap,
    });
  } catch (error) {
    console.error("Error fetching watchlists:", error);
    res.status(500).json({
      error: "Failed to fetch watchlists",
      message: error.message,
    });
  }
});

// Helper to build price/change/changePercent from a yahoo-finance2 quote
function buildPriceDataFromQuote(quote) {
  if (!quote) {
    return { price: null, change: null, changePercent: null };
  }

  const price =
    quote.regularMarketPrice ??
    quote.postMarketPrice ??
    quote.preMarketPrice ??
    quote.previousClose ??
    null;

  const change =
    quote.regularMarketChange ??
    (price != null && quote.previousClose != null
      ? price - quote.previousClose
      : null);

  const changePercent =
    quote.regularMarketChangePercent ??
    (change != null && quote.previousClose
      ? (change / quote.previousClose) * 100
      : null);

  return {
    price: typeof price === "number" ? price : null,
    change: typeof change === "number" ? change : null,
    changePercent: typeof changePercent === "number" ? changePercent : null,
  };
}

app.get("/api/stocks/:symbol", async (req, res) => {
  try {
    const raw = req.params.symbol || "";
    const symbol = raw.toUpperCase().trim();

    if (!symbol) {
      return res.status(400).json({ error: "Symbol is required" });
    }

    // 用 yahoo-finance2 拿 quote + fundamentals
    const quotes = await fetchQuotes([symbol]);
    const quote = quotes[symbol];

    if (!quote) {
      return res.status(404).json({
        error: `No quote data found for ${symbol}`,
      });
    }

    const fundamentals = await getFundamentals(symbol);
    const stock = toStock(symbol, quote, fundamentals);

    res.json(stock);
  } catch (error) {
    console.error("Error fetching single stock:", error);
    res.status(500).json({
      error: "Failed to fetch stock",
      message: error.message,
    });
  }
});

// Add a stock to a watchlist and return updated watchlist + price data
app.post("/api/watchlists/:watchlistId/stocks", async (req, res) => {
  try {
    const watchlistId = parseInt(req.params.watchlistId, 10);
    const { symbol } = req.body;

    if (!symbol) {
      return res.status(400).json({ error: "symbol is required" });
    }

    const symbolUpper = symbol.trim().toUpperCase();
    if (!symbolUpper) {
      return res.status(400).json({ error: "symbol cannot be empty" });
    }

    const watchlist = mockWatchlists.find((wl) => wl.id === watchlistId);
    if (!watchlist) {
      return res.status(404).json({ error: "Watchlist not found" });
    }

    // If it is already in the list, just return current data
    if (!watchlist.stocks.includes(symbolUpper)) {
      watchlist.stocks.push(symbolUpper);
    }

    // Fetch quote for this symbol
    // Fetch quote for this symbol
    const quotes = await fetchQuotes([symbolUpper]);
    const quote = quotes[symbolUpper];

    // If yahoo-finance2 could not return a quote, treat it as invalid
    if (!quote) {
      // Remove it again if we optimistically pushed it
      watchlist.stocks = watchlist.stocks.filter(
        (s) => s.toUpperCase() !== symbolUpper
      );

      return res.status(400).json({
        error: `Symbol "${symbolUpper}" is invalid or data is not available.`,
      });
    }

    const priceData = buildPriceDataFromQuote(quote);

    return res.json({
      watchlist,
      priceDataMap: {
        [symbolUpper]: priceData,
      },
    });
  } catch (error) {
    console.error("Error adding stock to watchlist:", error);
    res.status(500).json({
      error: "Failed to add stock to watchlist",
      message: error.message,
    });
  }
});

/**?
 * UNCOMMENT THE CODE BELOW AFTER dashboardRouter is created.
 *
 * SERVER WASN'T RUNNING WITH IT
 */

// Auth routes (login / register / update email / update password)
app.use("/api/auth", authRouter);

// Dashboard routes (TickerPicker)
app.use("/api/dashboard", dashboardRouter);

// Home routes (HomePage)
app.use("/api/home", homeRouter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend API is running" });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

export default app;
