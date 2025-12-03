import React, { useEffect, useState } from "react";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/notifications");
        if (!res.ok) throw new Error("Failed to fetch notifications");
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        const sorted = [...list].sort((a, b) => {
          const da = a.eventDate ? new Date(a.eventDate) : null;
          const db = b.eventDate ? new Date(b.eventDate) : null;
  
          // No event date then push to bottom (rare but possible)
          if (!da && !db) return 0;
          if (!da) return 1;
          if (!db) return -1;
          return da - db; // sort it soonest to farthest
        });
        setNotifications(sorted);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchNotifications();
  }, []);
  

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to update");

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const openNotification = (notification) => {
    setSelectedNotification(notification);
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
  };

  const closeNotification = () => {
    setSelectedNotification(null);
  };

  const hasNotifications =
    Array.isArray(notifications) && notifications.length > 0;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-10 pt-24 pb-10">
      
      {/* 🔹 TOP NOTIFICATIONS BAR */}
      <div className="tp-card p-4 mb-6 text-black flex items-center justify-between">
        <span className="font-medium text-sm">
          You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
        </span>

        {unreadCount > 0 && (
          <button
            className="tp-btn-primary text-xs px-3 py-1"
            onClick={() => {
              const firstUnread = notifications.find((n) => !n.isRead);
              if (firstUnread) openNotification(firstUnread);
            }}
          >
            View latest
          </button>
        )}
      </div>

      {/* PAGE HEADER */}
      <div className="tp-card p-6 mb-6 text-black">
        <h1 className="text-2xl font-semibold mb-1">Notifications</h1>
        <p className="text-sm text-tp-text-dim">
          Stay on top of upcoming earnings, dividends, and stock events.
        </p>
      </div>

      {/* LIST OF NOTIFICATIONS */}
      <div className="tp-card p-6 text-black">
        {loading ? (
          <p>Loading…</p>
        ) : !hasNotifications ? (
          <p>No notifications available.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((notif) => (
              <button
                key={notif._id}
                onClick={() => openNotification(notif)}
                className={`tp-card text-left px-4 py-3 hover:brightness-105 transition ${
                  notif.isRead ? "opacity-80" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{notif.symbol}</h3>
                  {!notif.isRead && (
                    <span className="w-2 h-2 bg-tp-accent rounded-full" />
                  )}
                </div>

                <p className="text-sm">{notif.message}</p>

                <small className="text-tp-text-dim text-xs">
                  {notif.createdAt
                    ? new Date(notif.createdAt).toLocaleDateString()
                    : ""}
                </small>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="tp-card p-6 max-w-md w-full text-black">
            <h2 className="text-xl font-semibold mb-2">
              {selectedNotification.symbol}
            </h2>
            <p className="mb-4">{selectedNotification.message}</p>

            <div className="text-xs text-tp-text-dim space-y-1 mb-4">
              {selectedNotification.eventDate && (
                <p>
                  Event:{" "}
                  {new Date(
                    selectedNotification.eventDate
                  ).toLocaleDateString()}
                </p>
              )}
              {typeof selectedNotification.amount === "number" && (
                <p>Dividend: ${selectedNotification.amount}</p>
              )}
            </div>

            <button
              onClick={closeNotification}
              className="tp-btn-white-outlined"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
