import React from "react";
import { NavLink } from "react-router-dom";

export default function LeftNav() {
    const linkBase =
        "px-2 py-1 rounded-md text-sm transition-colors";
    const linkIdle =
        "text-tp-text-dim hover:text-black";
    const linkActive =
        "text-black font-medium";

    const links = ['Home', 'Watchlist', 'TickerPicker', 'Profile'].map(link => {
        return (
            <NavLink
                key={link}
                to="/home"
                className={({ isActive }) =>
                "block text-xl py-2 rounded-md transition-colors " +
                (isActive
                    ? "text-black font-medium"
                    : "text-tp-text-dim hover:text-black")
                }
            >{link}</NavLink>
        )
    })
    return (
        <aside className="flex flex-col w-40 shrink-0">
            <nav className="flex flex-col gap-3">{links}
                {/*
                <NavLink
                    to="/home"
                    className={({ isActive }) =>
                        "block text-xl py-2 rounded-md transition-colors " +
                        (isActive
                            ? "text-black font-medium"
                            : "text-tp-text-dim hover:text-black")
                    }
                >
                    Home
                </NavLink>

                {/*
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
                */}
            </nav>
        </aside>
    );
}
