import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProfilePage() {
    
    const {isAuthenticated, user, updateEmail, updatePassword } = useAuth()
    // email
    const [newEmail, setNewEmail] = useState("")
    const [newEmailMessage, setNewEmailMessage] = useState({ type: "", text: "" });

    // password
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

    // notif preference 
    const [emailPriceAlerts, setEmailPriceAlerts] = useState(false);
    const [textPriceAlerts, setTextPriceAlerts] = useState(false);


    const avatarUrl = `https://picsum.photos/seed/${user?.email || "guest"}/140/140`;

    // if (!isAuthenticated) {
    //     throw 
    // }

    if (!isAuthenticated) {
        console.log("Make sure the user is valid and authenticated when view profile")
        return;
    }

    async function onSubmitEmail(e) {
        e.preventDefault();
        setNewEmailMessage({ type: "", text: "" });
        const trimmedNewEmail = newEmail.trim();

        // if empty email address
        if (!trimmedNewEmail) {
            setNewEmailMessage({type: "err", text: "New email cannot be empty. Please enter a new email."})
            return;
        }

        const ok = await updateEmail?.(trimmedNewEmail);
        if (ok?.ok){
            setNewEmailMessage( {type: "ok", text: "Email updated successfully."})
            setNewEmail("")
        }else {
            setNewEmailMessage( {type: "err", text: ok?.error || "Fail to update email"} )
        }
    }

    async function onSubmitPassword(e) {
        e.preventDefault();
        setPasswordMessage({ type: "", text: "" });

        if(!oldPassword || !newPassword) {
            setPasswordMessage({ type: "err", text: "Please fill all password fields." });
            return;
        }
        if (newPassword.length < 6){
            setPasswordMessage({ type: "err", text: "Use at least 6 characters." });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: "err", text: "New passwords do not match." });
            return;
        }

        const ok = await updatePassword?.(oldPassword, newPassword);
        if (ok?.ok) {
            setPasswordMessage({ type: "ok", text: "Password changed." });
            setOldPassword(""); setNewPassword(""); setConfirmPassword("");
        } else {
            setPasswordMessage({ type: "err", text: ok?.error || "Failed to change password." });
        }
    }

    return (
        <section className="w-full grid grid-cols-12 gap-16">
        <div className="col-span-6 flex flex-col gap-10">
            <div className="flex items-start justify-between">
                
                <div className="flex items-center gap-6">
                    <img
                        src={avatarUrl}
                        alt="Profile"
                        className="w-28 h-28 rounded-full border border-tp-border object-cover"
                    />
                    
                    <div className="flex flex-col">
                        <h2 className="text-lg font-semibold text-black">
                            {user?.name || "User"}
                        </h2>
                        <p className="text-sm text-tp-text-dim">{user?.email}</p>
                    </div>
                </div>
            </div>

            <div className="tp-card flex flex-col gap-6 p-8">
                <h3 className="text-lg font-semibold text-black">Change Email</h3>
                <form className="flex flex-col gap-6" onSubmit={onSubmitEmail}>
                    <div>
                        <label className="tp-label pb-2" htmlFor="newEmail">New Email:</label>
                        <input
                            id="newEmail"
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="enter email here"
                            className="tp-input"
                            autoComplete="off"
                        />
                    </div>
                    {newEmailMessage.text && (
                        <p
                            className={newEmailMessage.type === "ok" ? "text-sm text-green-400" : "tp-error"}
                        >
                            {newEmailMessage.text}
                        </p>
                    )}
                    <button type="submit" className="tp-btn-primary w-32">Submit</button>
                </form>
            </div>

            <div className="tp-card flex flex-col gap-6 p-8">
                <h3 className="text-lg font-semibold text-black">Change Password</h3>
                <form className="flex flex-col gap-6" onSubmit={onSubmitPassword}>
                    <div>
                        <label className="tp-label pb-2" htmlFor="oldPassword">Old Password:</label>
                        <input
                            id="oldPassword"
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="enter old password"
                            className="tp-input"
                        />
                    </div>

                    <div>
                        <label className="tp-label pb-2" htmlFor="newPwd">New Password:</label>
                        <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="enter password here"
                            className="tp-input"
                        />
                    </div>

                    <div>
                        <label className="tp-label pb-2" htmlFor="confirmPwd">Confirm password:</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="re-enter your password here"
                            className="tp-input"
                        />
                    </div>

                    {passwordMessage.text && (
                        <p
                            className={passwordMessage.type === "ok" ? "text-sm text-green-400" : "tp-error"}
                        >
                            {passwordMessage.text}
                        </p>
                    )}
                    <button type="submit" className="tp-btn-primary w-32">Submit</button>
                </form>
            </div>
        </div>

        <div className="col-span-6 flex flex-col gap-8">

            <div className="tp-card p-6 min-h-[420px]">
                <h3 className="text-lg font-semibold text-black pb-4">Notifications</h3>
                <div className="text-sm text-black">
                    <ul className="space-y-3">
                        <li className="tp-card  p-4">Notification1</li>
                        <li className="tp-card p-4">Notification2</li>
                    </ul>
                </div>
            </div>


            <div className="tp-card p-8">
  <h3 className="text-lg font-semibold text-black pb-4">Notification preferences</h3>

  <div className="flex flex-col gap-4">




    {/* Email Updates Toggle */}
    <button
      type="button"
      onClick={() => setEmailPriceAlerts(!emailPriceAlerts)}
      className={`px-4 py-2 rounded-xl border text-sm transition ${
        emailPriceAlerts
          ? "bg-green-50 border-green-600 text-green-700"
        : "bg-red-50 border-red-400 text-red-700 hover:bg-red-100"
      }`}
    >
      {emailPriceAlerts ? "Email Price Updates: ON" : "Enable Email Price Updates OFF"}
    </button>

    {/* Text Updates Toggle */}
    <button
      type="button"
      onClick={() => setTextPriceAlerts(!textPriceAlerts)}
      className={`px-4 py-2 rounded-xl border text-sm transition ${
        textPriceAlerts
          ? "bg-green-50 border-green-600 text-green-700"
        : "bg-red-50 border-red-400 text-red-700 hover:bg-red-100"
      }`}
    >
      {textPriceAlerts ? "Text Price Updates: ON" : "Enable Text Price Updates OFF"}
    </button>
    

  </div>
</div>


            

        </div>
        </section>
    );
} // will update backend to actually send texts & emails