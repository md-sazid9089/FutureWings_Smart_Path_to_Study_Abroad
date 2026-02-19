export default function GlassCard({ children, className = '', hover = true, ...props }) {
  return (
    <div
      className={`glass rounded-2xl p-6 transition-all duration-300 ${hover ? 'hover:shadow-lg hover:-translate-y-0.5' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
