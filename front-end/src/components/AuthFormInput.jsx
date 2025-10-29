/**
 * 
 * 
 */
import React from "react";

export default function AuthFormInput({
    label,
    type = "text",
    name,
    value,
    onChange,
    placeholder,
    error
}) {
    return (
        <div className="flex flex-col">
            <label className="tp-label mb-2" htmlFor={name}>
                {label}
            </label>

            <input
                className="tp-input"
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete="off"
            />
            {error ? <p className="tp-error">{error}</p> : null}
        </div>
    );
}