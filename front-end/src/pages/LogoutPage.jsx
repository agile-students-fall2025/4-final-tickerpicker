import React from "react";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";

export default function LogoutPage() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        logout();
        navigate("/login");
    }, [logout, navigate]);

    return (
        <section className="max-w-md mx-auto">
            <div className="tp-card p-8 flex flex-col items-center text-center gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold text-white">
                        You have been logged out
                    </h1>
                    <p className="text-sm text-tp-text-dim">
                        Your session has ended.
                    </p>
                </div>

                <div className="flex flex-col w-full gap-3">
                    <button
                        onClick={() => navigate("/login")}
                        className="tp-btn-primary w-full text-sm font-semibold">
                        Log In Again
                    </button>

                    <Link
                        to="/"
                        className="tp-btn-outline w-full text-sm font-medium text-center">
                        Go to Home
                    </Link>
                </div>
            </div>
        </section>
    );
}