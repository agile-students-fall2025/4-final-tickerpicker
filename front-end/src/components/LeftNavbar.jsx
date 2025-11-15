import React from "react";
import { NavLink } from "react-router-dom";

export default function LeftNav() {
    const linkBase =
        "px-2 py-1 rounded-md text-sm transition-colors";
    const linkIdle =
        "text-tp-text-dim hover:text-black";
    const linkActive =
        "text-black font-medium";

    return (
        <aside className="flex flex-col w-40 shrink-0">
            <nav className="flex flex-col gap-3">
                <NavLink
                    to="/home"
                    className={({ isActive }) =>
                        "block text-md py-2 rounded-md transition-colors " +
                        (isActive
                            ? "text-black font-medium"
                            : "text-tp-text-dim hover:text-black")
                    }
                >
                    Home
                </NavLink>

                {/* Watchlist Link */}
                <NavLink
                    to="/watchlist"
                    className={({ isActive }) =>
                        "block text-md py-2 rounded-md transition-colors " +
                        (isActive
                            ? "text-black font-medium"
                            : "text-tp-text-dim hover:text-black")
                    }
                >
                    Watchlist
                </NavLink>

                {/* Dashboard Link */}
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        "block text-md py-2 rounded-md transition-colors " +
                        (isActive
                            ? "text-black font-medium"
                            : "text-tp-text-dim hover:text-black")
                    }
                >
                    TickerPicker
                </NavLink>
                
                {/* Profile Link */}
                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        "block text-md py-2 rounded-md transition-colors " +
                        (isActive
                            ? "text-black font-medium"
                            : "text-tp-text-dim hover:text-black")
                    }
                >
                    Profile
                </NavLink>
            </nav>
        </aside>
    );
}
