export function formatPrice(price, decimals = 2) {
    return '$' + price.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatPercent(value) {
    const percent = (value * 100).toFixed(2);
    return percent + '%';
}
