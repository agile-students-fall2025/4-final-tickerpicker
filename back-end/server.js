import express, { json } from "express";
import cors from "cors";
import dashboardRouter from "./src/routes/dashboard.js";
import homeRouter from "./src/routes/home.js";
import Notification from "./src/models/Notifications.js";
import authRouter from "./src/routes/auth.js";
import { connectToDatabase, closeDatabaseConnection } from "./src/db/connection.js";

import { toStock } from "./src/utils/MetricsFilters.js";
import {
  queryPriceData,
  getFundamentals,
  getCalendarEvents,
  getEventsFromChart,
  fetchQuotes,
} from "./src/data/DataFetcher.js";

import { User } from "./src/data/users.js";
import { requireAuth } from "./src/middleware/AuthRequirement.js";

// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Mock data storage (in-memory for now, will be replaced with database later)
//const mockNotifications = new Map(); // Map<notificationId, notification>
//const mockNotificationStocks = new Set(); // Set of stock symbols that have notifications enabled
const DEFAULT_DAYS_BEFORE = 60; // Default: notify 60 days before events

const IS_TEST = process.env.NODE_ENV === "test";

const testUser = {
  id: "test-user",
  email: "test@example.com",
  username: "testuser",
  watchlists: [], //{ id, name, tickers: [] }
};

const mockNotifications = new Map(); //Map<id, notification>
let mockNotificationCounter = 1;

// Minimal in-memory notification helpers for test runs (avoid Mongo dependency/timeouts)
function createTestNotification(payload) {
  const id = String(mockNotificationCounter++);
  const now = new Date();

  const notification = {
    id,
    userId: payload.userId || null,
    symbol: payload.symbol ? payload.symbol.toUpperCase() : undefined,
    eventType: payload.eventType || "test",
    eventDate: payload.eventDate ? new Date(payload.eventDate) : undefined,
    daysUntil: payload.daysUntil,
    amount: payload.amount,
    message: payload.message,
    isRead: payload.isRead ?? false,
    createdAt: now,
    updatedAt: now,
  };

  mockNotifications.set(id, notification);
  return notification;
}

function listTestNotifications({ unreadOnly, limit }) {
  let results = Array.from(mockNotifications.values());
  if (unreadOnly) {
    results = results.filter((n) => !n.isRead);
  }
  if (limit) {
    results = results.slice(0, limit);
  }
  return results;
}

function getTestUnreadCount() {
  return Array.from(mockNotifications.values()).filter((n) => !n.isRead).length;
}

function markTestNotificationRead(id) {
  const notification = mockNotifications.get(id);
  if (!notification) return null;

  const updated = { ...notification, isRead: true, updatedAt: new Date() };
  mockNotifications.set(id, updated);
  return updated;
}

async function findUserById(id) {
  if (IS_TEST) {
    return id === testUser.id ? testUser : null;
  }
  return await User.findOne({ id });
}

async function saveUser(user) {
  if (IS_TEST) {
    return user;
  }
  return await user.save();
}

// Middleware
app.use(cors());
app.use(express.json());


//getting userId
function getUserId(req) {
  // Adjust this to match whatever your auth actually puts on req
  if (req.user?.id) return req.user.id;           // e.g. { id: "abc123", username: "email" }
  if (req.user?.username) return req.user.username; // sometimes only username is available
  if (req.session?.userId) return req.session.userId;

  // TEMP fallback so it doesn't just explode silently
  return null;
}

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
    const stocks = await Notification.distinct("symbol");
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
app.post("/api/notifications", async (req, res) => {
  try {
    const { userId, symbol, eventType, eventDate, daysUntil, amount, message } = req.body;

    if (IS_TEST) {
      const notification = createTestNotification({
        userId,
        symbol,
        eventType,
        eventDate,
        daysUntil,
        amount,
        message,
      });
      return res.status(200).json(notification);
    }

    const newNotification = new Notification({
      userId,
      symbol,
      eventType,
      eventDate,
      daysUntil,
      amount,
      message,
    });

    const savedNotification = await newNotification.save();
    res.status(201).json(savedNotification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      error: "Failed to create notification",
      message: error.message,
    });
  }
});

