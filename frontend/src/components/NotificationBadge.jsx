/**
 * NotificationBadge Component
 * Displays a badge showing unread notification count
 */

export default function NotificationBadge({ count = 0 }) {
  if (count === 0) return null;

  return (
    <div className="absolute -top-1 -right-1 w-5 h-5 bg-danger rounded-full flex items-center justify-center">
      <span className="text-[10px] font-bold text-white">
        {count > 9 ? '9+' : count}
      </span>
    </div>
  );
}
