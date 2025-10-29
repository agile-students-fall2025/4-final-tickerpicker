import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="grid gap-8 lg:grid-cols-3">
      {/* Hero / pitch */}
      <div className="lg:col-span-2 tp-card p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-black leading-snug">
            {isAuthenticated
              ? `Welcome back, ${user?.name || "Investor"}`
              : "Build smarter stock picks, not louder noise"}
          </h1>
          <p className="text-sm text-tp-text-dim max-w-prose">
            TickerPicker helps beginner investors screen companies
            by fundamentals (P/E, EPS growth, debt/equity, beta),
            technicals (moving averages / gold-cross, etc.), and even
            crowding (institutional flow vs. retail hype).
          </p>
        </div>

        {!isAuthenticated && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/register"
              className="tp-btn-primary text-sm font-semibold flex-1 text-center"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="tp-btn-outline text-sm font-medium flex-1 text-center"
            >
              I already have an account
            </Link>
          </div>
        )}

        {isAuthenticated && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/screener"
              className="tp-btn-primary text-sm font-semibold flex-1 text-center"
            >
              Open Screener
            </Link>
            <Link
              to="/watchlist"
              className="tp-btn-outline text-sm font-medium flex-1 text-center"
            >
              View Watchlist
            </Link>
          </div>
        )}
      </div>

      {/* Side card */}
      <aside className="tp-card p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-black">
          Why TickerPicker?
        </h2>
        <ul className="flex flex-col gap-3 text-sm text-tp-text-dim">
          <li className="flex flex-col">
            <span className="text-black font-medium">
              Research without overload
            </span>
            <span className="text-xs text-tp-text-dim">
              We surface the numbers that actually matter instead of
              dumping a data firehose.
            </span>
          </li>
          <li className="flex flex-col">
            <span className="text-black font-medium">
              Structured watchlist
            </span>
            <span className="text-xs text-tp-text-dim">
              Save tickers you care about and track performance later.
            </span>
          </li>
          <li className="flex flex-col">
            <span className="text-black font-medium">
              Alerts & signals
            </span>
            <span className="text-xs text-tp-text-dim">
              Set up notifications for changes you actually care about
              (Sprint 2+).
            </span>
          </li>
        </ul>
      </aside>
    </section>
  );
}
