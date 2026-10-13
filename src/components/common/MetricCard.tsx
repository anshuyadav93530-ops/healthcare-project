import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: React.ReactNode;
  trend?: {
    label: string;
    positive?: boolean;
    neutral?: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  trend,
  onClick,
  className = '',
}) => {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs transition-colors ${
        isClickable ? 'hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
          {title}
        </span>
        <div className="p-1.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 shrink-0">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
          {value}
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {(subtitle || trend) && (
        <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {trend && (
            <span
              className={`font-medium ${
                trend.neutral
                  ? 'text-slate-500'
                  : trend.positive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {trend.label}
            </span>
          )}
          {trend && subtitle && <span aria-hidden="true">·</span>}
          {subtitle && <span className="truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
