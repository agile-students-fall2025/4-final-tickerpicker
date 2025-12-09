/**
 * A tutorial that walks the user through the meaning of each metric.
 */

const METRICS = {
    'P/E Ratio': "Compares the price of the asset to how much it earns per share. Optimally, an investor would like to earn more per share, at a lower price per share. Therefore, lower P/E ratios are preferable. A higher P/E ratio means you are paying more for the same earning potential. A lower P/E ratio may not necessarily be caused by increased earnings, but rather, a decline in price, which often reflects poorer sentiment towards the stock."
    ,'Market Cap': "A generalization of a company’s total value."
    ,'Debt To Equity': ""
    ,'Beta': "Compares a stock’s price movement with the overall movement of the market. Stocks are volatile, which explains why a stock’s price chart is jagged. The market is likewise volatile, moving up and down. A stock’s beta tells you how much it moves relative to the market."
}

const SECTORS = ['Tech/Growth', 'Defensive/Consumer Staples', 'Financials']
/*
P/E ratio: 
The optimal range for `${metric}` (per sector):
-   Tech / Growth: 20–40.
    Tech firms often justify high P/Es because of strong growth potential — rapid innovation, scalable business models, expanding future earnings.
-   Defensive / Consumer Staples: 15 - 25. 
    These firms tend to have stable demand, steady cash flows, and lower growth — so a moderate P/E range reflects that stability without overpaying. A P/E much above 25× often implies investors expect acceleration or premium for safety. 
-   Financials: 10–18.
    Financial firms typically have slower growth and more cyclical earnings, so lower P/Es make sense.  
*/

/*
Beta: 
β = 1.0 indicates that the asset moves in line with the market, that is, the market performance is exactly indicative of the asset’s performance
β < 1.0 indicates the asset is less volatile than the market
β > 1.0 indicates the asset moves more than the market
β < 0 indicates the asset moves inversely with the market.

The optimal range for beta (per sector):
Tech & consumer discretionary: 1.2 – 1.5
Industrials & financials: 1.0
Consumer staples & utilities: 0.4 – 0.8
*/

const LEARNMETRICS = METRICS.map( (metric) => {
    return (
        <li>{metric}</li>
    )
})

return (
    <ul>{LEARNMETRICS}</ul>
)