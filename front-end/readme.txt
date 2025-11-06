Site Map from HOME:  
HOME
|___ TickerPicker (Screener)
|___ Watchlist 
|___ Profile

# VITE Mock System — No More Hardcoded Data

This front-end uses **Vite environment variables** to toggle between **mock data** and **real API data**, removing all hardcoded stock information.
All data currently shown is up to date - nothing hardcoded.

---

##  How It Works

When `VITE_USE_MOCK=true`, Vite loads a small **fetch interceptor** before the app renders:

- All API calls like `/api/stocks/AAPL` are served from local files in `/mock/`.
- Set `VITE_USE_MOCK=true` in the .env file
- When `VITE_USE_MOCK=false`, those same requests go to your real backend API.

Example flow:

```js
// src/pages/StockPage.jsx
fetch("/api/stocks/AAPL");

