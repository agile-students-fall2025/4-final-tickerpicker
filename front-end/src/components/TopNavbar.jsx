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
  const [notifItems, setNotifItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const notifTimeoutRef = useRef(null);

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  //helper function to load notifications
  const loadNotifications = async () => {
    if (!isAuthenticated) return;

    try {
      const res = await fetch("http://localhost:3001/api/notifications");

      const data = await res.json();

      setNotifItems(data);
      // Update unread count
      const unread = data.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Navbar fetch error:", err);
    }
  };

  // Helper function to load unread count only (lighter than loading all notifications)
  const loadUnreadCount = async () => {
    if (!isAuthenticated) return;

    try {
      const res = await fetch(
        "http://localhost:3001/api/notifications/unread-count"
      );
      if (!res.ok) return;

      const data = await res.json();
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error("Navbar unread count error:", err);
    }
  };
  // Close notification dropdown when clicking outside (mobile only)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only handle click-outside for mobile (desktop uses hover)
      if (window.innerWidth < 768) {
        if (notifRef.current && !notifRef.current.contains(event.target)) {
          setIsNotifOpen(false);
        }
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isNotifOpen || isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      // Clear any pending timeout on cleanup
      if (notifTimeoutRef.current) {
        clearTimeout(notifTimeoutRef.current);
      }
    };
  }, [isNotifOpen, isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Navigation links
  const navLinks = [
    "Home",
    "Watchlist",
    "TickerPicker",
    "Profile",
    "Notifications",
  ];

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

  // load unread count from backend when logged in
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      setNotifItems([]);
      return;
    }

    // Initial load of unread count
    loadUnreadCount();

    // Listen for notification updates from other components (e.g., Notifications page)
    const handleNotificationUpdate = () => {
      loadUnreadCount();
    };

    window.addEventListener("notificationUpdated", handleNotificationUpdate);

    return () => {
      window.removeEventListener(
        "notificationUpdated",
        handleNotificationUpdate
      );
    };
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
                  <Link to="/login" className="tp-btn-white text-xs">
                    Log In
                  </Link>
                  <Link to="/register" className="tp-btn-primary text-xs">
                    Register
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    aria-label="Notifications"
                    className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/10"
                    onClick={async () => {
                      const willOpen = !isNotifOpen;
                      setIsNotifOpen(willOpen);
                      if (willOpen) {
                        await loadNotifications();
                      }
                    }}
                  >
                    <FaBell className="text-lg text-white" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-xs font-semibold">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {isNotifOpen && (
                    <div
                      className="absolute right-0 mt-2 w-72 rounded-xl border border-tp-border bg-white text-black shadow-xl z-[60]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-tp-border">
                        <span className="text-sm font-semibold">
                          Notifications
                        </span>
                        <button
                          onClick={() => setIsNotifOpen(false)}
                          className="text-tp-text-dim hover:text-black"
                        >
                          ×
                        </button>
                      </div>
                      <ul className="max-h-72 overflow-auto text-sm">
                        {notifItems.length === 0 ? (
                          <li className="px-4 py-3 text-tp-text-dim">
                            No notifications yet.
                          </li>
                        ) : (
                          notifItems.map((n) => (
                            <li
                              key={
                                n.id ||
                                n._id ||
                                `notif-${n.symbol}-${n.createdAt}`
                              }
                              className={`px-4 py-3 border-b border-tp-border ${
                                !n.isRead ? "bg-blue-50" : ""
                              }`}
                            >
                              <div className="font-semibold text-black">
                                {n.symbol}
                              </div>
                              <div className="text-black">{n.message}</div>
                              <div className="text-xs text-tp-text-dim">
                                {new Date(n.createdAt).toLocaleString()}
                              </div>
                            </li>
                          ))
                        )}
                      </ul>
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
            className="text-3xl lg:text-[3em] font-semibold text-white hover:text-tp-text-dim transition-colors whitespace-nowrap flex-shrink-0"
          >
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
                <Link to="/login" className="tp-btn-white text-xs md:text-sm">
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="tp-btn-primary text-xs md:text-sm"
                >
                  Register
                </Link>
              </>
            )}

            {isAuthenticated && (
              <>
                {/* Notification Bell (desktop) */}
                <div
                  className="relative"
                  ref={notifRef}
                  onMouseEnter={() => {
                    // Clear any pending close timeout
                    if (notifTimeoutRef.current) {
                      clearTimeout(notifTimeoutRef.current);
                      notifTimeoutRef.current = null;
                    }
                    setIsNotifOpen(true);
                  }}
                  onMouseLeave={() => {
                    // Add a small delay before closing to prevent flickering
                    notifTimeoutRef.current = setTimeout(() => {
                      setIsNotifOpen(false);
                    }, 300); // 300ms delay for better stability
                  }}
                >
                  <button
                    type="button"
                    aria-label="Notifications"
                    className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    onClick={async () => {
                      const willOpen = !isNotifOpen;
                      // Clear timeout on click
                      if (notifTimeoutRef.current) {
                        clearTimeout(notifTimeoutRef.current);
                        notifTimeoutRef.current = null;
                      }
                      setIsNotifOpen(willOpen);
                      if (willOpen) {
                        await loadNotifications();
                      }
                    }}
                  >
                    <FaBell className="text-lg" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-xs font-semibold">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Invisible bridge to prevent gap issues */}
                  {isNotifOpen && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 top-full w-72 h-2 pointer-events-none"
                      aria-hidden="true"
                    />
                  )}

                  {/* Dropdown (appears on hover/click) */}
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 rounded-xl border border-tp-border bg-white text-black shadow-xl z-[60] ${
                      isNotifOpen ? "block" : "hidden"
                    }`}
                    onMouseEnter={() => {
                      // Clear any pending close timeout when mouse enters dropdown
                      if (notifTimeoutRef.current) {
                        clearTimeout(notifTimeoutRef.current);
                        notifTimeoutRef.current = null;
                      }
                      setIsNotifOpen(true);
                    }}
                    onMouseLeave={() => {
                      // Add delay before closing
                      notifTimeoutRef.current = setTimeout(() => {
                        setIsNotifOpen(false);
                      }, 300);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-tp-border">
                      <span className="text-sm font-semibold">
                        Notifications
                      </span>
                    </div>

                    <ul className="max-h-72 overflow-auto text-sm">
                      {notifItems.length === 0 ? (
                        <li className="px-4 py-3 text-tp-text-dim">
                          No notifications yet.
                        </li>
                      ) : (
                        notifItems.map((n) => (
                          <li
                            key={
                              n.id ||
                              n._id ||
                              `notif-${n.symbol}-${n.createdAt}`
                            }
                            className={`px-4 py-3 border-b border-tp-border ${
                              !n.isRead ? "bg-blue-50" : ""
                            }`}
                          >
                            <div className="font-semibold text-black">
                              {n.symbol}
                            </div>
                            <div className="text-black">{n.message}</div>
                            <div className="text-xs text-tp-text-dim">
                              {new Date(n.createdAt).toLocaleString()}
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </>
            )}

            {isAuthenticated && (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 hover:opacity-90"
                >
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

                <Link to="/logout" className="tp-btn-white text-xs md:text-sm">
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
