import React, { useState, useMemo } from 'react';
import { VitalReading, VitalMetricType } from '../../types';
import { formatTimestamp } from '../../utils/rules';
import { Activity, Heart, Droplets, Thermometer, Gauge, AlertTriangle, EyeOff } from 'lucide-react';

interface InteractiveVitalChartProps {
  readings: VitalReading[];
  patientName?: string;
  className?: string;
}

interface MetricConfig {
  key: VitalMetricType;
  label: string;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  darkColor: string;
  nominalMin: number;
  nominalMax: number;
  yMin: number;
  yMax: number;
  step: number;
}

const METRIC_CONFIGS: Record<VitalMetricType, MetricConfig> = {
  heartRate: {
    key: 'heartRate',
    label: 'Heart Rate',
    unit: 'bpm',
    icon: Heart,
    color: '#e11d48', // rose-600
    darkColor: '#fb7185',
    nominalMin: 60,
    nominalMax: 100,
    yMin: 40,
    yMax: 140,
    step: 20,
  },
  bloodPressure: {
    key: 'bloodPressure',
    label: 'Blood Pressure',
    unit: 'mmHg',
    icon: Gauge,
    color: '#2563eb', // blue-600
    darkColor: '#60a5fa',
    nominalMin: 90,
    nominalMax: 120, // Systolic normal
    yMin: 60,
    yMax: 180,
    step: 30,
  },
  spO2: {
    key: 'spO2',
    label: 'Oxygen Saturation (SpO2)',
    unit: '%',
    icon: Activity,
    color: '#0891b2', // cyan-600
    darkColor: '#22d3ee',
    nominalMin: 95,
    nominalMax: 100,
    yMin: 85,
    yMax: 100,
    step: 5,
  },
  glucose: {
    key: 'glucose',
    label: 'Blood Glucose',
    unit: 'mg/dL',
    icon: Droplets,
    color: '#d97706', // amber-600
    darkColor: '#fbbf24',
    nominalMin: 70,
    nominalMax: 140,
    yMin: 60,
    yMax: 220,
    step: 40,
  },
  temperature: {
    key: 'temperature',
    label: 'Body Temp',
    unit: '°F',
    icon: Thermometer,
    color: '#9333ea', // purple-600
    darkColor: '#c084fc',
    nominalMin: 97.6,
    nominalMax: 99.2,
    yMin: 96,
    yMax: 102,
    step: 1.5,
  },
};

