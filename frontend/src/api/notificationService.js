import axios from "./axios";

const API_BASE = "/api/notifications";

/**
 * Fetch unread notifications
 * @param {number} limit - Number of notifications to fetch
 * @param {number} offset - Pagination offset
 * @returns {Promise<Array>} Array of notifications
 */
export const fetchUnreadNotifications = async (limit = 10, offset = 0) => {
  try {
    const response = await axios.get(API_BASE, {
      params: {
        limit,
        offset,
        read: false,
      },
    });
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

/**
 * Fetch all notifications (read and unread)
 * @param {number} limit - Number of notifications to fetch
 * @param {number} offset - Pagination offset
 * @returns {Promise<Array>} Array of notifications
 */
export const fetchAllNotifications = async (limit = 20, offset = 0) => {
  try {
    const response = await axios.get(API_BASE, {
      params: {
        limit,
        offset,
      },
    });
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching all notifications:", error);
    return [];
  }
};

/**
 * Get count of unread notifications
 * @returns {Promise<number>} Unread notification count
 */
export const getUnreadCount = async () => {
  try {
    const response = await axios.get(`${API_BASE}/count`);
    return response.data.data?.count || 0;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }
};

/**
 * Get a specific notification
 * @param {number} notificationId - Notification ID
 * @returns {Promise<Object>} Notification object
 */
export const getNotification = async (notificationId) => {
  try {
    const response = await axios.get(`${API_BASE}/${notificationId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching notification:", error);
    return null;
  }
};

/**
 * Mark a notification as read
 * @param {number} notificationId - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
export const markAsRead = async (notificationId) => {
  try {
    const response = await axios.post(`${API_BASE}/${notificationId}/read`);
    return response.data.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return null;
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} Operation result
 */
export const markAllAsRead = async () => {
  try {
    const response = await axios.post(`${API_BASE}/mark-all/read`);
    return response.data.data;
  } catch (error) {
    console.error("Error marking all as read:", error);
    return null;
  }
};

/**
 * Delete a notification
 * @param {number} notificationId - Notification ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteNotification = async (notificationId) => {
  try {
    await axios.delete(`${API_BASE}/${notificationId}`);
    return true;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return false;
  }
};

/**
 * Clear all notifications
 * @returns {Promise<Object>} Operation result
 */
export const clearAllNotifications = async () => {
  try {
    const response = await axios.delete(`${API_BASE}/clear/all`);
    return response.data.data;
  } catch (error) {
    console.error("Error clearing notifications:", error);
    return null;
  }
};

/**
 * Filter notifications by type
 * @param {Array} notifications - Array of notifications
 * @param {string} type - Notification type to filter
 * @returns {Array} Filtered notifications
 */
export const filterByType = (notifications, type) => {
  return notifications.filter((notif) => notif.type === type);
};

/**
 * Get notification icon and color based on type
 * @param {string} type - Notification type
 * @returns {Object} Icon and color information
 */
export const getNotificationStyle = (type) => {
  const styles = {
    subscription: {
      icon: "💳",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-900",
      badgeColor: "bg-blue-500",
    },
    visa: {
      icon: "📋",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-900",
      badgeColor: "bg-green-500",
    },
    ai: {
      icon: "🤖",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-900",
      badgeColor: "bg-purple-500",
    },
    recommendation: {
      icon: "⭐",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-900",
      badgeColor: "bg-yellow-500",
    },
    application: {
      icon: "📄",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      textColor: "text-indigo-900",
      badgeColor: "bg-indigo-500",
    },
    "admin-update": {
      icon: "⚙️",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-900",
      badgeColor: "bg-red-500",
    },
  };

  return styles[type] || styles.subscription;
};

export default {
  fetchUnreadNotifications,
  fetchAllNotifications,
  getUnreadCount,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  filterByType,
  getNotificationStyle,
};
