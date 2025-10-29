import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthFormInput from "../components/AuthFormInput.jsx";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });
    const [errorMsg, setErrorMsg] = useState("");

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    function handleSubmit(e) {
        e.preventDefault();

        const result = login({
            email: form.email,
            password: form.password
        });

        if (result.ok) {
            navigate("/home");
        } else {
            setErrorMsg(result.error || "Login failed.");
        }
    }

    return (
        <section className="max-w-md mx-auto">
            <div className="tp-card p-8 flex flex-col gap-6">
                <div className="flex flex-col gap-2 text-center">
                    <h1 className="text-2xl font-semibold text-black">
                        Login
                    </h1>
                </div>

                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                    <AuthFormInput
                        label="Email"
                        type="email"
                        name="email"
                        placeholder="example@nyu.edu"
                        value={form.email}
                        onChange={handleChange}
                    />

                    <AuthFormInput
                        label="Password"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                    />

                    {errorMsg && (
                        <div className="tp-error text-center">{errorMsg}</div>
                    )}

                    <button
                        type="submit"
                        className="tp-btn-primary w-full text-sm font-semibold">
                        Log In
                    </button>
                </form>
                
                <p className="text-center text-xs text-tp-text-dim">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="text-tp-accent hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </section>
    );
}