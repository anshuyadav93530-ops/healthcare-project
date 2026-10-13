import React from 'react';
import { ReviewStatus } from '../../types';
import { Clock, CheckCircle2, RotateCcw } from 'lucide-react';

interface StatusBadgeProps {
  status: ReviewStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'pending':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60 ${className}`}
        >
          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Pending Review</span>
        </span>
      );
    case 'reviewed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60 ${className}`}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Reviewed</span>
        </span>
      );
    case 'followup':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60 ${className}`}
        >
          <RotateCcw className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>Follow-up Req.</span>
        </span>
      );
  }
};
