/**
 * (DEPRECATED COMMENT)
 * mocking backend interations with localStorage
 * uses psuedo back-end for testing purposes (only for Sprint 1)
 * basically authenticate users, login/register/logout
 * 
 * Note: this file can be substituted when we're actually working on the backend, just
 * delete the mocking methdos we have so far and add the actual http request
 */

/**
 * Using JWT (Json web token) for authentication
 * This now uses real backend thru api/auth
 */
import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);
const API_BASE_URL = "http://localhost:3001";

//helper for normalizing name/email from backend to frontend
function normalizeUser(raw) {
    if (!raw) return null;

    const username = (raw.username || raw.email || raw.name || "").trim();
    const base = username || "user";

    return {
        id: raw.id,
        username: base,
        // 让 Profile 能正常显示
        name: raw.name || base,
        email: raw.email || base,
        roles: raw.roles || [],
    };
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);

    // Bootstrap from localStorage on the first render
    useEffect(() => {
        try {
            const rawUser = window.localStorage.getItem("tp-user");
            if (rawUser) {
            const parsed = JSON.parse(rawUser);
            if (parsed && parsed.password) {
                delete parsed.password;
            }
            const normalized = normalizeUser(parsed);
            window.localStorage.setItem("tp-user", JSON.stringify(normalized));
            setUser(normalized || null);
        }
            const token = window.localStorage.getItem("tp-access");
            if (token) setAccessToken(token);
        } catch (err) {
            console.error("Failed to bootstrap auth:", err);
            setUser(null);
            setAccessToken(null);
            window.localStorage.removeItem("tp-user");
            window.localStorage.removeItem("tp-access");
        }
    }, []);
    const isAuthenticated = !!accessToken;

    // Persist user/token to localStorage(not storing password)
    function persistAuth({ nextUser, token }) {
        if (nextUser) {
            const safeUser = normalizeUser(nextUser);
            delete safeUser.password;
            window.localStorage.setItem("tp-user", JSON.stringify(safeUser));
            setUser(safeUser);
        } else {
            window.localStorage.removeItem("tp-user");
            setUser(null);
        }
        if (token) {
            window.localStorage.setItem("tp-access", token);
            setAccessToken(token);
        } else {
            window.localStorage.removeItem("tp-access");
            setAccessToken(null);
        }
    }

    // Build authorization header if signed in
    function getAuthHeaders() {
        return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    }

    // Wrapper around fetch with JSON and authorization
    async function fetchWithAuth(path, options = {}) {
        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {}),
            ...getAuthHeaders(),
        };
        const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
        return res;
    }

    async function register({ name, email, password }) {
        const username = (email || name || "").trim();
        if (!username || !password) {
            return { ok: false, error: "username/email and password are required" };
        }
        try {
            // 1st: register the user
            const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const regData = await res.json().catch(() => ({}));

        if (!res.ok) {
            return { ok: false, error: regData.error || "Register failed" };
        }

        //step2 get the token automatically after successful registration
        const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const loginData = await loginRes.json().catch(() => ({}));

        if (!loginRes.ok) {
            return {
                ok: false,
                error:
                    loginData.error ||
                    "Registered successfully, but auto login failed. Please log in manually.",
            };
        }

        // store user and token thru existing persistAuth
        persistAuth({
            nextUser: loginData.user || { username },
            token: loginData.accessToken,
        });
        return { ok: true };

        } catch (e) {
            return { ok: false, error: e.message || "Register failed" };
        }
    }

    // Login: validate credentials
    async function login({ email, password }) {
    const username = (email || "").trim();
        if (!username || !password) {
          return { ok: false, error: "email and password are required" };
        }
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                return { ok: false, error: data.error || "Invalid credentials" };
            }
            persistAuth({ nextUser: data.user || { username }, token: data.accessToken });
            return { ok: true };
        } catch (e) {
            return { ok: false, error: e.message || "Login failed" };
        }
    }
    
    function logout() {
        persistAuth({ nextUser: null, token: null });
        return { ok: true };
    }

      // PUT /api/auth/email(requires Bearer token)
    async function updateEmail(newEmail) {
        if (!newEmail || typeof newEmail !== "string") {
            return { ok: false, error: "newEmail is required" };
        }
        try {
            const res = await fetchWithAuth("/api/auth/email", {
                method: "PUT",
                body: JSON.stringify({ newEmail }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                return { ok: false, error: data.error || "Update email failed" };
            }
            persistAuth({ nextUser: data.user, token: data.accessToken });
            return { ok: true };
        } catch (e) {
            return { ok: false, error: e.message || "Update email failed" };
        }
    }

    //PUT /api/auth/password(require Bearer token)
    async function updatePassword(oldPassword, newPassword) {
        if (!oldPassword || !newPassword) {
            return { ok: false, error: "oldPassword and newPassword are required" };
        }
        try {
            const res = await fetchWithAuth("/api/auth/password", {
                method: "PUT",
                body: JSON.stringify({ oldPassword, newPassword }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                return { ok: false, error: data.error || "Update password failed" };
            }

            persistAuth({ nextUser: data.user, token: data.accessToken });
            return { ok: true };
        } catch (e) {
            return { ok: false, error: e.message || "Update password failed" };
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                isAuthenticated,
                register,
                login,
                logout,
                updateEmail,
                updatePassword,
                getAuthHeaders,
                fetchWithAuth,
            }}>
            {children}
        </AuthContext.Provider>
    );
}

// hook for convenience
export function useAuth() {
    return useContext(AuthContext);
}