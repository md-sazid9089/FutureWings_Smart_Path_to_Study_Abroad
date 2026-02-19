const palette = {
  Pending:     'bg-amber-100 text-amber-700',
  Processing:  'bg-blue-100 text-blue-700',
  Accepted:    'bg-emerald-100 text-emerald-700',
  Verified:    'bg-emerald-100 text-emerald-700',
  Approved:    'bg-emerald-100 text-emerald-700',
  Rejected:    'bg-red-100 text-red-700',
  Denied:      'bg-red-100 text-red-700',
  Completed:   'bg-purple-100 text-purple-700',
};

export default function StatusPill({ status }) {
  const colors = palette[status] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold tracking-wide ${colors}`}>
      {status}
    </span>
  );
}
