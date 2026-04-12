import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchUnreadNotifications, markAsRead } from '../api/notificationService';
import axios from '../api/axios';

/**
 * useNotificationPoller
 * Custom hook to manage polling-based notifications
 * Polls the backend every 30 seconds for new unread notifications
 * 
 * @param {number} pollingInterval - Interval in milliseconds (default: 30000 = 30 seconds)
 * @returns {Object} - { notifications, unreadCount, markAsRead, loading, error }
 */
export const useNotificationPoller = (pollingInterval = 30000) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Use ref to track polling interval ID
  const pollingIntervalRef = useRef(null);
  const isPollingRef = useRef(true);

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Make API call to get unread notifications
      const response = await axios.get('/api/notifications', {
        params: {
          limit: 100,
          offset: 0,
          read: false, // Only get unread
        },
      });

      if (response.data?.data?.notifications) {
        setNotifications(response.data.data.notifications);
        setUnreadCount(response.data.data.total || response.data.data.notifications.length);
      }
    } catch (err) {
      // Only log and set error if not "No token" or auth errors on component unmount
      if (isPollingRef.current) {
        console.error('Error fetching notifications:', err);
        // Don't show auth errors to user - they'll be redirected
        if (err.response?.status !== 401) {
          setError(err.message);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      await axios.post(`/api/notifications/${notificationId}/read`);
      
      // Remove from local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await axios.post('/api/notifications/mark-all/read');
      setNotifications([]);
      setUnreadCount(0);
      return true;
    } catch (err) {
      console.error('Error marking all as read:', err);
      return false;
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
      return true;
    } catch (err) {
      console.error('Error deleting notification:', err);
      return false;
    }
  }, []);

  // Set up polling on mount
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      return; // Don't start polling if not authenticated
    }

    // Initial fetch
    fetchNotifications();

    // Set up polling interval
    pollingIntervalRef.current = setInterval(() => {
      if (isPollingRef.current) {
        fetchNotifications();
      }
    }, pollingInterval);

    // Report polling started
    console.log('🔔 Notification polling started (interval: ' + pollingInterval + 'ms)');

    // Cleanup on unmount
    return () => {
      isPollingRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        console.log('🔔 Notification polling stopped');
      }
    };
  }, [pollingInterval, fetchNotifications]);

  // Resume polling when user returns to tab (visibility change)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPollingRef.current = false;
        console.log('🔔 Polling paused (tab hidden)');
      } else {
        isPollingRef.current = true;
        // Fetch immediately when tab becomes visible
        fetchNotifications();
        console.log('🔔 Polling resumed (tab visible)');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    markAsRead: markNotificationAsRead,
    markAllAsRead,
    deleteNotification,
    loading,
    error,
    refreshNotifications: fetchNotifications,
  };
};

export default useNotificationPoller;
