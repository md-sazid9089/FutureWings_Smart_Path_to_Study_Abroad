import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStyle,
} from "../api/notificationService";

/**
 * NotificationPoller Component
 * Handles polling for notifications and provides context/state for the app
 * Should be placed high in the component tree (App.jsx or Layout)
 */
export const NotificationPoller = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollingIntervalRef = useRef(null);
  const isMountedRef = useRef(true);

  // Fetch unread notifications
  const fetchNotifications = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      setIsLoading(true);
      const data = await fetchUnreadNotifications(10, 0);
      if (isMountedRef.current) {
        setNotifications(data);
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message);
        console.error("Failed to fetch notifications:", err);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Fetch unread count
  const fetchCount = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      const count = await getUnreadCount();
      if (isMountedRef.current) {
        setUnreadCount(count);
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, []);

  // Mark notification as read
  const handleMarkAsRead = useCallback(async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  // Mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }, []);

  // Delete notification
  const handleDeleteNotification = useCallback(async (notificationId) => {
    try {
      const success = await deleteNotification(notificationId);
      if (success) {
        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== notificationId)
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }, []);

  // Setup polling
  useEffect(() => {
    // Initial fetch
    fetchNotifications();
    fetchCount();

    // Poll every 30 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchNotifications();
      fetchCount();
    }, 30000); // 30 seconds

    return () => {
      isMountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchNotifications, fetchCount]);

  const value = {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification,
    refetch: fetchNotifications,
    refetchCount: fetchCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Create Notification Context
 */
export const NotificationContext = React.createContext();

/**
 * Hook to use notification context
 */
export const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationPoller component"
    );
  }
  return context;
};

/**
 * NotificationBadge Component
 * Shows unread count badge for navbar
 */
export const NotificationBadge = ({ className = "" }) => {
  const { unreadCount } = useNotifications();

  if (unreadCount === 0) return null;

  return (
    <span
      className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full ${className}`}
    >
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  );
};

/**
 * NotificationItem Component
 * Individual notification display
 */
export const NotificationItem = ({ notification, onRead, onDelete }) => {
  const style = getNotificationStyle(notification.type);

  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <div
      className={`p-4 border-l-4 rounded cursor-pointer hover:shadow-md transition ${
        style.bgColor
      } ${style.borderColor} ${!notification.read ? "font-semibold" : ""}`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{style.icon}</span>
            <h4 className={style.textColor}>{notification.title}</h4>
            {!notification.read && (
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </div>
          <p className={`text-sm ${style.textColor} mt-1`}>
            {notification.message}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="text-gray-400 hover:text-gray-600 ml-2"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

/**
 * NotificationDropdown Component
 * Dropdown menu for notifications in navbar
 */
export const NotificationDropdown = ({ isOpen, onClose }) => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isLoading,
  } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between items-center rounded-t-lg">
        <h3 className="font-bold text-lg">Notifications</h3>
        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm hover:bg-blue-700 px-2 py-1 rounded transition"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Content */}
      <div className="divide-y">
        {isLoading && (
          <div className="p-4 text-center text-gray-500">
            <p>Loading...</p>
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">✨ No notifications</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        )}

        {!isLoading &&
          notifications.map((notification) => (
            <div key={notification.id} className="p-3 hover:bg-gray-50">
              <NotificationItem
                notification={notification}
                onRead={markAsRead}
                onDelete={deleteNotification}
              />
            </div>
          ))}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="sticky bottom-0 bg-gray-50 p-3 rounded-b-lg border-t">
          <a
            href="/notifications"
            onClick={onClose}
            className="text-center block text-blue-600 hover:text-blue-800 font-medium text-sm py-2"
          >
            View all notifications →
          </a>
        </div>
      )}
    </div>
  );
};

/**
 * NotificationCenter Component
 * Full-page notification center
 */
export const NotificationCenter = () => {
  const {
    notifications,
    isLoading,
    markAsRead,
    deleteNotification,
    markAllAsRead,
  } = useNotifications();
  const [filter, setFilter] = useState("all");

  const types = [
    { id: "all", label: "All", icon: "📬" },
    { id: "subscription", label: "Subscriptions", icon: "💳" },
    { id: "visa", label: "Visa", icon: "📋" },
    { id: "ai", label: "AI", icon: "🤖" },
    { id: "recommendation", label: "Recommendations", icon: "⭐" },
    { id: "application", label: "Applications", icon: "📄" },
    { id: "admin-update", label: "Updates", icon: "⚙️" },
  ];

  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === filter);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">
            {notifications.length} unread notification
            {notifications.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {types.map((type) => (
            <button
              key={type.id}
              onClick={() => setFilter(type.id)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === type.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <span className="mr-2">{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>

        {/* Action Button */}
        {notifications.length > 0 && (
          <div className="mb-6">
            <button
              onClick={markAllAsRead}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {isLoading && (
            <div className="text-center py-12 text-gray-500">
              <p>Loading notifications...</p>
            </div>
          )}

          {!isLoading && filteredNotifications.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-2xl mb-2">✨</p>
              <p className="text-gray-600">No notifications in this category</p>
            </div>
          )}

          {!isLoading &&
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition"
              >
                <NotificationItem
                  notification={notification}
                  onRead={markAsRead}
                  onDelete={deleteNotification}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default {
  NotificationPoller,
  NotificationBadge,
  NotificationItem,
  NotificationDropdown,
  NotificationCenter,
  useNotifications,
};
