The front-end of your project will live in this directory by the end of Sprint 1.

All the files that support the "Ticker Picker" page (Main UI):
- TickerPicker.js:
    > this screen is linked to from the HOME page (main.js)
    > this screen loads components from the following SIX files (a .js and .css):
1. NavBar.*
2. Filter.*
3. Screener.*

The site mapp from the HOME level is as follows:  
HOME
|___ TickerPicker.js
|___ Watchlist.js 
|___ Profile.js



# Vite Mock System — No More Hardcoded Data

This front-end uses **Vite environment variables** to toggle between **mock data** and **real API data**, removing all hardcoded stock information.

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

