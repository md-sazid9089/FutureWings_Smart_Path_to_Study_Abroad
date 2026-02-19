export function SectionTitle({ children, className = '' }) {
  return (
    <h2 className={`text-xl font-bold text-text ${className}`}>
      {children}
    </h2>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-text">{title}</h1>
        {subtitle && <p className="mt-1 text-text-muted text-sm">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
