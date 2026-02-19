export default function GlassPanel({ children, className = '', ...props }) {
  return (
    <div className={`glass-strong rounded-3xl p-8 ${className}`} {...props}>
      {children}
    </div>
  );
}
