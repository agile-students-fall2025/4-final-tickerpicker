// util: for validating register form

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function validate(form) {
    const newErr = {};
    const name = (form.name || "").trim();
    const email = (form.email || "").trim();
    const password = form.password || "";
    const confirmPassword = form.confirmPassword || "";

    if (!name) {
        newErr.name = "Name is required.";
    }
    if (!email) {
        newErr.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(email)) {
        newErr.email = "Please enter a valid email address.";
    }
    if (!password) {
        newErr.password = "Password is required.";
    } else if (!PASSWORD_REGEX.test(password)) {
        newErr.password =
            "At least 8 characters, with a letter, a number and a symbol.";
    }
    if (confirmPassword !== password) {
        newErr.confirmPassword = "Passwords do not match.";
    }
    return newErr;
}