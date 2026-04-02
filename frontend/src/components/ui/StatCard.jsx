export default function StatCard({ icon: Icon, label, value, color = 'text-primary' }) {
  return (
    <div className="glass rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/60 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-text">{value ?? '-'}</p>
        <p className="text-xs text-text-muted font-medium">{label}</p>
      </div>
    </div>
  );
}
