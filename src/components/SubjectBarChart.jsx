import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from 'recharts';
import './SubjectBarChart.css';

const COLORS = {
  mean:   '#054a29',
  median: '#137547',
  mode:   '#3fa34d',
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="tooltip-row">
          <span className="tooltip-dot" style={{ background: p.fill }} />
          <span style={{ color: p.fill, fontWeight: 600 }}>{p.name}:</span>
          <span>{p.value === null ? 'N/A' : p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function SubjectBarChart({ data }) {
  const chartData = data.map((d) => ({
    course: d.course.length > 10 ? d.course.slice(0, 10) + '…' : d.course,
    fullName: d.course,
    Mean: d.mean,
    Median: d.median,
    Mode: d.mode ? d.mode[0] : null,
  }));

  return (
    <div className="bar-chart-wrap card fade-up" style={{ animationDelay: '0.1s' }}>
      <div className="chart-header">
        <div className="section-title">
          <span className="icon-wrap" style={{ background: 'var(--accent-1-soft)' }}>📊</span>
          Mean · Median · Mode per Course
        </div>
        <div className="legend-pills">
          {Object.entries(COLORS).map(([k, c]) => (
            <span key={k} className="legend-pill" style={{ '--pill-color': c }}>
              <span className="pill-dot" />
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </span>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="course"
            tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--font-body)' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-body)' }}
            axisLine={false}
            tickLine={false}
            domain={[0, 'auto']}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--accent-1-soft)', radius: 4 }} />
          <Bar dataKey="Mean"   fill={COLORS.mean}   radius={[6,6,0,0]} maxBarSize={32} isAnimationActive animationDuration={800} />
          <Bar dataKey="Median" fill={COLORS.median} radius={[6,6,0,0]} maxBarSize={32} isAnimationActive animationDuration={900} />
          <Bar dataKey="Mode"   fill={COLORS.mode}   radius={[6,6,0,0]} maxBarSize={32} isAnimationActive animationDuration={1000} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
