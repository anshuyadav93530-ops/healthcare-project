import React, { useState } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';

interface NavItem {
  id: NavigationPage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCountKey?: 'pendingReviews' | 'totalPatients';
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'patients', label: 'Patient Management', icon: Users, badgeCountKey: 'totalPatients' },
  { id: 'monitoring', label: 'Health Monitoring', icon: Activity },
  { id: 'history', label: 'Patient History', icon: History },
  { id: 'review', label: 'Doctor Review', icon: Stethoscope, badgeCountKey: 'pendingReviews' },
  { id: 'simulator', label: 'What-if Simulator', icon: Sparkles },
  { id: 'status', label: 'Data & Model Status', icon: Server },
];

export const Sidebar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    pendingReviewsCount,
    totalPatientsCount,
    setIsDemoModeModalOpen,
    activeScenario,
  } = useHealthGuard();

  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-200 select-none z-20 shrink-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      aria-label="Main Navigation"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Shield className="w-4 h-4 fill-white/20 stroke-white" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                HealthGuard
              </span>
              <span className="block text-[10px] text-slate-400 -mt-1 font-mono">
                CLINICAL PORTAL
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;
          const badgeValue =
            item.badgeCountKey === 'pendingReviews'
              ? pendingReviewsCount
              : item.badgeCountKey === 'totalPatients'
              ? totalPatientsCount
              : null;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors group relative ${
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                }`}
              />

              {!isCollapsed && <span className="truncate flex-1 text-left">{item.label}</span>}

              {!isCollapsed && badgeValue !== null && badgeValue > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums ${
                    item.badgeCountKey === 'pendingReviews'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {badgeValue}
                </span>
              )}

              {/* Tooltip in collapsed mode */}
              {isCollapsed && (
                <span className="sr-only">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Demo Mode Action in Sidebar Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setIsDemoModeModalOpen(true)}
          className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold border transition-all ${
            activeScenario !== 'default'
              ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
              : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
          title="Open Demo Mode Control Panel"
        >
          <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          {!isCollapsed && (
            <div className="text-left truncate">
              <span className="block leading-tight">Demo Control</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {activeScenario !== 'default' ? 'Stream Running' : 'Preset Scenarios'}
              </span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
