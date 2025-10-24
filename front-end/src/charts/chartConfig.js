/*
Default chart configuration for the TickerPicker app.
*/

export const DEFAULT_CHART_WIDTH = 800
export const DEFAULT_CHART_HEIGHT = 600

export const LIGHT_THEME = {
    layout: {
        textColor: 'black',
        background: {
            color: 'white',
            type: 'solid',
        }
    },
    grid: {
        vertLines: '#e1e1e1', // light gray
        horzLines: '#e1e1e1', // light gray
    }
}

export const DARK_THEME = {
    layout: {
        textColor: 'white',
        background: {
            color: '#1e1e1e',
            type: 'solid',
        }
    },
    grid: {
        vertLines: '#2B2B2B', // dark charcoal
        horzLines: '#2B2B2B', // dark charcoal
    }
}

export const CANDLESTICK_COLORS = {
    upColor: '#26a69a', // teal accent-3
    downColor: '#ef5350', // red accent-4
    upWickColor: '#26a69a', // teal accent-3
    downWickColor: '#ef5350', // red accent-4
    borderVisible: false
}

export function getChartConfig(theme = 'light'){

    const themeConfig = theme === 'light' ? LIGHT_THEME : DARK_THEME // set the theme

    return {
        width: DEFAULT_CHART_WIDTH,
        height: DEFAULT_CHART_HEIGHT,
        ...themeConfig,
        crosshair : {
            mode : 0 // 0: normal , 1: magnet
        },
        timeScale : {
            timeVisible : true, // Show time labels
            secondsVisible : true, // Show seconds in time
        },
        rightPriceScale : {
            borderColor : '#485c7b' // Border color
        }
    }
}