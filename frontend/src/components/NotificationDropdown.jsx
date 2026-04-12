import { HiOutlineBell, HiOutlineXMark, HiOutlineCheckCircle } from 'react-icons/hi2';
import toast from 'react-hot-toast';

/**
 * NotificationDropdown Component
 * Displays list of unread notifications with action buttons
 */
export default function NotificationDropdown({
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  isOpen = false,
  isLoading = false,
}) {
  const handleMarkAsRead = async (e, notificationId) => {
    e.stopPropagation();
    const success = await onMarkAsRead(notificationId);
    if (success) {
      toast.success('Marked as read');
    }
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    const success = await onDelete(notificationId);
    if (success) {
      toast.success('Notification deleted');
    }
  };

  const handleMarkAllAsRead = async () => {
    const success = await onMarkAllAsRead();
    if (success) {
      toast.success('All marked as read');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 glass-strong rounded-2xl shadow-xl border border-white/20 z-50">
      {/* Header */}
      <div className="border-b border-white/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiOutlineBell className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-sm text-text">
            Notifications {notifications.length > 0 && `(${notifications.length})`}
          </h3>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="px-4 py-8 text-center text-text-muted text-sm">
            <div className="inline-block animate-spin">
              <HiOutlineBell className="w-5 h-5" />
            </div>
            <p className="mt-2">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <HiOutlineBell className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
            <p className="text-sm text-text-muted">No new notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-white/20">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="px-4 py-3 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-text line-clamp-1">
                      {notif.title}
                    </h4>
                    <p className="text-xs text-text-muted line-clamp-2 mt-0.5">
                      {notif.message}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, notif.id)}
                    className="p-1 rounded hover:bg-white/20 transition-colors text-text-muted hover:text-danger"
                    title="Delete notification"
                  >
                    <HiOutlineXMark className="w-4 h-4" />
                  </button>
                </div>

                {/* Timestamp and type */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 text-[10px] text-text-muted">
                    <span className="capitalize px-2 py-1 rounded-full bg-white/20">
                      {notif.type}
                    </span>
                    <span>
                      {notif.createdAt
                        ? new Date(notif.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Just now'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleMarkAsRead(e, notif.id)}
                    className="p-1 rounded hover:bg-white/20 transition-colors text-text-muted hover:text-primary"
                    title="Mark as read"
                  >
                    <HiOutlineCheckCircle className="w-4 h-4" />
                  </button>
                </div>

                {/* Link (if available) */}
                {notif.link && (
                  <a
                    href={notif.link}
                    className="text-xs text-primary hover:text-primary-dark mt-2 block font-medium hover:underline"
                  >
                    View Details →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-white/20 px-4 py-2 text-center">
          <a href="/notifications" className="text-xs font-medium text-primary hover:text-primary-dark transition-colors">
            View All Notifications
          </a>
        </div>
      )}
    </div>
  );
}
