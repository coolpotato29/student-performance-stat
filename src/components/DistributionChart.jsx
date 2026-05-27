import { useState } from 'react';
import { TrendingDown } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import './DistributionChart.css';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="tooltip-label">Range: {label}</p>
      <div className="tooltip-row">
        <span className="tooltip-dot" style={{ background: '#2a9134' }} />
        <span style={{ color: '#2a9134', fontWeight: 600 }}>Students:</span>
        <span>{payload[0]?.value}</span>
      </div>
    </div>
  );
}

/** Find which distribution bucket a numeric value falls into. */
function getBucket(dist, value) {
  if (value == null || !dist?.length) return null;
  const match = dist.find(b => {
    const [lo, hi] = b.range.split('–').map(Number);
    return value >= lo && value < hi;
  });
  // If value equals the max, it lands in the last bucket
  return match?.range ?? dist[dist.length - 1]?.range ?? null;
}

/** Compact pill label rendered inside the chart at a ReferenceLine */
function RefLabel({ viewBox, text, color, yOffset = 4 }) {
  const { x, y } = viewBox;
  const pad = 4;
  const w = text.length * 6 + pad * 2;
  return (
    <g>
      <rect x={x + 3} y={y + yOffset} width={w} height={16} rx={4} fill={color} opacity={0.92} />
      <text x={x + 3 + w / 2} y={y + yOffset + 11} textAnchor="middle" fill="#fff" fontSize={9} fontWeight={700} fontFamily="Inter, sans-serif">
        {text}
      </text>
    </g>
  );
}

const MARKERS = [
  { key: 'mean',   label: (v) => `μ ${v}`,   color: '#054a29', yOffset: 4  },
  { key: 'median', label: (v) => `Md ${v}`,  color: '#137547', yOffset: 24 },
  { key: 'mode',   label: (v) => `Mo ${v}`,  color: '#3fa34d', yOffset: 44 },
];

export default function DistributionChart({ data, singleMode = false }) {
  const [selected, setSelected] = useState(data[0]?.course || '');
  const course = data.find((d) => d.course === selected);

  /* ── singleMode: compact panel inside SubjectDetail ── */
  if (singleMode) {
    const c = data[0];
    if (!c) return null;

    const modeVal = c.mode?.[0] ?? null;
    const markers = [
      { ...MARKERS[0], value: c.mean,   bucket: getBucket(c.distribution, c.mean)   },
      { ...MARKERS[1], value: c.median, bucket: getBucket(c.distribution, c.median) },
      { ...MARKERS[2], value: modeVal,  bucket: getBucket(c.distribution, modeVal)  },
    ].filter(m => m.bucket !== null && m.value != null);

    return (
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={c.distribution} margin={{ top: 8, right: 14, left: -14, bottom: 4 }}>
          <defs>
            <linearGradient id="distGradSingle" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#2a9134" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#2a9134" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="range" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />

          {markers.map(m => (
            <ReferenceLine
              key={m.key}
              x={m.bucket}
              stroke={m.color}
              strokeWidth={2}
              strokeDasharray="5 3"
              label={<RefLabel text={m.label(m.value)} color={m.color} yOffset={m.yOffset} />}
            />
          ))}

          <Area type="monotone" dataKey="count" stroke="#2a9134" strokeWidth={2} fill="url(#distGradSingle)"
            dot={{ fill: '#2a9134', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#2a9134', stroke: 'white', strokeWidth: 2 }}
            isAnimationActive animationDuration={700}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  /* ── Full mode: standalone card with course selector ── */
  return (
    <div className="dist-chart-wrap card fade-up" style={{ animationDelay: '0.2s' }}>
      <div className="chart-header">
        <div className="section-title">
          <span className="icon-wrap" style={{ background: 'var(--accent-2-soft)', display:'grid', placeItems:'center', color:'var(--accent-2)' }}>
            <TrendingDown size={16} />
          </span>
          Score Distribution
        </div>
        <select className="select-styled" value={selected} onChange={(e) => setSelected(e.target.value)}>
          {data.map((d) => (
            <option key={d.course} value={d.course}>{d.course}</option>
          ))}
        </select>
      </div>

      {course && (() => {
        const modeVal = course.mode?.[0] ?? null;
        const markers = [
          { ...MARKERS[0], value: course.mean,   bucket: getBucket(course.distribution, course.mean)   },
          { ...MARKERS[1], value: course.median, bucket: getBucket(course.distribution, course.median) },
          { ...MARKERS[2], value: modeVal,       bucket: getBucket(course.distribution, modeVal)       },
        ].filter(m => m.bucket !== null && m.value != null);

        return (
          <>
            <div className="dist-stats-row">
              <span className="dist-stat" style={{ '--c': '#054a29' }}>
                <span className="dist-stat__label">μ Mean</span>
                <span className="dist-stat__val">{course.mean}</span>
              </span>
              <span className="dist-stat" style={{ '--c': '#137547' }}>
                <span className="dist-stat__label">Md Median</span>
                <span className="dist-stat__val">{course.median}</span>
              </span>
              <span className="dist-stat" style={{ '--c': '#3fa34d' }}>
                <span className="dist-stat__label">Mo Mode</span>
                <span className="dist-stat__val">{modeVal ?? 'N/A'}</span>
              </span>
              <span className="dist-stat" style={{ '--c': '#6b7280' }}>
                <span className="dist-stat__label">n</span>
                <span className="dist-stat__val">{course.count}</span>
              </span>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={course.distribution} margin={{ top: 14, right: 20, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2a9134" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2a9134" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="range" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />

                {markers.map(m => (
                  <ReferenceLine
                    key={m.key}
                    x={m.bucket}
                    stroke={m.color}
                    strokeWidth={2}
                    strokeDasharray="5 3"
                    label={<RefLabel text={m.label(m.value)} color={m.color} yOffset={m.yOffset} />}
                  />
                ))}

                <Area type="monotone" dataKey="count" stroke="#2a9134" strokeWidth={2.5} fill="url(#distGrad)"
                  dot={{ fill: '#2a9134', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#2a9134', stroke: 'white', strokeWidth: 2 }}
                  isAnimationActive animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </>
        );
      })()}
    </div>
  );
}
