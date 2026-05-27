import { useState, useEffect } from 'react';
import { BarChart2, ChevronRight, Search, X, Database } from 'lucide-react';
import StatCard from './components/StatCard';
import SubjectDetail from './components/SubjectDetail';
import AdminPanel from './components/AdminPanel';
import { aggregateCourses } from './utils/statistics';
import './App.css';

const LS_KEY_DATA     = 'grademetrics_courseData';
const LS_KEY_FILENAME = 'grademetrics_fileName';

export default function App() {
  const [courseData,      setCourseData]      = useState(null);
  const [fileName,        setFileName]        = useState('');
  const [selectedCourse,  setSelectedCourse]  = useState(null);
  const [search,          setSearch]          = useState('');

  /* ── Load persisted data on mount ── */
  useEffect(() => {
    try {
      const saved     = localStorage.getItem(LS_KEY_DATA);
      const savedName = localStorage.getItem(LS_KEY_FILENAME);
      if (saved) {
        setCourseData(JSON.parse(saved));
        setFileName(savedName || 'Loaded from storage');
      }
    } catch {
      // corrupted storage — ignore
    }
  }, []);

  /* ── Called by AdminPanel after CSV upload ── */
  function handleDataLoaded(rows, fields, name) {
    const aggregated = aggregateCourses(rows, fields);
    setCourseData(aggregated);
    setFileName(name);
    // Persist so regular users see it without uploading
    try {
      localStorage.setItem(LS_KEY_DATA,     JSON.stringify(aggregated));
      localStorage.setItem(LS_KEY_FILENAME, name);
    } catch {
      // storage full — skip
    }
  }

  /* ── Called by AdminPanel "Clear Data" ── */
  function handleClear() {
    setCourseData(null);
    setFileName('');
    setSelectedCourse(null);
    setSearch('');
    localStorage.removeItem(LS_KEY_DATA);
    localStorage.removeItem(LS_KEY_FILENAME);
  }

  const filteredCourses = courseData
    ? courseData.filter((d) =>
        d.course.toLowerCase().includes(search.toLowerCase().trim())
      )
    : [];

  return (
    <div className="app-wrapper">
      {/* ── Header ── */}
      <header className="app-header fade-in">
        <div className="app-logo">
          <BarChart2 size={28} />
          <span>GradeMetrics</span>
        </div>
        <div className="header-right" />
      </header>

      {/* ── Main content ── */}
      {!courseData ? (
        /* No data yet — friendly waiting state */
        <section className="hero-section fade-up">
          <div className="no-data-state">
            <div className="no-data-icon-wrap">
              <Database size={48} />
            </div>
            <h1 className="no-data-title">No Data Available</h1>
            <p className="no-data-sub">
              The admin hasn't uploaded any course data yet.<br />
              Check back later or contact your administrator.
            </p>
          </div>
        </section>
      ) : (
        <section className="dashboard fade-in">
          {/* Per-course tiles */}
          <div className="per-course-section">
            <div className="tiles-toolbar">
              <h3 className="sub-heading">Per-Course Breakdown</h3>
              <div className="search-box">
                <Search size={15} className="search-icon" />
                <input
                  id="course-search"
                  className="search-input"
                  type="text"
                  placeholder="Search courses…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoComplete="off"
                />
                {search && (
                  <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear search">
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {filteredCourses.length > 0 ? (
              <div className="course-tiles-grid">
                {filteredCourses.map((d, i) => (
                  <button
                    key={d.course}
                    className="course-tile fade-up"
                    style={{ animationDelay: `${i * 0.04}s` }}
                    onClick={() => setSelectedCourse(d)}
                    aria-label={`Open ${d.course} details`}
                  >
                    <div className="ct-header">
                      <span className="ct-name">{d.course}</span>
                      <ChevronRight size={16} className="ct-arrow" />
                    </div>
                    <div className="ct-stats">
                      <div className="ct-stat ct-stat--mean">
                        <span className="ct-stat-label">MEAN</span>
                        <span className="ct-stat-val">{d.mean}</span>
                      </div>
                      <div className="ct-stat ct-stat--median">
                        <span className="ct-stat-label">MEDIAN</span>
                        <span className="ct-stat-val">{d.median}</span>
                      </div>
                      <div className="ct-stat ct-stat--mode">
                        <span className="ct-stat-label">MODE</span>
                        <span className="ct-stat-val">{d.modeDisplay}</span>
                      </div>
                    </div>
                    <div className="ct-bar-track">
                      <div
                        className="ct-bar-fill"
                        style={{ width: `${Math.min((d.mean / 100) * 100, 100)}%` }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <Search size={28} className="no-results-icon" />
                <p>No courses match <strong>"{search}"</strong></p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Subject detail panel */}
      {selectedCourse && (
        <SubjectDetail
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}

      {/* ── Footer ── */}
      <footer className="app-footer">
        <span>GradeMetrics · Built with React + Recharts</span>
        <AdminPanel
          onDataLoaded={handleDataLoaded}
          onClear={handleClear}
          hasData={!!courseData}
          fileName={fileName}
        />
      </footer>
    </div>
  );
}
