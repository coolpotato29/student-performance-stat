import { useState, useEffect } from 'react';
import { X, TrendingUp, BarChart2, AreaChart, GraduationCap } from 'lucide-react';
import StatCard from './StatCard';
import DistributionChart from './DistributionChart';
import { gradeStudents } from '../utils/statistics';
import './SubjectDetail.css';

/* ── Grade Cutoff Chart ───────────────────────────────────── */
function GradeCutoffChart({ scores }) {
  const grades = gradeStudents(scores);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  // Scale bar relative to actual score range for better visual spread
  const scale = (val) => Math.min(100, Math.max(0, ((val - minScore) / (maxScore - minScore)) * 100));

  return (
    <div className="grade-cutoff-wrap">
      <p className="grade-cutoff-heading">Marks required to achieve each grade</p>

      <div className="grade-cutoff-list">
        {grades.map((g) => {
          const lo = g.lowerBound ?? minScore;
          const hi = g.upperBound ?? maxScore;
          const left  = scale(lo);
          const width = Math.max(scale(hi) - scale(lo), 4); // min 4% width so thin bands stay visible

          return (
            <div key={g.grade} className="grade-row">
              {/* Grade badge */}
              <span className="grade-badge" style={{ '--gc': g.color }}>
                {g.grade}
              </span>

              {/* Label */}
              <span className="grade-row-label">{g.label}</span>

              {/* Range bar */}
              <div className="grade-bar-track">
                <div
                  className="grade-bar-fill"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    background: g.color,
                  }}
                />
              </div>

              {/* Score range text */}
              <span className="grade-row-range" style={{ color: g.color }}>
                {g.lowerBound === null
                  ? `< ${g.upperBound?.toFixed(1)}`
                  : g.upperBound === null
                    ? `≥ ${g.lowerBound.toFixed(1)}`
                    : `${g.lowerBound.toFixed(1)} – ${g.upperBound.toFixed(1)}`}
              </span>

              {/* Student count badge */}
              <span className="grade-row-count" style={{ '--gc': g.color }}>
                {g.count} <span className="grade-row-pct">({g.percent}%)</span>
              </span>
            </div>
          );
        })}
      </div>

      <p className="grade-scheme-note">
        Relative grading · μ = mean · σ = std dev &nbsp;|&nbsp;
        O≥μ+1.5σ &nbsp; A+≥μ+σ &nbsp; A≥μ+0.5σ &nbsp; B+≥μ &nbsp; B≥μ−0.5σ &nbsp; C≥μ−σ &nbsp; F&lt;μ−σ
      </p>
    </div>
  );
}

export default function SubjectDetail({ course, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      document.body.style.overflow = '';
    };
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) handleClose();
  }

  if (!course) return null;

  const range = course.max - course.min;
  const passRate = course.scores.filter(s => s >= 40).length;
  const passPercent = ((passRate / course.count) * 100).toFixed(0);
  const topPercent = ((course.scores.filter(s => s >= 75).length / course.count) * 100).toFixed(0);

  return (
    <div
      className={`detail-backdrop ${visible ? 'detail-backdrop--in' : ''}`}
      onClick={handleBackdropClick}
    >
      <div className={`detail-panel ${visible ? 'detail-panel--in' : ''}`}>
        {/* Header */}
        <div className="detail-header">
          <div className="detail-header-left">
            <div className="detail-course-pill">
              <BarChart2 size={16} />
              {course.course}
            </div>
            <p className="detail-sub">{course.count} students · Click outside to close</p>
          </div>
          <button className="detail-close-btn" onClick={handleClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="detail-body">
          {/* Stat Cards */}
          <div className="detail-stat-cards">
            <StatCard type="mean"   value={course.mean}   course={course.course} />
            <StatCard type="median" value={course.median} course={course.course} />
            <StatCard type="mode"   value={course.mode ? course.mode[0] : null} course={course.course} />
          </div>

          {/* Quick metrics */}
          <div className="detail-metrics-row">
            <div className="detail-metric">
              <span className="dm-label">Min Score</span>
              <span className="dm-val dm-val--low">{course.min}</span>
            </div>
            <div className="detail-metric">
              <span className="dm-label">Max Score</span>
              <span className="dm-val dm-val--high">{course.max}</span>
            </div>
            <div className="detail-metric">
              <span className="dm-label">Range</span>
              <span className="dm-val">{range}</span>
            </div>
            <div className="detail-metric">
              <span className="dm-label">Pass Rate (≥40)</span>
              <span className="dm-val dm-val--pass">{passPercent}%</span>
            </div>
            <div className="detail-metric">
              <span className="dm-label">Top Scorers (≥75)</span>
              <span className="dm-val dm-val--top">{topPercent}%</span>
            </div>
          </div>

          {/* Charts */}
          <div className="detail-charts-grid">
            {/* Score distribution */}
            <div className="detail-chart-card card">
              <p className="detail-chart-title">
                <AreaChart size={15} style={{ color: 'var(--accent-2)', flexShrink: 0 }} />
                Score Distribution
              </p>
              <DistributionChart data={[course]} singleMode />
            </div>

            {/* Grade cutoffs */}
            <div className="detail-chart-card card">
              <p className="detail-chart-title">
                <GraduationCap size={15} style={{ color: 'var(--accent-2)', flexShrink: 0 }} />
                Grade Cutoffs (Relative)
              </p>
              <GradeCutoffChart scores={course.scores} />
            </div>
          </div>

          {/* Mode detail */}
          {course.mode && (
            <div className="detail-mode-note card">
              <TrendingUp size={15} style={{ color: 'var(--accent-3)', flexShrink: 0 }} />
              <span>
                <strong style={{ color: 'var(--accent-3)' }}>Mode:</strong>{' '}
                The most frequent score(s) in <strong>{course.course}</strong> are{' '}
                <strong style={{ color: 'var(--accent-3)' }}>{course.modeDisplay}</strong>.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
