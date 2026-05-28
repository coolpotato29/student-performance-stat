import { useState, useEffect } from 'react';
import { BarChart2, ChevronRight, Search, X, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import SubjectDetail from './components/SubjectDetail';
import AdminPanel from './components/AdminPanel';
import { aggregateCourses } from './utils/statistics';
import './App.css';

export default function App() {
  const [courseData,     setCourseData]     = useState(null);
  const [fileName,       setFileName]       = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [search,         setSearch]         = useState('');
  const [loading,        setLoading]        = useState(true);

  /* ── Auto-load bundled CSV on mount ── */
  useEffect(() => {
    const csvUrl = `${import.meta.env.BASE_URL}cs_students.csv`;
    fetch(csvUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: ({ data, meta }) => {
            const fields = (meta.fields || []).filter((f) =>
              data.some((row) => !isNaN(parseFloat(row[f])) && row[f] !== '')
            );
            if (fields.length > 0) {
              setCourseData(aggregateCourses(data, fields));
              setFileName('cs_students.csv');
            }
            setLoading(false);
          },
          error: () => setLoading(false),
        });
      })
      .catch(() => setLoading(false));
  }, []);

  /* ── Admin override: upload a different CSV ── */
  function handleDataLoaded(rows, fields, name) {
    setCourseData(aggregateCourses(rows, fields));
    setFileName(name);
  }

  function handleClear() {
    // Reset to bundled CSV
    setLoading(true);
    setCourseData(null);
    setFileName('');
    setSelectedCourse(null);
    setSearch('');
    const csvUrl = `${import.meta.env.BASE_URL}cs_students.csv`;
    fetch(csvUrl)
      .then((r) => r.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: ({ data, meta }) => {
            const fields = (meta.fields || []).filter((f) =>
              data.some((row) => !isNaN(parseFloat(row[f])) && row[f] !== '')
            );
            if (fields.length > 0) {
              setCourseData(aggregateCourses(data, fields));
              setFileName('cs_students.csv');
            }
            setLoading(false);
          },
          error: () => setLoading(false),
        });
      })
      .catch(() => setLoading(false));
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
      {loading ? (
        <section className="hero-section fade-up">
          <div className="no-data-state">
            <div className="no-data-icon-wrap" style={{ animation: 'spin 1.2s linear infinite' }}>
              <Loader2 size={48} />
            </div>
            <h1 className="no-data-title">Loading Data…</h1>
            <p className="no-data-sub">Fetching course statistics, hang tight.</p>
          </div>
        </section>
      ) : !courseData ? (
        <section className="hero-section fade-up">
          <div className="no-data-state">
            <h1 className="no-data-title">No Data Available</h1>
            <p className="no-data-sub">Could not load course data. Contact your administrator.</p>
          </div>
        </section>
      ) : (
        <section className="dashboard fade-in">
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