export const InteractiveVitalChart: React.FC<InteractiveVitalChartProps> = ({
  readings,
  patientName,
  className = '',
}) => {
  const [selectedMetric, setSelectedMetric] = useState<VitalMetricType>('heartRate');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const config = METRIC_CONFIGS[selectedMetric];

  // SVG Geometry Dimensions
  const width = 800;
  const height = 300;
  const padding = { top: 30, right: 30, bottom: 40, left: 55 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Process data points
  const points = useMemo(() => {
    if (!readings || readings.length === 0) return [];

    return readings.map((r, index) => {
      let val: number | null = null;
      let valDia: number | null = null;

      if (selectedMetric === 'heartRate') val = r.heartRate;
      else if (selectedMetric === 'spO2') val = r.spO2;
      else if (selectedMetric === 'glucose') val = r.glucose;
      else if (selectedMetric === 'temperature') val = r.temperature;
      else if (selectedMetric === 'bloodPressure') {
        val = r.bloodPressureSys;
        valDia = r.bloodPressureDia;
      }

      const x = padding.left + (index / Math.max(1, readings.length - 1)) * innerWidth;

      const getY = (v: number | null) => {
        if (v === null || v === undefined) return null;
        // Clamp to chart bounds
        const clamped = Math.max(config.yMin, Math.min(config.yMax, v));
        const ratio = (clamped - config.yMin) / (config.yMax - config.yMin);
        return padding.top + innerHeight - ratio * innerHeight;
      };

      return {
        index,
        timestamp: r.timestamp,
        value: val,
        valueDia: valDia,
        x,
        y: getY(val),
        yDia: getY(valDia),
        isMissing: val === null,
        isStale: r.isStale,
        sampleStatus: r.sampleStatus,
      };
    });
  }, [readings, selectedMetric, innerWidth, innerHeight, padding, config]);

  // Construct SVG paths (breaks or renders dashed line across missing data points)
  const linePath = useMemo(() => {
    let d = '';
    let inSegment = false;

    points.forEach((p) => {
      if (p.y !== null) {
        if (!inSegment) {
          d += `M ${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
          inSegment = true;
        } else {
          d += `L ${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
        }
      } else {
        inSegment = false; // Break path for missing readings!
      }
    });

    return d;
  }, [points]);

  // Secondary path for BP Diastolic
  const linePathDia = useMemo(() => {
    if (selectedMetric !== 'bloodPressure') return '';
    let d = '';
    let inSegment = false;

    points.forEach((p) => {
      if (p.yDia !== null) {
        if (!inSegment) {
          d += `M ${p.x.toFixed(1)} ${p.yDia.toFixed(1)} `;
          inSegment = true;
        } else {
          d += `L ${p.x.toFixed(1)} ${p.yDia.toFixed(1)} `;
        }
      } else {
        inSegment = false;
      }
    });

    return d;
  }, [points, selectedMetric]);

  // Y-axis grid ticks
  const yTicks = useMemo(() => {
    const ticks = [];
    const count = 5;
    for (let i = 0; i <= count; i++) {
      const val = config.yMin + (i / count) * (config.yMax - config.yMin);
      const y = padding.top + innerHeight - (i / count) * innerHeight;
      ticks.push({ val: Number(val.toFixed(1)), y });
    }
    return ticks;
  }, [config, innerHeight, padding]);

  // Nominal reference band Y coordinates
  const nominalBandY = useMemo(() => {
    const yMaxBand = padding.top + innerHeight - ((config.nominalMax - config.yMin) / (config.yMax - config.yMin)) * innerHeight;
    const yMinBand = padding.top + innerHeight - ((config.nominalMin - config.yMin) / (config.yMax - config.yMin)) * innerHeight;
    return {
      top: Math.max(padding.top, yMaxBand),
      height: Math.abs(yMinBand - yMaxBand),
    };
  }, [config, innerHeight, padding]);

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];

  return (
    <div className={`rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs ${className}`}>
      {/* Header with Metric Selector Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{config.label} Trend</span>
            {patientName && (
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                · {patientName}
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Ref. Band: {config.nominalMin}–{config.nominalMax} {config.unit}</span>
            <span aria-hidden="true">·</span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">Deterministic Sample Records</span>
          </div>
        </div>

        {/* Metric Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-md overflow-x-auto">
          {(Object.keys(METRIC_CONFIGS) as VitalMetricType[]).map((key) => {
            const m = METRIC_CONFIGS[key];
            const isSelected = selectedMetric === key;
            const IconComponent = m.icon;
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedMetric(key);
                  setHoveredIndex(null);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{m.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Chart Canvas */}
      <div className="relative mt-4 w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible font-sans"
        >
          <defs>
            <linearGradient id={`grad-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={config.color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={config.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Reference Window Shaded Zone */}
          <rect
            x={padding.left}
            y={nominalBandY.top}
            width={innerWidth}
            height={nominalBandY.height}
            fill="currentColor"
            className="text-emerald-500/10 dark:text-emerald-400/10"
            rx="3"
          />
          <text
            x={padding.left + innerWidth - 6}
            y={nominalBandY.top + 12}
            textAnchor="end"
            className="text-[10px] font-medium fill-emerald-600 dark:fill-emerald-400 select-none"
          >
            Nominal Window
          </text>

          {/* Y Axis Grid lines and labels */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={padding.left + innerWidth}
                y2={tick.y}
                stroke="currentColor"
                className="text-slate-100 dark:text-slate-800"
                strokeDasharray="3 3"
              />
              <text
                x={padding.left - 10}
                y={tick.y + 3.5}
                textAnchor="end"
                className="text-[11px] tabular-nums fill-slate-400 dark:fill-slate-500"
              >
                {tick.val}
              </text>
            </g>
          ))}

          {/* Y Axis Unit Label */}
          <text
            x={padding.left - 10}
            y={padding.top - 12}
            textAnchor="end"
            className="text-[10px] font-semibold uppercase tracking-wider fill-slate-400 dark:fill-slate-500"
          >
            {config.unit}
          </text>

          {/* Continuous Line Path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={config.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* BP Diastolic Secondary Line if selected */}
          {linePathDia && (
            <path
              d={linePathDia}
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
          )}

          {/* X Axis Time Labels */}
          {points.map((p, i) => {
            const timeStr = new Date(p.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <text
                key={i}
                x={p.x}
                y={height - 12}
                textAnchor="middle"
                className="text-[10px] tabular-nums fill-slate-400 dark:fill-slate-500"
              >
                {timeStr}
              </text>
            );
          })}

          {/* Interactive Hover Guides & Data Points */}
          {points.map((p, i) => {
            const isHovered = hoveredIndex === i;

            if (p.isMissing) {
              // Missing data indicator: hollow dash circle with alert cross
              return (
                <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredIndex(i)}>
                  <line
                    x1={p.x}
                    y1={padding.top}
                    x2={p.x}
                    y2={padding.top + innerHeight}
                    stroke="currentColor"
                    strokeDasharray="2 2"
                    className="text-amber-300 dark:text-amber-800"
                  />
                  <circle
                    cx={p.x}
                    cy={padding.top + innerHeight / 2}
                    r={isHovered ? 8 : 6}
                    fill="#fff"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={p.x}
                    y={padding.top + innerHeight / 2 + 18}
                    textAnchor="middle"
                    className="text-[9px] font-semibold fill-amber-600 dark:fill-amber-400"
                  >
                    MISSING
                  </text>
                </g>
              );
            }

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {isHovered && (
                  <line
                    x1={p.x}
                    y1={padding.top}
                    x2={p.x}
                    y2={padding.top + innerHeight}
                    stroke="currentColor"
                    className="text-slate-300 dark:text-slate-700"
                    strokeDasharray="2 2"
                  />
                )}
                {/* Point circle */}
                <circle
                  cx={p.x}
                  cy={p.y!}
                  r={isHovered ? 6 : 4}
                  fill={p.sampleStatus === 'unusual' ? '#f43f5e' : '#fff'}
                  stroke={p.sampleStatus === 'unusual' ? '#be123c' : config.color}
                  strokeWidth={isHovered ? 2.5 : 2}
                  className="transition-all"
                />

                {/* Secondary point for BP Diastolic */}
                {p.yDia !== null && (
                  <circle
                    cx={p.x}
                    cy={p.yDia}
                    r={isHovered ? 5 : 3.5}
                    fill="#fff"
                    stroke="#64748b"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Dynamic Tooltip / Current Inspector Strip */}
        <div className="mt-3 flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded border border-slate-200/70 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {activePoint ? formatTimestamp(activePoint.timestamp) : 'Latest'}
            </span>
            <span aria-hidden="true">·</span>
            {activePoint?.isMissing ? (
              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                <EyeOff className="w-3.5 h-3.5" />
                <span>Sensor Disconnected / Unrecorded Packet (Not Zero)</span>
              </span>
            ) : (
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                {selectedMetric === 'bloodPressure'
                  ? `${activePoint?.value ?? '--'} / ${activePoint?.valueDia ?? '--'} ${config.unit}`
                  : `${activePoint?.value ?? '--'} ${config.unit}`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activePoint?.sampleStatus === 'unusual' && (
              <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                <AlertTriangle className="w-3 h-3" />
                <span>Exceeds Reference Window</span>
              </span>
            )}
            {activePoint?.isStale && (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                [Stale &gt;12h]
              </span>
            )}
            {activePoint?.sampleStatus === 'normal' && (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Nominal Sample
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
