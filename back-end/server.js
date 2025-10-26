const express = require("express");
const cors = require("cors");
const { queryData, getFundamentals } = require("./src/data/DataFetcher.js");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get("/api/stock-data/:ticker", async (req, res) => {
  try {
    const { ticker } = req.params;
    const { startDate, endDate, timeframe = "1d" } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: "startDate and endDate are required",
      });
    }

    const data = await queryData(ticker, startDate, endDate, timeframe);
    res.json(data);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({
      error: "Failed to fetch stock data",
      message: error.message,
    });
  }
});

app.get("/api/fundamentals/:ticker", async (req, res) => {
  try {
    const { ticker } = req.params;
    const data = await getFundamentals(ticker);
    res.json(data);
  } catch (error) {
    console.error("Error fetching fundamentals:", error);
    res.status(500).json({
      error: "Failed to fetch fundamentals",
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
