export default function TextField({ label, id, error, className = '', ...props }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-secondary">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-4 py-2.5 rounded-xl text-sm
          bg-white/50 border transition-all duration-200
          placeholder:text-text-light
          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
          ${error ? 'border-danger/50 focus:ring-danger/30 focus:border-danger/50' : 'border-white/50'}
        `}
        {...props}
      />
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}
