import {createChart, candlestickSeries} from 'lightweight-charts'
import {getChartConfig, CANDLESTICK_COLORS} from './chartConfig'

class ChartManager{
    constructor(){

        this.charts = {}
        this.series = {}
        console.log('ChartManager initialized')
    }

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
}

export default ChartManager