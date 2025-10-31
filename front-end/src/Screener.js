import "./Screener.css"
import logo from "./logo.svg"

/* C. SCREENER */
// mock-data
const stocks = [
    {
        "ticker": "NVDA",
        "company": "NVIDIA Corporation",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg",
        "price": 186.26,
        "market_cap": "4.0T",
        "pe": 52.19,
        "52_week_range_usd": {
            "low": 86.62,
            "high": 195.62
        },
        "beta": 2.12,
    },
    {
        "ticker": "AAPL",
        "company": "Apple Inc.",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/5/56/Tesla_logo.png",
        "market": "USA",
        "price": 172.15,
        "market_cap_trillion_usd": 2.8,
        "pe_ratio": 28.50,
        "forward_pe_ratio": 25.30,
        "revenue_ttm_billion_usd": 394.33,
        "net_income_ttm_billion_usd": 99.80,
        "shares_outstanding_billions": 16.53,
        "52_week_range_usd": {
            "low": 129.04,
            "high": 182.94
        },
        "beta": 1.20,
        "analyst_rating": "Buy",
        "price_target_usd": 185.00,
        "earnings_date": "2025-10-28"
    },
    {
        "ticker": "TSLA",
        "company": "Tesla, Inc.",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/5/56/Tesla_logo.png",
        "price_usd": 433.72,
        "market_cap_trillion_usd": 1.44,
        "pe_ratio_ttm": 253.94,
        "forward_pe_ratio": 222.88,
        "price_to_sales_ratio": 15.1,
        "shares_outstanding_billions": 3.33,
        "beta": null,
        "52_week_range_usd": {
            "low": null,
            "high": null
        },
    }
]
const stocksList = stocks.map( stock => 
  <li key={stock.ticker} className="stock">
    <img src={logo} alt="company logo" className="stock-logo"></img>
    <h2>{stock.ticker} - {stock.company}</h2>
    <div className="stock-metrics">
        <div className="stock-chart">Stock Chart coming soon</div>
        <span>Price: ${stock.price}</span>
        <span>Market Cap: {stock.market_cap}</span>
        <span>P/E: {stock.pe}</span>
        {/*<h3>52W Range:</h3>*/}
        <span>Low: 
            <span className="green">${stock["52_week_range_usd"].low}</span>
        </span>
        <span>High: 
            <span className="red">${stock["52_week_range_usd"].high}</span>  
        </span>
        <span>Beta: 
            <span className={stock.beta > 1 ? "red" : "green"}>
                {stock.beta}
            </span>
        </span>
        <button>Add to Watchlist</button>
    </div>
  </li>
);

const Screener = () => {
  return (
    <div>
    <div id="Screener-Container" className="Container">
        <div id="Screener-Header">
            <h1>Ticker Picker</h1>  
        </div>
        <ul id="Screener">{stocksList}</ul>
    </div>
    </div>
  );
}

export default Screener