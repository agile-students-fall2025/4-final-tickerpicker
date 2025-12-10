import React from "react";

/**
 * A tutorial that walks the user through the meaning of each metric.
 */
// metrics and their meanings
const METRICS = {
    'P/E Ratio': "Compares the price of the asset to how much it earns per share. Optimally, an investor would like to earn more per share, at a lower price per share. Therefore, lower P/E ratios are preferable. A higher P/E ratio means you are paying more for the same earning potential. A lower P/E ratio may not necessarily be caused by increased earnings, but rather, a decline in price, which often reflects poorer sentiment towards the stock."
    ,'Market Cap': "A generalization of a company's total value. Market cap is calculated by multiplying a company's outstanding shares by the share price. Market cap tells an investor the size of the company."
    ,'Debt-to-Equity': "Compares a company's debt to its shareholders' capital. This tells an investor how much of the company is financed by debt and how much is financed by equity. A lower D/E ratio typically indicates a company has greater leverage, as it is able to finance its operations with equity, rather than debt. Higher debt, and a higher D/E ratio, may be harbingers of a company's path to insolvency."
    ,'Beta': "Compares a stock's price movement with the overall movement of the market. Stocks are volatile, which explains why a stocks' price chart is jagged. The market is likewise volatile, moving up and down. A stock's beta tells you how much it moves relative to the market."
}
// optimal ranges for each metric per sector
const OPTIMAL_RANGE_PER_SECT = {
    'P/E Ratio':        ['20-40',       '15-25',            '10-18'],
    'Debt-to-Equity':   ['< 1.0',       '1.5 -- 3',         '> 2.0'],
    'Beta':             ['1.2 -- 1.6',  '0.4 -- 0.9',       '0.8 -- 1.3']
}
const SECTORS =         ['Tech/Growth', 'Defensive/Consumer Staples', 'Financials']

// interpration
const INTERPRATION = {
    'Debt-to-Equity': {
        "< 1.0":    "more equity than debt",
        "1.0":      "moderate leverage",
        "> 2.0":    "more debt than equity"
    },
    'Beta': {
        '< 0':      "inversely volatile with the market",
        '< 1.0':    "less volatile than the market",
        '= 1.0':    "as volatile as the market",
        '> 1.0':    "more volatile than the market"
    }
}

// convert the above to bullet points
const INTERPRATION_DE = Object.keys(INTERPRATION['Debt-to-Equity']).map( expression => {
        return (
            <li>
                <span>{expression}: INTERPRATION['Debt-to-Equity'][expression]</span>
            </li>
        )
});
const INTERPRATION_BETA = Object.keys(INTERPRATION['Beta']).map( expression => {
        return (
            <li>
                <span>{expression}: {INTERPRATION['Beta'][expression]}</span>
            </li>
        )
});

const LEARNMETRICS = Object.keys(METRICS).map( metric => {
    return (
        <li key={metric}>
            <div style="display: flex; flex-direction: row;">
                {/* Left */}
                <h2>{metrics}</h2>
                {/* Right */}
                <div style="display: flex; flex-direction: column;">
                    {/* Definition */}
                    <span>{METRICS[metric]}</span>  
                    {/* More facts, specific to Beta and DE */}
                    { (metric == 'Beta' || metric == 'Debt-to-Equity') && 
                        (<ul>
                            { (metric == 'Beta') ? INTERPRATION_BETA : INTERPRATION_DE }
                        </ul>)
                    }
                </div>
            </div>
        </li>
    );
})

return (
    <ul>{LEARNMETRICS}</ul>
)