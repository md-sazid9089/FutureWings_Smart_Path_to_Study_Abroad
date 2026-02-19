export default function StatusBadge({ status }) {
  const colorMap = {
    Pending: '#f59e0b',
    Processing: '#3b82f6',
    Accepted: '#10b981',
    Rejected: '#ef4444',
    Verified: '#10b981',
    Approved: '#10b981',
    Denied: '#ef4444',
  };

  const color = colorMap[status] || '#6b7280';

  return (
    <span
      className="status-badge"
      style={{ backgroundColor: color }}
    >
      {status || 'Unknown'}
    </span>
  );
}
