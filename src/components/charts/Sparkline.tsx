import React from 'react';

interface SparklineProps {
  data: (number | null)[];
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = '#2563eb',
  width = 80,
  height = 24,
  className = '',
}) => {
  const validValues = data.filter((v): v is number => v !== null && !isNaN(v));
  if (validValues.length < 2) {
    return <span className="text-[11px] text-slate-400">--</span>;
  }

  const min = Math.min(...validValues);
  const max = Math.max(...validValues);
  const range = max - min || 1;
  const padding = 2;

  const points = data.map((val, idx) => {
    if (val === null) return null;
    const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = points
    .filter((pt): pt is string => pt !== null)
    .reduce((acc, curr, idx) => (idx === 0 ? `M ${curr}` : `${acc} L ${curr}`), '');

  return (
    <svg
      width={width}
      height={height}
      className={`inline-block overflow-visible ${className}`}
      aria-hidden="true"
    >
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
