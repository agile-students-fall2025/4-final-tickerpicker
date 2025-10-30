/**
 * mocking backend interations with localStorage
 * uses psuedo back-end for testing purposes (only for Sprint 1)
 * basically authenticate users, login/register/logout
 * 
 * Note: this file can be substituted when we're actually working on the backend, just
 * delete the mocking methdos we have so far and add the actual http request
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

    // since we don't have an actual db yet, just create new local pesudo "account"
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

    function updateEmail(newEmail) {
        const raw = window.localStorage.getItem("tp-user");
        if (!raw) return { ok: false, error: "No account found." };
        const existing = JSON.parse(raw);
        const updated = { ...existing, email: newEmail.trim() };
        persistUser(updated);
        return { ok: true };
    }

    function updatePassword(oldPassword, newPassword) {
        const raw = window.localStorage.getItem("tp-user");
        if (!raw) return { ok: false, error: "No account found." };
        const existing = JSON.parse(raw);
        if (existing.password !== oldPassword) {
            return { ok: false, error: "Old password is incorrect." };
        }
        if (newPassword === existing.password) {
            return {ok: false, error: "New password and the old password cannot be the same"}
        }
        const updated = { ...existing, password: newPassword };
        persistUser(updated);
        return { ok: true };
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                register,
                login,
                logout,
                updateEmail,
                updatePassword
            }}>
            {children}
        </AuthContext.Provider>
    );
}

// hook for convenience
export function useAuth() {
    return useContext(AuthContext);
}