// enable/disable notifs
app.post("/api/notification-stocks", async (req, res) => {
  try {
    const { symbol, enabled } = req.body;

    if (!symbol) {
      return res.status(400).json({
        error: "Symbol is required",
      });
    }

    const symbolUpper = symbol.toUpperCase();

    if (enabled === true || enabled === undefined) {
      // Enable notifications for this stock
      await checkCalendarEventsForSymbol(symbolUpper);

      res.json({
        success: true,
        symbol: symbolUpper,
        enabled: true,
        message: `Notifications enabled for ${symbolUpper} (all event types)`,
      });
    } else if (enabled === false) {
      // Disable notifications for this stock
      await Notification.deleteMany({ symbol: symbolUpper });
      res.json({
        success: true,
        symbol: symbolUpper,
        enabled: false,
        message: `Notifications disabled for ${symbolUpper}`,
      });
    } else {
      return res.status(400).json({
        error: "Enabled must be true or false",
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
    const exists = await Notification.exists({ symbol: symbolUpper });
    res.json({
      symbol: symbolUpper,
      enabled: !!exists,
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

    if (IS_TEST) {
      const notifications = listTestNotifications({
        unreadOnly: unreadOnly === "true",
        limit: limit ? parseInt(limit) : undefined,
      });
      return res.json(notifications);
    }

    // Query notifications from the database
    let query = {};
    if (unreadOnly === "true") {
      query.isRead = false;
    }

    let notifications = await Notification.find(query)
      .sort({ createdAt: -1 }) // Sort by newest 
      .limit(limit ? parseInt(limit) : 0);

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      error: "Failed to fetch notifications",
      message: error.message,
    });
  }
});

// Counts unread notifications
app.get("/api/notifications/unread-count", async (req, res) => {
  try {
    if (IS_TEST) {
      return res.json({ count: getTestUnreadCount() });
    }
    // Fetch unread notifications count from the database
    const count = await Notification.countDocuments({ isRead: false });

    res.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({
      error: "Failed to fetch unread count",
      message: error.message,
    });
  }
});

// Mark a notification as read
app.put("/api/notifications/:notificationId/read", async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (IS_TEST) {
      const notification = markTestNotificationRead(notificationId);
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      return res.json({ success: true, notification });
    }

    // Find the notification by ID and update its isRead status
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true } // Return the updated document
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ success: true, notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      error: "Failed to mark notification as read",
      message: error.message,
    });
  }
});

// Fetch notifications for a specific symbol
app.get("/api/notifications/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;

    const notifications = await Notification.find({ symbol: symbol.toUpperCase() })
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications for symbol:", error);
    res.status(500).json({
      error: "Failed to fetch notifications",
      message: error.message,
    });
  }
});


// Helper function to check calendar events and create notifications
async function checkCalendarEventsForSymbol(symbol) {
  try {
    const symbolUpper = symbol.toUpperCase();
    const today = new Date();

    // Fetch calendar events (earnings, dividend dates, etc.)
    const calendarData = await getCalendarEvents(symbolUpper);

    // Fetch chart events (dividends/splits over next 90 days)
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 90); // next 90 days

    const startDate = today.toISOString().split("T")[0];
    const endDate = futureDate.toISOString().split("T")[0];

    const chartEvents = await getEventsFromChart(symbolUpper, startDate, endDate);

    // Handle earnings notifications
    const earningsDatesRaw = calendarData?.calendarEvents?.earnings?.earningsDate;
    if (earningsDatesRaw) {
      const earningsDates = Array.isArray(earningsDatesRaw)
        ? earningsDatesRaw
        : [earningsDatesRaw];

      for (const earningsDate of earningsDates) {
        const eventDate = new Date(earningsDate);
        const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntil >= 0 && daysUntil <= DEFAULT_DAYS_BEFORE) {
          const notification = new Notification({
            symbol: symbolUpper,
            eventType: "earnings",
            eventDate,
            daysUntil,
            message: `${symbolUpper} earnings on ${eventDate.toLocaleDateString()} (${
              daysUntil === 0 ? "today" : `${daysUntil} day${daysUntil > 1 ? "s" : ""} away`
            })`,
            isRead: false,
          });

          await notification.save();
          console.log("[NOTIF CREATED - EARNINGS]", notification);
        }
      }
    }

    // Handle dividend notifications
    if (chartEvents?.dividends && chartEvents.dividends.length > 0) {
      for (const dividend of chartEvents.dividends) {
        const eventDate = new Date(dividend.date * 1000);
        const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntil >= 0 && daysUntil <= DEFAULT_DAYS_BEFORE) {
          const notification = new Notification({
            symbol: symbolUpper,
            eventType: "dividend",
            eventDate,
            daysUntil,
            amount: dividend.amount,
            message: `${symbolUpper} dividend of $${
              dividend.amount?.toFixed?.(2) ?? "N/A"
            } on ${eventDate.toLocaleDateString()} (${
              daysUntil === 0 ? "today" : `${daysUntil} day${daysUntil > 1 ? "s" : ""} away`
            })`,
            isRead: false,
          });

          await notification.save();
          console.log("[NOTIF CREATED - DIVIDEND]", notification);
        }
      }
    }
  } catch (error) {
    console.error(`Error checking calendar events for ${symbol}:`, error);
  }
}



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
app.post("/api/watchlists", requireAuth, async (req, res) => {
  const userId = req.user?.sub;
  const name = (req.body?.name || "").trim();
  if (!name) return res.status(400).json({ error: "Watchlist name cannot be empty." });

  const user = await User.findOne({ id: userId });
  if (!user) return res.status(404).json({ error: "User not found" });

  const exists = (user.watchlists || []).some(
    (wl) => wl.name.toLowerCase() === name.toLowerCase()
  );
  if (exists) return res.status(400).json({ error: "A watchlist with this name already exists." });

  const newId = (user.watchlists || []).reduce((max, wl) => Math.max(max, wl.id || 0), 0) + 1;
  user.watchlists.push({ id: newId, name, tickers: [] });
  await user.save();

  res.status(201).json({ id: newId, name, stocks: [] });
});

