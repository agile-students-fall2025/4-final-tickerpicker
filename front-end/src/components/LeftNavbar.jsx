import React from "react";
import { NavLink } from "react-router-dom";

export default function LeftNav() {
    const links = ['Home', 'Watchlist', 'TickerPicker', 'Profile'].map(link => {
        return (
            <NavLink
                key={link}
                to={`/${link}`}
                className={({ isActive }) =>
                "tp-navlink " +
                (isActive
                    ? "text-black font-medium"
                    : "text-black text-[1.5em] hover:text-blue-800")
                }
            >{link}</NavLink>
        )
    })
    return (
        <aside className="tp-left-nav">
            <nav className="flex flex-col gap-3">{links}</nav>
        </aside>
    );
}
