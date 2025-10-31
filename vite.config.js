import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    root: "front-end",
    plugins: [react()],
    server: {
        port: 5173,
        fs: { strict: false }
    },
    preview: {
        port: 5173
    },
    build: {
        outDir: '../dist',
        emptyOutDir: true
    }
})