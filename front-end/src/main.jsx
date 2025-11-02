import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./styles/globals.css";

const rootEl = document.getElementById("root");

if (import.meta.env.VITE_USE_MOCK === "true") {
  const { setupMocks } = await import("../mock/index.js"); // path from src/
  setupMocks();
}
createRoot(rootEl).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);