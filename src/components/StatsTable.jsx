import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import './StatsTable.css';

const COLUMNS = [
  { key: 'course',  label: 'Course',  numeric: false },
  { key: 'count',   label: 'n',       numeric: true  },
  { key: 'mean',    label: 'Mean',    numeric: true  },
  { key: 'median',  label: 'Median',  numeric: true  },
  { key: 'mode',    label: 'Mode',    numeric: false },
  { key: 'min',     label: 'Min',     numeric: true  },
  { key: 'max',     label: 'Max',     numeric: true  },
];

function getModeDisplay(d) {
  return d.modeDisplay;
}

export default function StatsTable({ data }) {
  const [sortKey, setSortKey] = useState('course');
  const [sortDir, setSortDir] = useState('asc');

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = [...data].sort((a, b) => {
    let av = sortKey === 'mode' ? (a.mode ? a.mode[0] : -1) : a[sortKey];
    let bv = sortKey === 'mode' ? (b.mode ? b.mode[0] : -1) : b[sortKey];
    if (typeof av === 'string') av = av.toLowerCase();
    if (typeof bv === 'string') bv = bv.toLowerCase();
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  function SortIcon({ colKey }) {
    if (sortKey !== colKey) return <ArrowUpDown size={13} style={{ opacity: 0.35 }} />;
    return sortDir === 'asc'
      ? <ArrowUp size={13} style={{ color: 'var(--accent-1)' }} />
      : <ArrowDown size={13} style={{ color: 'var(--accent-1)' }} />;
  }

  function getPerformanceClass(val, min, max) {
    if (max === min) return '';
    const pct = (val - min) / (max - min);
    if (pct >= 0.75) return 'perf-high';
    if (pct >= 0.4)  return 'perf-mid';
    return 'perf-low';
  }

  const allMeans = data.map((d) => d.mean);
  const minM = Math.min(...allMeans);
  const maxM = Math.max(...allMeans);

  return (
    <div className="table-wrap card fade-up" style={{ animationDelay: '0.25s' }}>
      <div className="chart-header">
        <div className="section-title">
          <span className="icon-wrap" style={{ background: 'var(--accent-4)' + '20' }}>📋</span>
          Detailed Statistics Table
        </div>
        <span className="table-hint">Click column header to sort</span>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th key={col.key} onClick={() => handleSort(col.key)}>
                  <span className="th-inner">
                    {col.label}
                    <SortIcon colKey={col.key} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((d, i) => (
              <tr key={d.course} style={{ animationDelay: `${i * 0.04}s` }}>
                <td>
                  <span className="course-chip">{d.course}</span>
                </td>
                <td>{d.count}</td>
                <td>
                  <span className={`mean-badge ${getPerformanceClass(d.mean, minM, maxM)}`}>
                    {d.mean}
                  </span>
                </td>
                <td>{d.median}</td>
                <td>{getModeDisplay(d)}</td>
                <td>{d.min}</td>
                <td>{d.max}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
