import React, { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { FaBell } from "react-icons/fa";


export default function Navbar() {
    const { isAuthenticated, user } = useAuth();

    // for searching bar, searching query
    const [query, setQuery] = useState("")
    const navigate = useNavigate(); 

    const avatarUrl = `https://picsum.photos/seed/${
        user?.email || "guest"
    }/48/48`;

    const handleQuery = (e) => {
        e.preventDefault();
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;
        // so far this does nothing since we don't have a backend. Once we have a backend
        // we can use this trimmedQuery to search in our database about anything
    };


    //temporary to route to stock page on search
    const handleSearchSubmit = (e) => {
    e.preventDefault();
    // ignore what user typed; always go to /stock (AAPL)
    navigate(`/stock/${trimmed.toUpperCase()}`)
    setQuery(""); // optional: clear search bar
  };

    return (
        <header className="border-b border-tp-border bg-[#0f172a] text-white sticky top-0 z-50">
            <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-4">
                {/* Ticker Picker logo and search bar */}
                <div className=" flex items-center gap-10">
                    <Link
                        to="/home"
                        className="text-lg font-semibold text-white hover:text-tp-text-dim transition-colors">
                        TickerPicker
                    </Link>

                    {isAuthenticated && (
                        <>
                            <div className="flex items-center">
                                <form onSubmit={handleSearchSubmit}>
                                <input
                                    type="text"
                                    className="flex-1 ml-2 tp-search-bar placeholder-tp-text-dim"
                                    placeholder="Search TickerPicker"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />

                                {/* Search button, but feel that without it is more aethetically pleasing */}
                                {/* <button
                                    type="submit"
                                    className="tp-btn-white text-xs text-white px-2.5 py-1 rounded-md ml-2 whitespace-nowrap"
                                >
                                    Search
                                </button> */}

                                </form>
                            </div>
                        </>
                    )}
                </div>

                {/* Authentication ctrls */}
                <div className="flex items-center gap-4">
                    {!isAuthenticated && (
                        <>
                            <Link
                                to="/login"
                                className="tp-btn-white text-xs md:text-sm">
                                Log In
                            </Link>
                            <Link
                                to="/register"
                                className="tp-btn-primary text-xs md:text-sm">
                                Register
                            </Link>
                        </>
                    )}

                    {isAuthenticated && (
                        <>
                            {/* Notification Bell */}
                            <button
                                className="relative hover:opacity-80 transition"
                                onClick={() => navigate("/profile")} 
                            >
                                <FaBell className="text-xl" />
                                
                                {/* Optional unread dot */}
                                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                            </button>

                        </>
                    )}


                    {isAuthenticated && (
                        <>
                            <Link
                                to="/profile"
                                className="flex items-center gap-2 hover:opacity-90">
                                <div className="hidden md:flex flex-col leading-tight">
                                    <span className="text-white text-xs font-medium">
                                        {user?.name || "User"}
                                    </span>
                                    <span className="text-[10px] text-tp-text-dim">
                                        {user?.email}
                                    </span>
                                </div>
                                <img
                                    src={avatarUrl}
                                    className="w-8 h-8 rounded-xl border border-tp-border object-cover"
                                    alt="avatar"
                                />
                            </Link>

                            <Link
                                to="/logout"
                                className="tp-btn-white text-xs md:text-sm">
                                Logout
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
