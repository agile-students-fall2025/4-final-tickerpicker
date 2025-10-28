import "./Filter.css"
import { useState } from "react";


const metrics = [
  "Share Price", "Market Cap", 
  "P/E", "Debt-to-Equity", "Beta" 
];
const text = [
  "See stocks at the price you want",
  "Choose businesses by their size",
  "Find the best earners for you",
  "Sort businesses by their leverage",
  "Sort stocks by their volatility"
];
/* B. FILTER */
const Filter = () => {
  const [value, setValue] = useState(0);
  // Update state on slider change
  const updateSliderValue = (event) => {
    setValue(event.target.value); 
  };

  const metricsFilter = metrics.map( (metric,i) => 
    <li key={metric} className="FilterMetric">
      <h2>{metric}</h2>
      <section className="FilterMetricSlider-container">
        {/* from _ to _ */}
        <div className="range-labels-container">
          <span className="range-label min">min</span>
          <span className="metric-value">{value}</span>
          <span className="range-label max">Max</span>
        </div>
        {/* Range Slide */ }
        <input type="range" min="0" max="5" value={value} onChange={updateSliderValue}/>
        {/* descriptive text underneath */}
        <p>{text[i]}</p>
      </section>
    </li>
  );

  return (
    <div>
    <div id="Filter-Container" className="Container">
        <div id="Filter-Header">
            <h1>Ticker Filter</h1> 
            <span>Lock</span>   
        </div>
        
        <ul id="Filter">{metricsFilter}</ul>
        <div id="Filter-Apply"><button>Apply Filter</button></div>
        
    </div>
    </div>
  )
}

export default Filter