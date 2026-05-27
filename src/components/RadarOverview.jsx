import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip,
} from 'recharts';
import './RadarOverview.css';

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="tooltip-label">{payload[0]?.payload?.course}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="tooltip-row">
          <span className="tooltip-dot" style={{ background: p.color }} />
          <span style={{ color: p.color, fontWeight: 600 }}>{p.name}:</span>
          <span>{p.value?.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
}

export default function RadarOverview({ data }) {
  // Normalize each value to 0–100 range based on global max
  const globalMax = Math.max(...data.flatMap((d) => [d.mean, d.median, d.mode?.[0] ?? 0]));
  const norm = (v) => globalMax > 0 ? parseFloat(((v / globalMax) * 100).toFixed(1)) : 0;

  const chartData = data.map((d) => ({
    course: d.course.length > 12 ? d.course.slice(0, 12) + '…' : d.course,
    Mean:   norm(d.mean),
    Median: norm(d.median),
    Mode:   d.mode ? norm(d.mode[0]) : 0,
  }));

  return (
    <div className="radar-wrap card fade-up" style={{ animationDelay: '0.15s' }}>
      <div className="chart-header">
        <div className="section-title">
          <span className="icon-wrap" style={{ background: 'var(--accent-3-soft)' }}>🕸️</span>
          Course Overview (Radar)
        </div>
        <span className="radar-note">Normalized 0–100</span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="course"
            tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar name="Mean"   dataKey="Mean"   stroke="#054a29" fill="#054a29" fillOpacity={0.18} strokeWidth={2} dot />
          <Radar name="Median" dataKey="Median" stroke="#137547" fill="#137547" fillOpacity={0.15} strokeWidth={2} dot />
          <Radar name="Mode"   dataKey="Mode"   stroke="#3fa34d" fill="#3fa34d" fillOpacity={0.12} strokeWidth={2} dot />
          <Legend
            wrapperStyle={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', paddingTop: '8px' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
