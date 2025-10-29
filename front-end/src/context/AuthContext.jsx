/**
 * uses psuedo back-end for testing purposes (only for Sprint 1)
 * basically authenticate users, login/register/logout
 */

import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    // Load from localStorage on first render
    useEffect(() => {
        try {
            const raw = window.localStorage.getItem("tp-user");
            if (raw) {
              const parsed = JSON.parse(raw);
              setUser(parsed);
            }
        } catch (err) {
            console.error("Failed to parse stored user:", err);
        }
    }, []);

    // helper to persist
    function persistUser(u) {
        setUser(u);
        if (u) {
            window.localStorage.setItem("tp-user", JSON.stringify(u));
        } else {
            window.localStorage.removeItem("tp-user");
        }
    }

    // Register: create new local "account"
    function register({ name, email, password }) {
        const newUser = { name, email, password };
        persistUser(newUser);
        return { ok: true };
    }

    // Login: validate credentials
    function login({ email, password }) {
        const raw = window.localStorage.getItem("tp-user");
        if (!raw) {
            return {
                ok: false,
                error: "No account found. Please register first."
            };
        }

        const existing = JSON.parse(raw);
        if (
            existing.email === email.trim() &&
            existing.password === password
        ) {
            persistUser(existing);
            return { ok: true };
        }

        return { ok: false, error: "Invalid email or password." };
    }

    function logout() {
        persistUser(null);
        return { ok: true };
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                register,
                login,
                logout
            }}>
            {children}
        </AuthContext.Provider>
    );
}

// hook for convenience
export function useAuth() {
    return useContext(AuthContext);
}