// Remove a stock from a watchlist
app.delete("/api/watchlists/:watchlistId/stocks/:symbol", requireAuth, async (req, res) => {
  const user = await User.findOne({ id: req.user?.sub });
  const wlId = Number(req.params.watchlistId);
  const symbolUpper = (req.params.symbol || "").toUpperCase();
  const wl = user?.watchlists?.find((w) => w.id === wlId);
  if (!wl) return res.status(404).json({ error: "Watchlist not found" });

  wl.tickers = wl.tickers.filter((t) => t.toUpperCase() !== symbolUpper);
  await user.save();
  res.json({ watchlist: { id: wl.id, name: wl.name, stocks: wl.tickers } });
});

// GET /api/watchlists/initial
// Returns:
//   - watchlists: [{ id, name, stocks: [symbols...] }]
//   - priceDataMap: { [symbol]: { price, change, changePercent } }
app.get("/api/watchlists/initial", requireAuth, async (req, res) => {
  const user = await User.findOne({ id: req.user?.sub });
  if (!user) return res.json({ watchlists: [], priceDataMap: {} });

  const watchlists = (user.watchlists || []).map((wl) => ({
    id: wl.id,
    name: wl.name,
    stocks: (wl.tickers || []).map((t) => t.toUpperCase()),
  }));
  const allSymbols = [...new Set(watchlists.flatMap((wl) => wl.stocks))];
  const quotes = allSymbols.length ? await fetchQuotes(allSymbols) : {};
  const priceDataMap = Object.fromEntries(
    allSymbols.map((s) => [s, buildPriceDataFromQuote(quotes[s])])
  );
  res.json({ watchlists, priceDataMap });
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
app.post("/api/watchlists/:watchlistId/stocks", requireAuth, async (req, res) => {
  const user = await User.findOne({ id: req.user?.sub });
  const wlId = Number(req.params.watchlistId);
  const symbolUpper = (req.body?.symbol || "").trim().toUpperCase();
  if (!symbolUpper) return res.status(400).json({ error: "symbol is required" });

  const wl = user?.watchlists?.find((w) => w.id === wlId);
  if (!wl) return res.status(404).json({ error: "Watchlist not found" });

  if (!wl.tickers.includes(symbolUpper)) {
    const quotes = await fetchQuotes([symbolUpper]);
    const quote = quotes[symbolUpper];
    if (!quote) return res.status(400).json({ error: `Symbol "${symbolUpper}" is invalid or data is not available.` });
    wl.tickers.push(symbolUpper);
    await user.save();
    return res.json({ watchlist: { id: wl.id, name: wl.name, stocks: wl.tickers }, priceDataMap: { [symbolUpper]: buildPriceDataFromQuote(quote) } });
  }
  res.json({ watchlist: { id: wl.id, name: wl.name, stocks: wl.tickers }, priceDataMap: {} });
});


//DEBUG 
app.get("/api/debug/me", (req, res) => {
  console.log("DEBUG /api/debug/me");
  console.log("req.user =", req.user);
  console.log("req.session =", req.session);
  res.json({
    user: req.user || null,
    session: req.session || null,
  });
});




/**
 * UNCOMMENT THE CODE BELOW AFTER dashboardRouter is created.
 *
 * SERVER WASN'T RUNNING WITH IT
 */
// Dashboard routes (TickerPicker)
app.use("/api/dashboard", dashboardRouter);

// Home routes (HomePage)
app.use("/api/home", homeRouter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend API is running" });
});


// Auth routes (login / register / update email / update password)
app.use("/api/auth", authRouter);

// this 'server.js' calls 'connectToDatabase()' from 'connection.js'
/* c8 ignore start */
if (process.env.NODE_ENV !== "test") {
  // Connect to MongoDB before starting the server
  connectToDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Backend server running on http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Failed to start server:", error.message);
      console.error(
        "Server will continue without database connection. Some features may not work."
      );
      // Start server anyway for graceful degradation
      app.listen(PORT, () => {
        console.log(`Backend server running on http://localhost:${PORT}`);
        console.warn("Running without database connection");
      });
    });
}
/* c8 ignore stop */


export default app;
