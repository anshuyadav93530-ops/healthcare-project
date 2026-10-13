/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HealthGuardProvider, useHealthGuard } from './context/HealthGuardContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { DemoModeBanner } from './components/common/DemoModeBanner';
import { DemoModeModal } from './components/demo/DemoModeModal';
import { DashboardView } from './views/DashboardView';
import { PatientManagementView } from './views/PatientManagementView';
import { HealthMonitoringView } from './views/HealthMonitoringView';
import { PatientHistoryView } from './views/PatientHistoryView';
import { DoctorReviewView } from './views/DoctorReviewView';
import { WhatIfSimulatorView } from './views/WhatIfSimulatorView';
import { DataModelStatusView } from './views/DataModelStatusView';
import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activePage, activeToast, dismissToast } = useHealthGuard();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-150">
      {/* Demo Mode Sticky Banner if scenario active */}
      <DemoModeBanner />

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Collapsible Sidebar */}
        <Sidebar />

        {/* Mobile Navigation Drawer */}
        <MobileDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Primary Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar Contract: Zone 1, Zone 2, Zone 3 */}
          <TopBar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

          {/* Active Toast Notification */}
          {activeToast && (
            <div className="px-4 md:px-6 pt-3">
              <div
                className={`flex items-center justify-between gap-3 p-3 rounded-lg text-xs font-medium shadow-xs border animate-in slide-in-from-top ${
                  activeToast.type === 'alert'
                    ? 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/80 dark:border-rose-900 dark:text-rose-200'
                    : activeToast.type === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/80 dark:border-amber-900 dark:text-amber-200'
                    : activeToast.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/80 dark:border-emerald-900 dark:text-emerald-200'
                    : 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/80 dark:border-blue-900 dark:text-blue-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {activeToast.type === 'alert' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                  {activeToast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                  {activeToast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  {activeToast.type === 'info' && <Info className="w-4 h-4 text-blue-600 shrink-0" />}
                  <span>{activeToast.message}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {activeToast.actionLabel && activeToast.onAction && (
                    <button
                      onClick={() => {
                        activeToast.onAction!();
                        dismissToast();
                      }}
                      className="px-2.5 py-1 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-bold hover:opacity-90"
                    >
                      {activeToast.actionLabel}
                    </button>
                  )}
                  <button
                    onClick={dismissToast}
                    className="p-1 hover:opacity-75"
                    aria-label="Dismiss message"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main View Router */}
          <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
            {activePage === 'dashboard' && <DashboardView />}
            {activePage === 'patients' && <PatientManagementView />}
            {activePage === 'monitoring' && <HealthMonitoringView />}
            {activePage === 'history' && <PatientHistoryView />}
            {activePage === 'review' && <DoctorReviewView />}
            {activePage === 'simulator' && <WhatIfSimulatorView />}
            {activePage === 'status' && <DataModelStatusView />}
          </main>

          {/* Quiet Clean Footer */}
          <footer className="border-t border-slate-200 dark:border-slate-800 px-4 md:px-6 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                HealthGuard Clinical Intelligence Platform
              </span>
              <span>
                College Hackathon Demo · All patient data and vitals are simulated · Not for medical diagnosis
              </span>
            </div>
          </footer>
        </div>
      </div>

      {/* Global Demo Mode Control Panel Modal */}
      <DemoModeModal />
    </div>
  );
};

export default function App() {
  return (
    <HealthGuardProvider>
      <AppContent />
    </HealthGuardProvider>
  );
}
