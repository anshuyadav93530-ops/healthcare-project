import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface SimulatedDataBadgeProps {
  className?: string;
  variant?: 'subtle' | 'banner';
}

export const SimulatedDataBadge: React.FC<SimulatedDataBadgeProps> = ({
  className = '',
  variant = 'subtle',
}) => {
  if (variant === 'banner') {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded border border-blue-200 bg-blue-50/80 text-blue-900 dark:bg-blue-950/40 dark:border-blue-900/60 dark:text-blue-200 ${className}`}
      >
        <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
        <span className="font-medium">DEMO DATA:</span>
        <span className="text-blue-700 dark:text-blue-300">
          All patient profiles, readings, and rule triggers are entirely simulated for hackathon demonstration. Not for medical diagnosis.
        </span>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 ${className}`}
      title="All data is synthetic demonstration data"
    >
      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
      <span>Simulated Demo Data</span>
    </span>
  );
};
