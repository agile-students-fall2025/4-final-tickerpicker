import React, { useState, useEffect } from "react"; // 🔹 added useEffect
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { FaBell } from "react-icons/fa";

export default function Navbar() {
    const { isAuthenticated, user } = useAuth();

    // for searching bar, searching query
    const [query, setQuery] = useState("");
    const navigate = useNavigate(); 

    // notifications
    const [notifItems, setNotifItems] = useState([]); // 🔹 was const [notifItems] = useState([])
    const unreadCount = notifItems.filter(n => !n.isRead).length; // 🔹 use !n.isRead
    const [isNotifOpen, setIsNotifOpen] = useState(false);

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

    // load notifications from backend when logged in
    useEffect(() => {
        if (!isAuthenticated) return;

        (async () => {
            try {
                const res = await fetch("http://localhost:3001/api/notifications");
                if (!res.ok) {
                    console.error("Navbar failed to load notifications:", res.status);
                    return;
                }
                const data = await res.json();
                setNotifItems(data);
            } catch (err) {
                console.error("Navbar error:", err);
            }
        })();
    }, [isAuthenticated]);

    //temporary to route to stock page on search
    const handleSearchSubmit = (e) => {
        const trimmedQuery = query.trim();
        e.preventDefault();
        if (!trimmedQuery) return;
        navigate(`/stock/${trimmedQuery.toUpperCase()}`);
        setQuery(""); // optional: clear search bar
    };

    return (
        <header className="tp-top-nav">
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
                                </form>
                            </div>
                        </>
                    )}
                </div>

                {/* Right: Auth controls */}
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
                            <div 
                                className="relative pb-2"
                                onMouseEnter={() => setIsNotifOpen(true)}
                                onMouseLeave={() => setIsNotifOpen(false)}
                            >
                                <button
                                    type="button"
                                    aria-label="Notifications"
                                    className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                    onClick={() => setIsNotifOpen((prev) => !prev)} 
                                >
                                    <FaBell className="text-lg" />
                                    {notifItems.length > 0 && (
                                        <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500"></span>
                                    )}
                                </button>

                                {/* Dropdown (appears on hover) */}
                                <div 
                                    className={`absolute left-1/2 -translate-x-1/2 mt-2 w-72 rounded-xl border border-tp-border bg-white text-black shadow-xl z-[60] ${isNotifOpen ? "block" : "hidden"}`}
                                    onMouseEnter={() => setIsNotifOpen(true)}
                                    onMouseLeave={() => setIsNotifOpen(false)}
                                >
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-tp-border">
                                        <span className="text-sm font-semibold">Notifications</span>
                                    </div>

                                    <ul className="max-h-72 overflow-auto text-sm">
                                        {notifItems.length === 0 ? (
                                            <li className="px-4 py-3 text-tp-text-dim">
                                                No notifications yet.
                                            </li>
                                        ) : (
                                            notifItems.map((n) => (
                                                <li key={n.id} className="px-4 py-3 border-b border-tp-border">
                                                    <div className="font-semibold text-black">
                                                        {n.symbol}
                                                    </div>
                                                    <div className="text-black">
                                                        {n.message}
                                                    </div>
                                                    <div className="text-xs text-tp-text-dim">
                                                        {new Date(n.createdAt).toLocaleString()}
                                                    </div>
                                                </li>
                                            ))
                                        )}
                                    </ul>

                                    <div className="px-4 py-3 border-t border-tp-border text-center text-sm text-blue-600 hover:underline">
                                        <Link to="/profile">View all notifications</Link>
                                    </div>
                                </div>
                            </div>
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
