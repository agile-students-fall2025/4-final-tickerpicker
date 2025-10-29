export default {
    content: [
        "./front-end/index.html",
        "./front-end/src/**/*.{js,jsx}"
    ],
    theme: {
        extend: {
            colors: {
                "tp-bg": "#ffffff",        // white background
                "tp-card": "#ffffffff",      // shallow grey card
                "tp-accent": "#213291ff",
                "tp-text-dim": "#6b7280",  // 次要文字 灰
                "tp-border": "#334155"     // 边框浅灰
            },
            borderRadius: {
                "2xl": "1rem",
                "3xl": "1.5rem"
            },
            boxShadow: {
                "tp-card": "0 24px 48px rgba(0,0,30,0.6)"
            }
        }
    },
    plugins: []
}