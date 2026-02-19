import { HiOutlineInbox } from 'react-icons/hi2';

export default function EmptyState({ icon: Icon = HiOutlineInbox, title = 'Nothing here yet', message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="w-12 h-12 text-text-light mb-4" />
      <p className="text-lg font-semibold text-text-muted">{title}</p>
      {message && <p className="text-sm text-text-light mt-1 max-w-xs">{message}</p>}
    </div>
  );
}
