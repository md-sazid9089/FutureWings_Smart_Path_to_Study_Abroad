import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';

const TREND_COLORS = {
  up: '#10b981',     // emerald-500
  down: '#ef4444',   // red-500
  stable: '#94a3b8', // slate-400
};

const TREND_LABELS = {
  up: '↑ Rising acceptance',
  down: '↓ Declining acceptance',
  stable: '→ Stable acceptance',
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="glass-strong rounded-2xl p-4 shadow-xl border border-white/50 min-w-52">
      <p className="font-bold text-text text-base mb-2">{d?.country}</p>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between gap-6">
          <span className="text-text-muted">Acceptance Rate</span>
          <span className="font-semibold text-text">{d?.acceptance}%</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-text-muted">Scholarships</span>
          <span className="font-semibold text-text">{d?.scholarships?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-text-muted">Avg Cost / Year</span>
          <span className="font-semibold text-text">${d?.avgCost?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-text-muted">Trend</span>
          <span
            className="font-semibold"
            style={{ color: TREND_COLORS[d?.trend] }}
          >
            {d?.trend === 'up' ? '↑ Rising' : d?.trend === 'down' ? '↓ Declining' : '→ Stable'}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * CountryBarChart — reusable bar chart for country data
 * Props:
 *   data       — array of country objects
 *   xKey       — key for X-axis (e.g. 'country')
 *   yKey       — key for bar height (e.g. 'acceptance')
 *   colorKey   — key that determines bar color from TREND_COLORS (e.g. 'trend')
 */
export default function CountryBarChart({ data = [], xKey = 'country', yKey = 'acceptance', colorKey = 'trend' }) {
  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs">
        {Object.entries(TREND_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: TREND_COLORS[key] }}
            />
            <span className="text-text-muted">{label}</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }} barCategoryGap="28%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            width={42}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,107,61,0.06)', radius: 8 }} />
          <Bar dataKey={yKey} radius={[8, 8, 0, 0]} maxBarSize={56} isAnimationActive animationDuration={900} animationEasing="ease-out">
            {data.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={TREND_COLORS[entry[colorKey]] || '#94a3b8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
