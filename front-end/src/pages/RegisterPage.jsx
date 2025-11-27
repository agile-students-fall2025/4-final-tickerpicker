import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthFormInput from "../components/AuthFormInput.jsx";
import validateForm from "../utils/validateForm.js";

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [errors, setErrors] = useState({});
    const [submitErr, setSubmitErr] = useState("");

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const newErr = validateForm(form);
        setErrors(newErr);

        if (Object.keys(newErr).length > 0) return;

        const result = await register({
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password
        });

        if (result.ok) {
            navigate("/Home");
        } else {
            setSubmitErr(result.error || "Registration failed.");
        }
    }

    return (
        <section className="max-w-md mx-auto w-full px-4">
            <div className="tp-card p-4 md:p-8 flex flex-col gap-4 md:gap-6">
                <div className="flex flex-col gap-2 text-center">
                    <h1 className="text-2xl font-semibold text-black">
                        REGISTER
                    </h1>
                </div>

                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                    <AuthFormInput
                        label="Username:"
                        name="name"
                        placeholder="Your Name"
                        value={form.name}
                        onChange={handleChange}
                        error={errors.name}
                    />
                
                
                    <AuthFormInput
                        label="Email:"
                        type="email"
                        name="email"
                        placeholder="example@nyu.edu"
                        value={form.email}
                        onChange={handleChange}
                        error={errors.email}
                    />

                    <AuthFormInput
                        label="Password:"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        error={errors.password}
                    />

                    <AuthFormInput
                        label="Confirm Password:"
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                    />

                    {submitErr && (
                      <div className="tp-error text-center">{submitErr}</div>
                    )}

                    <button
                        type="submit"
                        className="tp-btn-primary w-full text-sm font-semibold">
                        Register
                    </button>
                </form>
                
                <div className="flex flex-col justify-center items-center space-y-4">
                    <p className="text-center text-xs text-tp-text-dim">
                        ----------------- OR -----------------
                    </p>

                    <p className="text-center text-xs text-tp-text-dim">
                        {" "}
                        <Link
                            to="/login"
                            className="text-tp-text-dim underline hover:text-tp-accent">
                            SIGN IN
                        </Link>
                    </p>
                </div>
                
            </div>
        </section>
    );
}