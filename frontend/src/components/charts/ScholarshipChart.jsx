import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-2xl p-4 shadow-xl border border-white/50 min-w-52">
      <p className="font-bold text-text text-base mb-2">{label}</p>
      <div className="space-y-1 text-sm">
        {payload.map((entry) => (
          <div key={entry.name} className="flex justify-between gap-6">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
              <span className="text-text-muted">{entry.name}</span>
            </div>
            <span className="font-semibold text-text">
              {entry.name === 'Avg Cost (USD)'
                ? `$${Number(entry.value).toLocaleString()}`
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * ScholarshipChart — dual-axis composed chart (bars = scholarships, line = avg cost)
 * Props:
 *   data — array of { country, scholarships, avgCost, ... }
 */
export default function ScholarshipChart({ data = [] }) {
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 8 }} barCategoryGap="28%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
          <XAxis
            dataKey="country"
            tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          {/* Left Y-axis: scholarships */}
          <YAxis
            yAxisId="left"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={40}
            label={{ value: 'Scholarships', angle: -90, position: 'insideLeft', offset: 10, style: { fill: '#6b7280', fontSize: 11 } }}
          />
          {/* Right Y-axis: avg cost */}
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={60}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            label={{ value: 'Avg Cost (USD)', angle: 90, position: 'insideRight', offset: 10, style: { fill: '#6b7280', fontSize: 11 } }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.06)', radius: 8 }} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
            formatter={(value) => <span style={{ color: '#6b7280' }}>{value}</span>}
          />
          <Bar
            yAxisId="left"
            dataKey="scholarships"
            name="Scholarships Available"
            fill="#3b82f6"
            radius={[8, 8, 0, 0]}
            maxBarSize={52}
            isAnimationActive
            animationDuration={900}
            animationEasing="ease-out"
            fillOpacity={0.85}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="avgCost"
            name="Avg Cost (USD)"
            stroke="#ff6b3d"
            strokeWidth={2.5}
            dot={{ fill: '#ff6b3d', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
            isAnimationActive
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
