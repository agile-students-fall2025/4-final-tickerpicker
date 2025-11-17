const express = require("express");
const cors = require("cors");
const {
  queryPriceData,
  getFundamentals,
  getCalendarEvents,
  getEventsFromChart,
} = require("./src/data/DataFetcher.js");

const app = express();
const PORT = process.env.PORT || 3001;

// Mock data storage (in-memory for now, will be replaced with database later)
const mockAlerts = new Map(); // Map<alertId, alert>
const mockNotifications = new Map(); // Map<notificationId, notification>
const mockNotificationStocks = new Set(); // Set of stock symbols that have notifications enabled
const mockTrackedEvents = new Map(); // Map<eventId, event> - tracks events we've already notified about
const DEFAULT_DAYS_BEFORE = 7; // Default: notify 7 days before events

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
      res.json({ 
        success: true, 
        symbol: symbolUpper, 
        enabled: true,
        message: `Notifications enabled for ${symbolUpper} (all event types)` 
      });
    } else if (enabled === false) {
      // Disable notifications for this stock
      mockNotificationStocks.delete(symbolUpper);
      res.json({ 
        success: true, 
        symbol: symbolUpper, 
        enabled: false,
        message: `Notifications disabled for ${symbolUpper}` 
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
      enabled: isEnabled 
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
      notifications = notifications.filter(n => !n.isRead);
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
    const count = allNotifications.filter(n => !n.isRead).length;

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

// Helper function to check calendar events and create notifications
async function checkCalendarEventsForSymbol(symbol) {
  try {
    const symbolUpper = symbol.toUpperCase();
    
    // Check if notifications are enabled for this stock
    if (!mockNotificationStocks.has(symbolUpper)) {
      return; // Notifications not enabled for this stock
    }

    // Fetch calendar events
    const calendarData = await getCalendarEvents(symbol);
    
    // Also get events from chart (dividends and splits)
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 90); // Check next 90 days
    
    const startDate = today.toISOString().split('T')[0];
    const endDate = futureDate.toISOString().split('T')[0];
    
    const chartEvents = await getEventsFromChart(symbol, startDate, endDate);

    // Check earnings
    if (calendarData.calendarEvents?.earnings?.earningsDate) {
      const earningsDates = Array.isArray(calendarData.calendarEvents.earnings.earningsDate)
        ? calendarData.calendarEvents.earnings.earningsDate
        : [calendarData.calendarEvents.earnings.earningsDate];

      earningsDates.forEach(earningsDate => {
        if (!earningsDate) return;

        const eventDate = new Date(earningsDate * 1000); // Convert from timestamp
        const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntil >= 0 && daysUntil <= DEFAULT_DAYS_BEFORE) {
          const eventId = `earnings-${symbol}-${earningsDate}`;
          
          // Check if we've already notified about this event
          if (!mockTrackedEvents.has(eventId)) {
            const notificationId = Date.now().toString();
            const notification = {
              id: notificationId,
              symbol: symbol.toUpperCase(),
              eventType: 'earnings',
              eventDate: eventDate.toISOString(),
              daysUntil: daysUntil,
              message: `${symbol} earnings on ${eventDate.toLocaleDateString()} (${daysUntil === 0 ? 'today' : `${daysUntil} day${daysUntil > 1 ? 's' : ''} away`})`,
              isRead: false,
              createdAt: new Date().toISOString(),
            };

            mockNotifications.set(notificationId, notification);
            mockTrackedEvents.set(eventId, { eventId, notifiedAt: new Date().toISOString() });
            console.log(`Calendar event notification created: ${notification.message}`);
          }
        }
      });
    }

    // Check dividends
    if (chartEvents.dividends && chartEvents.dividends.length > 0) {
      chartEvents.dividends.forEach(dividend => {
        const eventDate = new Date(dividend.date * 1000);
        const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntil >= 0 && daysUntil <= DEFAULT_DAYS_BEFORE) {
          const eventId = `dividend-${symbol}-${dividend.date}`;
          
          if (!mockTrackedEvents.has(eventId)) {
            const notificationId = Date.now().toString();
            const notification = {
              id: notificationId,
              symbol: symbol.toUpperCase(),
              eventType: 'dividends',
              eventDate: eventDate.toISOString(),
              daysUntil: daysUntil,
              amount: dividend.amount,
              message: `${symbol} dividend of $${dividend.amount?.toFixed(2) || 'N/A'} on ${eventDate.toLocaleDateString()} (${daysUntil === 0 ? 'today' : `${daysUntil} day${daysUntil > 1 ? 's' : ''} away`})`,
              isRead: false,
              createdAt: new Date().toISOString(),
            };

            mockNotifications.set(notificationId, notification);
            mockTrackedEvents.set(eventId, { eventId, notifiedAt: new Date().toISOString() });
            console.log(`Calendar event notification created: ${notification.message}`);
          }
        }
      });
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
    res.json({ success: true, message: `Calendar events checked for ${symbol}` });
  } catch (error) {
    console.error("Error checking calendar events:", error);
    res.status(500).json({
      error: "Failed to check calendar events",
      message: error.message,
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend API is running" });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
