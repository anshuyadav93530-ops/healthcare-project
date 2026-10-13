import React from 'react';
import { useHealthGuard } from '../../context/HealthGuardContext';
import { NavigationPage } from '../../types';
import {
  LayoutDashboard,
  Users,
  Activity,
  History,
  Stethoscope,
  Sparkles,
  Server,
  Shield,
  X,
  Layers,
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS: { id: NavigationPage; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'patients', label: 'Patient Management', icon: Users },
  { id: 'monitoring', label: 'Health Monitoring', icon: Activity },
  { id: 'history', label: 'Patient History', icon: History },
  { id: 'review', label: 'Doctor Review', icon: Stethoscope },
  { id: 'simulator', label: 'What-if Simulator', icon: Sparkles },
  { id: 'status', label: 'Data & Model Status', icon: Server },
];

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { activePage, setActivePage, setIsDemoModeModalOpen, pendingReviewsCount } = useHealthGuard();

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation"
      className="fixed inset-0 z-50 md:hidden flex"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-72 max-w-[80vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base text-slate-900 dark:text-white">HealthGuard</span>
              <span className="block text-[10px] text-slate-400 font-mono">CLINICAL SUITE</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.id === 'review' && pendingReviewsCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {pendingReviewsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Demo control button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              setIsDemoModeModalOpen(true);
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
          >
            <Layers className="w-4 h-4" />
            <span>Open Demo Scenarios</span>
          </button>
        </div>
      </div>
    </div>
  );
};
