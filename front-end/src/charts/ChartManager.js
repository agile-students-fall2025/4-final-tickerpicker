import {createChart, CandlestickSeries} from 'lightweight-charts'
import {getChartConfig, CANDLESTICK_COLORS} from './chartConfig'

class ChartManager{
    constructor(){

        this.charts = {}
        this.series = {}
        console.log('ChartManager initialized')
    }
    
    /**
    * Creates a new chart instance
    * @param { string } chartId - Unique identifier for this chart
    * @param { HTMLElement } containerId - DOM element to contain the chart
    * @param { object } options - Chart configuration options
    * @returns { object } The created chart instance
    */

    addChart(chartId, containerId, options = {}){

        if(this.charts[chartId]){
            console.warn(`Chart with id ${chartId} already exists. Removing it...`)
            this.removeChart(chartId)
        }

        // Merge default config with user options. User options override default config.
        const chartConfig = {...getChartConfig(), ...options}

        const chart = createChart(containerId, chartConfig)
        this.charts[chartId] = chart
        this.series[chartId] = []
        console.log(`Chart with id ${chartId} added successfully`)
        return chart
    }

    /**
     * Adds a candlestick series to a chart
     * @param { string } chartId - The chart to add series to
     * @param { string } seriesId - Unique identifier for this series
     * @param { object } options - Series configuration options
     * @returns { object } The created series instance
     */

    addCandlestickSeries(chartId, seriesId, options = {}){

        // Check if the chart exists
        if(!this.charts[chartId]){
            throw new Error(`Chart with id ${chartId} does not exist`)
        }

        // Check if the series already exists
        if(this.series[chartId][seriesId]){
            console.warn(`Series with id ${seriesId} already exists on chart ${chartId}`)
            return this.series[chartId][seriesId]
        }

        // Fetch the chart instance
        const chart = this.charts[chartId]
        // Merge default candlestick options with user options. User options override default options.
        const candlestickOptions = {...CANDLESTICK_COLORS, ...options}
        // Add the series to the chart
        const series = chart.addSeries(CandlestickSeries, seriesId, candlestickOptions)
        // Store the series instance in the series object
        this.series[chartId][seriesId] = series
        console.log(`Candlestick series with id ${seriesId} added to chart ${chartId} successfully`)
        // Return the series instance
        return series
    }

    removeChart(chartId){
        if(!this.charts[chartId]){
            throw new Error(`Chart with id ${chartId} does not exist`)
        }
        this.charts[chartId].remove()

        delete this.charts[chartId]
        delete this.series[chartId]

        console.log(`Chart with id ${chartId} removed successfully`)
        return true
    }

    removeAllCharts(){
        const chartIds = Object.keys(this.charts)
        for (const chartId of chartIds){
            this.removeChart(chartId)
        }
        console.log(`All charts removed successfully`)
        return true
    }
    
    // This function will probably never be used unless we want to swap out a series for another. But we might as well just delete the chart instance and make a new one.
    removeSeries(chartId, seriesId){
        if(!this.charts[chartId] || !this.series[chartId][seriesId]){
            throw new Error(`Series with id ${seriesId} does not exist on chart ${chartId}`)
        }
        this.series[chartId][seriesId].remove()
        delete this.series[chartId][seriesId]
        console.log(`Series with id ${seriesId} removed from chart ${chartId} successfully`)
        return true
    }

    getChart(chartId){
        return this.charts[chartId] || null
    }

    getSeries(chartId, seriesId){
        if(!this.series[chartId] || !this.series[chartId][seriesId]){
            throw new Error(`Series with id ${seriesId} does not exist on chart ${chartId}`)
        }
        return this.series[chartId][seriesId] || null
    }

    hasChart(chartId){
        return this.charts[chartId] ? true : false
    }

    getChartIds(){
        return Object.keys(this.charts)
    }

    getChartCount(){
        return Object.keys(this.charts).length
    }
}

export default ChartManager