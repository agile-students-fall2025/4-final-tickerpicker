import { expect } from "chai";
import { sortStocks } from "../../front-end/src/components/SortMenu.jsx";

describe("Merge sort implementation on stock list", () => {
    it("Should sort the list of stock objects by the given metric" , () => {
        const stocks = [
            {
            ticker: 'T1',
            company: 'C1',
            price: 610.50,
            market_cap: 15000, 
            pe_ratio: 25.75,
            debt_to_equity: 16.55,
            beta: 0.1
            },
            {
            ticker: 'T2',
            company: 'C2',
            price: 25.50,
            market_cap: 190000, 
            pe_ratio: 30.00,
            debt_to_equity: 28.40,
            beta: 0.55
            },
            {
            ticker: 'T3',
            company: 'C3',
            price: 75.00,
            market_cap: 1000000, 
            pe_ratio: 22.23,
            debt_to_equity: 5.35,
            beta: 0.33
            },
            {
            ticker: 'T4',
            company: 'C4',
            price: 300.10,
            market_cap: 1001000, 
            pe_ratio: 14.03,
            debt_to_equity: 36.75,
            beta: 0.89
            },
            {
            ticker: 'T5',
            company: 'C5',
            price: 98.01,
            market_cap: 4000000, 
            pe_ratio: 28.45,
            debt_to_equity: 17.00,
            beta: 1.1
            },
            {
            ticker: 'T6',
            company: 'C6',
            price: 455,
            market_cap: 100000000, 
            pe_ratio: 31.50,
            debt_to_equity: 42.02,
            beta: -.1
            },
            {
            ticker: 'T7',
            company: 'C7',
            price: 55.84,
            market_cap: 11000000, 
            pe_ratio: 6.07,
            debt_to_equity: 8.05,
            beta: 0.9
            }            
        ]
        const output1 = sortStocks(stocks, "price").map( stock => {
            return stock.price
        });

        const output2 = sortStocks(stocks, "peRatio").map( stock => {
            return stock.pe_ratio
        })
        const output3 = sortStocks(stocks, "beta").map( stock => {
            return stock.beta
        })

        const sortedPrice = [25.5, 55.84, 75, 98.01, 300.1, 455, 610.5];
        const sortedPE = [6.07, 14.03, 22.23, 25.75, 28.45, 57, 30, 31.5]
        const sortedBeta = [-0.1, 0.1, 0.33, 0.55, 0.89, 0.9, 1.1];

        expect(output1).to.deep.equal(sortedPrice);
        expect(output2).to.deep.equal(sortedPE);
        expect(output3).to.deep.equal(sortedBeta);
    })
})