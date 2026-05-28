/**
 * statistics.js
 * Core statistical computation utilities for student performance data.
 */

/**
 * Compute arithmetic mean of an array of numbers.
 * @param {number[]} values
 * @returns {number}
 */
export function computeMean(values) {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return parseFloat((sum / values.length).toFixed(2));
}

/**
 * Compute median of an array of numbers.
 * @param {number[]} values
 * @returns {number}
 */
export function computeMedian(values) {
  if (!values || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return parseFloat(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
  }
  return sorted[mid];
}

/**
 * Compute mode(s) of an array of numbers.
 * Returns the most frequent value(s), or null if all values are unique.
 * @param {number[]} values
 * @returns {number[]|null}
 */
export function computeMode(values) {
  if (!values || values.length === 0) return null;
  const freq = {};
  values.forEach((v) => {
    freq[v] = (freq[v] || 0) + 1;
  });
  const maxFreq = Math.max(...Object.values(freq));
  // If every value appears exactly once, there is no meaningful mode
  if (maxFreq === 1) return null;
  return Object.entries(freq)
    .filter(([, count]) => count === maxFreq)
    .map(([val]) => parseFloat(val))
    .sort((a, b) => a - b);
}

/**
 * Build a score distribution (histogram buckets) for a set of scores.
 * @param {number[]} scores
 * @param {number} bucketSize  Width of each bucket (default 10)
 * @returns {{ range: string, count: number }[]}
 */
export function buildDistribution(scores, bucketSize = 10) {
  if (!scores || scores.length === 0) return [];
  const min = Math.floor(Math.min(...scores) / bucketSize) * bucketSize;
  const max = Math.ceil(Math.max(...scores) / bucketSize) * bucketSize;
  const buckets = [];
  for (let start = min; start < max; start += bucketSize) {
    const end = start + bucketSize;
    buckets.push({
      range: `${start}–${end}`,
      count: scores.filter((s) => s >= start && s < end).length,
    });
  }
  // Include max value in last bucket
  if (buckets.length > 0) {
    const last = buckets[buckets.length - 1];
    const extras = scores.filter((s) => s === max);
    last.count += extras.length;
  }
  return buckets;
}

/**
 * Parse CSV text (already converted by PapaParse) into per-course data.
 * Expects: columns = course names, rows = student scores (all numeric).
 * @param {Object[]} rows   Array of row objects from PapaParse
 * @param {string[]} fields Column names
 * @returns {CourseData[]}
 */
export function aggregateCourses(rows, fields) {
  return fields.map((course) => {
    const scores = rows
      .map((row) => parseFloat(row[course]))
      .filter((v) => !isNaN(v));

    const mode = computeMode(scores);
    return {
      course,
      scores,
      count: scores.length,
      mean: computeMean(scores),
      median: computeMedian(scores),
      mode,
      modeDisplay: mode === null ? "N/A" : mode.join(", "),
      min: scores.length ? Math.min(...scores) : 0,
      max: scores.length ? Math.max(...scores) : 0,
      distribution: buildDistribution(scores),
    };
  });
}

/**
 * Relative grading scheme based on standard deviation bands from the mean.
 *
 * Thresholds (μ = mean, σ = std dev):
 *   A   (Excellent)     : score ≥ μ + 1.5σ
 *   A-  (Very Good)     : μ + 1.0σ ≤ score < μ + 1.5σ
 *   B   (Good)          : μ + 0.5σ ≤ score < μ + 1.0σ
 *   B-  (Above Average) : μ        ≤ score < μ + 0.5σ
 *   C   (Average)       : μ - 0.5σ ≤ score < μ
 *   C-  (Below Average) : μ - 1.0σ ≤ score < μ - 0.5σ
 *   D   (Poor)          : score    < μ - 1.0σ
 *
 * @param {number[]} scores
 * @returns {{ grade: string, label: string, count: number, cutoff: string, color: string }[]}
 */
export function gradeStudents(scores) {
  if (!scores || scores.length === 0) return [];

  const n = scores.length;
  const mean = scores.reduce((a, b) => a + b, 0) / n;
  const variance = scores.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  const sd = Math.sqrt(variance);

  const bands = [
    { grade: 'A',  label: 'Excellent',      cutoffVal: mean + 1.5 * sd, color: '#054a29' },
    { grade: 'A-', label: 'Very Good',       cutoffVal: mean + 1.0 * sd, color: '#137547' },
    { grade: 'B',  label: 'Good',            cutoffVal: mean + 0.5 * sd, color: '#2a9134' },
    { grade: 'B-', label: 'Above Average',   cutoffVal: mean,            color: '#3fa34d' },
    { grade: 'C',  label: 'Average',         cutoffVal: mean - 0.5 * sd, color: '#5bba6f' },
    { grade: 'C-', label: 'Below Average',   cutoffVal: mean - 1.0 * sd, color: '#85c99a' },
    { grade: 'D',  label: 'Poor',            cutoffVal: -Infinity,       color: '#bc4749' },
  ];

  const counts = Object.fromEntries(bands.map(b => [b.grade, 0]));
  scores.forEach(score => {
    for (const band of bands) {
      if (score >= band.cutoffVal) { counts[band.grade]++; break; }
    }
  });

  return bands.map((b, i) => ({
    grade:      b.grade,
    label:      b.label,
    count:      counts[b.grade],
    color:      b.color,
    percent:    ((counts[b.grade] / n) * 100).toFixed(1),
    lowerBound: b.cutoffVal === -Infinity ? null : b.cutoffVal,
    upperBound: i === 0 ? null : bands[i - 1].cutoffVal,   // exclusive upper edge
    cutoff:     b.cutoffVal === -Infinity
      ? `< ${bands[i - 1]?.cutoffVal.toFixed(1) ?? '—'}`
      : `≥ ${b.cutoffVal.toFixed(1)}`,
  }));
}
