// util: for validating register form

export default function validate(form) {
    const newErr = {};
    if (!form.name.trim()) {
        newErr.name = "Name is required.";
    }
    if (!form.email.trim()) {
        newErr.email = "Email is required.";
    }
    if (!form.password) {
        newErr.password = "Password is required.";
    } else if (form.password.length < 6) {
        newErr.password = "Use at least 6 characters.";
    }
    if (form.confirmPassword !== form.password) {
        newErr.confirmPassword = "Passwords do not match.";
    }
    return newErr;
}