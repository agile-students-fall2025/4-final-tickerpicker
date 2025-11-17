import React from "react";

const metrics = ['price','peRatio','marketCap','debtToEquity','beta']
const metricLabels = ['Price', 'P/E Ratio', 'Market Cap', 'Debt To Equity', 'Beta']

const options = metrics.map( (metric,i) => {
    return (
        <option key={metric} value={metric}>{metricLabels[i]}</option>
    )
})

/**
 * Recursive implementation of merge sort that sorts stock objects.
 * @param {*} stocks Array of stock objects
 * @param {*} metric Metric to sort by
 * @return List of stocks sorted by metric
 */
export function sortStocks(stocks, metric){
    // safe python_case conversion
    if (metric.includes("Ratio")) metric = "pe_ratio";
    if (metric.includes("Market")) metric = "market_cap";
    if (metric.includes("Debt")) metric = "debt_to_equity";

    if (stocks.length == 0) {console.log("Cannot sort!"); return stocks;}

    // sort by stock[metric]
    let n = stocks.length 
    
    // base case
    if (n == 1) return stocks;

    // compute mid
    let mid = Math.ceil(n/2);
    
    // recurse on both halfs
    let low = sortStocks(stocks.slice(0,mid),metric)
    let high = sortStocks(stocks.slice(mid,n),metric)

    // combine
    let i = 0;
    let j = 0;
    let sorted = []
    while(i < low.length && j < high.length){
        if (low[i][metric] > high[j][metric]){
            sorted.push(high[j])
            j += 1
        } else { 
            sorted.push(low[i])
            i += 1 
        }
    }
    // leftovers
    sorted.push(...low.slice(i))
    sorted.push(...high.slice(j))
    
    //console.log(sorted);
    return sorted
}

const SortMenu = ({value, onChange}) => {
    return(
        <div className="sort text-black text-xl">Sort By
            <select 
                className="border border-black"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >{options}</select>
        </div>
    )
}

export default SortMenu;