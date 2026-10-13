import React, { useState } from 'react';
import { useHealthGuard } from '../../context/HealthGuardContext';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  Shield,
  Layers,
  X,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface TopBarProps {
  onOpenMobileMenu: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Department Overview',
  patients: 'Patient Directory & Triage',
  monitoring: 'Real-time Telemetry Monitor',
  history: 'Historical Audit Timeline',
  review: 'Physician Review Queue',
  simulator: 'Physiological What-If Sandbox',
  status: 'Data Integrity & Model Connectivity',
};

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu }) => {
  const {
    activePage,
    searchQuery,
    setSearchQuery,
    theme,
    toggleTheme,
    setIsDemoModeModalOpen,
    activeScenario,
    patients,
    setSelectedPatientId,
    setActivePage,
  } = useHealthGuard();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Derive notifications from recent alerts across patients
  const recentAlerts = patients
    .flatMap((p) =>
      p.historyEvents
        .filter((e) => e.type === 'alert')
        .map((e) => ({ ...e, patientName: p.name, patientId: p.id }))
    )
    .slice(0, 5);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-6 flex items-center justify-between gap-4 select-none z-10 shrink-0">
      {/* Zone 1: Mobile toggle & Contextual Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm md:text-base font-bold text-slate-900 dark:text-white truncate">
              {PAGE_TITLES[activePage] || 'HealthGuard'}
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 truncate hidden sm:block">
            HealthGuard Clinical Telemetry & Review Platform · Demo v1.0
          </p>
        </div>
      </div>

      {/* Zone 2: Search Input */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search demo patient by name, room, or ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
            aria-label="Search patients"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Zone 3: Actions, Demo Mode Launcher, Notifications, Theme, Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Quick Demo Mode trigger */}
        <button
          onClick={() => setIsDemoModeModalOpen(true)}
          className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
            activeScenario !== 'default'
              ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
          }`}
          title="Open Demo Scenarios"
        >
          <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Demo Scenarios</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Telemetry alerts"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {recentAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Demo Rule Alerts ({recentAlerts.length})
                </span>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {recentAlerts.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">No active alerts</p>
                ) : (
                  recentAlerts.map((alt) => (
                    <div
                      key={alt.id}
                      onClick={() => {
                        setSelectedPatientId(alt.patientId);
                        setActivePage('review');
                        setIsNotificationsOpen(false);
                      }}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-xs cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{alt.patientName}</span>
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {alt.patientId}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">
                        {alt.description}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => {
                    setActivePage('review');
                    setIsNotificationsOpen(false);
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>Go to Doctor Review Queue</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle: Light / Dark only */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
          aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Clinician Demo Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 ring-1 ring-slate-300 dark:ring-slate-600">
            <img
              src="/src/assets/images/avatar_clinician_priya_1791889401357.jpg"
              alt="Dr. Priya Sharma"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // styled SVG fallback
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="w-full h-full flex items-center justify-center font-bold text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60">
              PS
            </div>
          </div>
          <div className="hidden lg:block text-left truncate leading-tight">
            <span className="block text-xs font-semibold text-slate-900 dark:text-white truncate">
              Dr. Priya Sharma
            </span>
            <span className="block text-[10px] text-slate-400">Demo Attending MD</span>
          </div>
        </div>
      </div>
    </header>
  );
};
