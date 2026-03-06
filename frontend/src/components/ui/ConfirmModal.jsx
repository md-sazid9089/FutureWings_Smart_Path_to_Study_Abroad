import Modal from './Modal';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

export default function ConfirmModal({ open, onClose, onConfirm, title, message, loading = false, danger = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title || 'Confirm Action'}>
      <p className="text-sm text-secondary mb-6">{message || 'Are you sure you want to proceed?'}</p>
      <div className="flex justify-end gap-3">
        <SecondaryButton onClick={onClose} disabled={loading}>Cancel</SecondaryButton>
        {danger ? (
          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full
              bg-danger text-white font-semibold text-sm
              shadow-[0_4px_16px_rgba(239,68,68,0.35)]
              hover:bg-red-600 active:scale-[0.97] transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        ) : (
          <PrimaryButton onClick={onConfirm} loading={loading}>Confirm</PrimaryButton>
        )}
      </div>
    </Modal>
  );
}
