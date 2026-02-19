export default function PrimaryButton({ children, className = '', loading = false, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full
        bg-primary text-white font-semibold text-sm
        shadow-[0_4px_16px_rgba(255,107,61,0.35)]
        hover:bg-primary-dark hover:shadow-[0_6px_24px_rgba(255,107,61,0.45)]
        active:scale-[0.97] transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
        ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
