import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
    const { isAuthenticated, user } = useAuth();

    const avatarUrl = `https://picsum.photos/seed/${
        user?.email || "guest"
    }/48/48`;

    return (
        <header className="border-b border-tp-border bg-[#0f172a] text-white sticky top-0 z-50">
            <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-4">
                {/* Brand / Logo */}
                <Link
                    to="/"
                    className="text-lg font-semibold text-white hover:text-tp-text-dim transition-colors">
                    TickerPicker
                </Link>

                {/* Right side auth controls */}
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
                                Sign Up
                            </Link>
                        </>
                    )}

                    {isAuthenticated && (
                        <>
                            <Link
                                to="/profile"
                                className="flex items-center gap-2 hover:opacity-90">
                                <img
                                    src={avatarUrl}
                                    className="w-8 h-8 rounded-xl border border-tp-border object-cover"
                                    alt="avatar"
                                />
                                <div className="hidden md:flex flex-col leading-tight">
                                    <span className="text-white text-xs font-medium">
                                        {user?.name || "User"}
                                    </span>
                                    <span className="text-[10px] text-tp-text-dim">
                                        {user?.email}
                                    </span>
                                </div>
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
