import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COUNTRY_COLORS = {
  Canada:    '#ff6b3d',
  Germany:   '#3b82f6',
  Australia: '#10b981',
  UK:        '#8b5cf6',
  USA:       '#f59e0b',
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-2xl p-4 shadow-xl border border-white/50 min-w-44">
      <p className="font-bold text-text text-sm mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
              <span className="text-text-muted">{entry.dataKey}</span>
            </div>
            <span className="font-semibold text-text">{entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomLegend({ lines, hidden, onToggle }) {
  return (
    <div className="flex flex-wrap gap-3 justify-center mt-2">
      {lines.map(({ key, color, label }) => (
        <button
          key={key}
          onClick={() => onToggle(key)}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
            hidden.includes(key)
              ? 'opacity-40 bg-white/30 border-white/30 text-text-muted'
              : 'bg-white/60 border-white/50 text-text font-medium'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
          {label || key}
        </button>
      ))}
    </div>
  );
}

/**
 * TrendLineChart - multi-line chart with clickable legend to toggle lines
 * Props:
 *   data   - array of { year, [countryKey]: value, ... }
 *   lines  - array of { key, color, label }
 */
export default function TrendLineChart({ data = [], lines = [] }) {
  const [hidden, setHidden] = useState([]);

  const toggleLine = (key) => {
    setHidden((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const visibleLines = lines.filter(({ key }) => !hidden.includes(key));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          <XAxis
            dataKey="year"
            tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[35, 90]}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            width={42}
          />
          <Tooltip content={<CustomTooltip />} />
          {visibleLines.map(({ key, color }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              strokeWidth={2.5}
              dot={{ fill: color, r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              isAnimationActive
              animationDuration={1000}
              animationEasing="ease-out"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <CustomLegend lines={lines} hidden={hidden} onToggle={toggleLine} />
    </div>
  );
}
