import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { FaBell, FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
    const { isAuthenticated, user } = useAuth();

    // for searching bar, searching query
    const [query, setQuery] = useState("");
    const navigate = useNavigate(); 

    //notifications
    const [notifItems] = useState([]); 
      const unreadCount = notifItems.filter(n => n.unread).length;
      const [isNotifOpen, setIsNotifOpen] = useState(false);
      const notifRef = useRef(null);
      
    // Mobile menu state
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef(null);

    // Close notification dropdown when clicking outside (mobile)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
            }
        };

        if (isNotifOpen || isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isNotifOpen, isMobileMenuOpen]);
    
    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);
    
    // Navigation links
    const navLinks = ['Home', 'Watchlist', 'TickerPicker', 'Profile'];

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
        <header className="tp-top-nav w-full block">
            <div className="max-w-6xl mx-auto w-full px-4 py-3 md:py-4">
                {/* Mobile Layout: Stacked */}
                <div className="flex flex-col md:hidden gap-3">
                    {/* Top Row: Hamburger, Logo and Auth controls */}
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                            {/* Hamburger Menu Button */}
                            <button
                                type="button"
                                aria-label="Menu"
                                className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/10 focus:outline-none"
                                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                            >
                                {isMobileMenuOpen ? (
                                    <FaTimes className="text-lg text-white" />
                                ) : (
                                    <FaBars className="text-lg text-white" />
                                )}
                            </button>
                            <Link
                                to="/home"
                                className="text-2xl font-semibold text-white hover:text-tp-text-dim transition-colors whitespace-nowrap"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                TickerPicker
                            </Link>
                        </div>
                        <div className="flex items-center gap-2">
                            {!isAuthenticated && (
                                <>
                                    <Link to="/login" className="tp-btn-white text-xs">Log In</Link>
                                    <Link to="/register" className="tp-btn-primary text-xs">Register</Link>
                                </>
                            )}
                            {isAuthenticated && (
                                <div className="relative" ref={notifRef}>
                                    <button
                                        type="button"
                                        aria-label="Notifications"
                                        className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/10"
                                        onClick={() => setIsNotifOpen((prev) => !prev)}
                                    >
                                        <FaBell className="text-lg text-white" />
                                        <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500"></span>
                                    </button>
                                    {isNotifOpen && (
                                        <div 
                                            className="absolute right-0 mt-2 w-72 rounded-xl border border-tp-border bg-white text-black shadow-xl z-[60]"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="flex items-center justify-between px-4 py-3 border-b border-tp-border">
                                                <span className="text-sm font-semibold">Notifications</span>
                                                <button 
                                                    onClick={() => setIsNotifOpen(false)}
                                                    className="text-tp-text-dim hover:text-black"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            <ul className="max-h-72 overflow-auto text-sm"></ul>
                                            <div className="px-4 py-3 border-t border-tp-border text-center text-sm text-blue-600 hover:underline">
                                                <Link to="/profile" onClick={() => setIsNotifOpen(false)}>View all notifications</Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Search bar (mobile) */}
                    {isAuthenticated && (
                        <form onSubmit={handleSearchSubmit} className="w-full">
                            <input
                                type="text"
                                className="w-full tp-search-bar placeholder-tp-text-dim"
                                placeholder="Search tickers"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </form>
                    )}
                </div>
                
                {/* Mobile Menu Slide-out */}
                {isMobileMenuOpen && (
                    <div 
                        ref={mobileMenuRef}
                        className="fixed inset-0 z-[60] md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/50"></div>
                        {/* Menu Panel */}
                        <div 
                            className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex flex-col h-full">
                                {/* Menu Header */}
                                <div className="flex items-center justify-between p-4 border-b border-tp-border">
                                    <h2 className="text-lg font-semibold text-black">Menu</h2>
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                                    >
                                        <FaTimes className="text-lg text-black" />
                                    </button>
                                </div>
                                {/* Navigation Links */}
                                <nav className="flex flex-col p-4 gap-2">
                                    {navLinks.map((link) => (
                                        <NavLink
                                            key={link}
                                            to={`/${link}`}
                                            className={({ isActive }) =>
                                                `px-4 py-3 rounded-lg transition-colors ${
                                                    isActive
                                                        ? "bg-tp-accent text-white font-medium"
                                                        : "text-black hover:bg-gray-100"
                                                }`
                                            }
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {link}
                                        </NavLink>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}

                {/* Desktop Layout: Horizontal */}
                <div className="hidden md:flex items-center justify-between gap-4">
                    {/* Left: Logo */}
                    <Link
                        to="/home"
                        className="text-3xl lg:text-[3em] font-semibold text-white hover:text-tp-text-dim transition-colors whitespace-nowrap flex-shrink-0">
                        TickerPicker
                    </Link>

                    {/* Center: Search bar */}
                    {isAuthenticated && (
                        <div className="flex-1 flex justify-center max-w-xl">
                            <form onSubmit={handleSearchSubmit} className="w-full">
                                <input
                                    type="text"
                                    className="w-full tp-search-bar placeholder-tp-text-dim"
                                    placeholder="Search tickers"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </form>
                        </div>
                    )}

                    {/* Right: Auth controls */}
                    <div className="flex items-center gap-4 flex-shrink-0">
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
                            {/* Notification Bell (desktop) */}
                            <div 
                                className="relative"
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
            </div>
        </header>
    );
}
