import React from 'react';
import { Priority } from '../../types';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
  showIcon?: boolean;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, showIcon = true, className = '' }) => {
  switch (priority) {
    case 'high':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/60 ${className}`}
          aria-label="High Priority"
        >
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />}
          <span>High Priority</span>
        </span>
      );
    case 'medium':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/60 ${className}`}
          aria-label="Medium Priority"
        >
          {showIcon && <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />}
          <span>Medium Priority</span>
        </span>
      );
    case 'routine':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 ${className}`}
          aria-label="Routine Priority"
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
          <span>Routine</span>
        </span>
      );
  }
};
