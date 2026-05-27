import { useEffect, useRef, useState } from 'react';
import './StatCard.css';

const CONFIGS = {
  mean:   { label: 'Mean',   gradient: 'gradient-indigo', emoji: '📊', desc: 'Average score' },
  median: { label: 'Median', gradient: 'gradient-violet', emoji: '📈', desc: 'Middle value' },
  mode:   { label: 'Mode',   gradient: 'gradient-pink',   emoji: '🎯', desc: 'Most frequent' },
};

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (target === null || target === 'N/A') {
      setValue(target);
      return;
    }
    const numTarget = parseFloat(target);
    if (isNaN(numTarget)) { setValue(target); return; }

    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setValue(parseFloat((eased * numTarget).toFixed(1)));
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return value;
}

export default function StatCard({ type, value, course }) {
  const config = CONFIGS[type] || CONFIGS.mean;
  const animated = useCountUp(value);
  const displayValue = value === null || value === 'N/A' ? 'N/A' : animated;

  return (
    <div className={`stat-card card ${config.gradient}`} title={`${config.desc} for ${course}`}>
      <div className="stat-card__icon">{config.emoji}</div>
      <div className="stat-card__body">
        <p className="stat-card__label">{config.label}</p>
        <p className="stat-card__value">
          {displayValue}
        </p>
        <p className="stat-card__desc">{config.desc}</p>
      </div>
    </div>
  );
}
