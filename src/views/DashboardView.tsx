import React, { useState } from 'react';
import { useHealthGuard } from '../context/HealthGuardContext';
import { MetricCard } from '../components/common/MetricCard';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { SimulatedDataBadge } from '../components/common/SimulatedDataBadge';
import { InteractiveVitalChart } from '../components/charts/InteractiveVitalChart';
import { Sparkline } from '../components/charts/Sparkline';
import { PatientDetailsModal } from '../components/patient/PatientDetailsModal';
import { calculateAdmissionDuration, formatTimestamp } from '../utils/rules';
import { Patient } from '../types';
import {
  Users,
  Stethoscope,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
  FileText,
  AlertOctagon,
  ShieldCheck,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    patients,
    totalPatientsCount,
    pendingReviewsCount,
    highPriorityCount,
    mediumPriorityCount,
    routinePriorityCount,
    dataQualitySummary,
    setActivePage,
    setSelectedPatientId,
  } = useHealthGuard();

  const [inspectPatient, setInspectPatient] = useState<Patient | null>(null);

  // Focus patient for the dashboard chart: default to first high priority or first patient
  const [featuredPatientId, setFeaturedPatientId] = useState<string>(() => {
    const high = patients.find((p) => p.priority === 'high');
    return high ? high.id : patients[0]?.id || 'HG-701';
  });

  const featuredPatient = patients.find((p) => p.id === featuredPatientId) || patients[0];

  // Derive all active alerts across patients
  const activeAlerts = patients
    .flatMap((p) =>
      p.historyEvents
        .filter((e) => e.type === 'alert')
        .map((e) => ({ ...e, patient: p }))
    )
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Educational Demo Banner */}
      <SimulatedDataBadge variant="banner" />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Demo Patients"
          value={totalPatientsCount}
          subtitle="Active department census"
          icon={Users}
          onClick={() => setActivePage('patients')}
        />

        <MetricCard
          title="Requires Doctor Review"
          value={pendingReviewsCount}
          subtitle="Pending physician action"
          icon={Stethoscope}
          badge={
            pendingReviewsCount > 0 ? (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Action Needed
              </span>
            ) : (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Clear
              </span>
            )
          }
          onClick={() => setActivePage('review')}
        />

        <MetricCard
          title="High Priority Triage"
          value={highPriorityCount}
          subtitle={`${mediumPriorityCount} Med · ${routinePriorityCount} Routine`}
          icon={AlertTriangle}
          badge={<PriorityBadge priority="high" showIcon={false} />}
          onClick={() => setActivePage('patients')}
        />

        <MetricCard
          title="Telemetry Freshness"
          value={
            dataQualitySummary.staleReadings > 0
              ? `${dataQualitySummary.staleReadings} Stale`
              : '100% Fresh'
          }
          subtitle={`${dataQualitySummary.missingReadings} missing packets detected`}
          icon={Activity}
          onClick={() => setActivePage('status')}
        />
      </div>

      {/* Central Section: Featured Vital Chart + Priority Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Vital Chart */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Patient Telemetry Focus
              </h2>
              <span className="text-xs text-slate-400">· Select patient to view trend</span>
            </div>

            {/* Quick patient switcher for chart */}
            <select
              value={featuredPatientId}
              onChange={(e) => setFeaturedPatientId(e.target.value)}
              className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              aria-label="Select patient for telemetry focus"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id}) · {p.priority.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {featuredPatient && (
            <InteractiveVitalChart
              readings={featuredPatient.readings}
              patientName={`${featuredPatient.name} (${featuredPatient.room})`}
            />
          )}

          {/* Featured patient quick banner */}
          {featuredPatient && (
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <PriorityBadge priority={featuredPatient.priority} />
                <span className="text-slate-600 dark:text-slate-300">
                  {featuredPatient.priorityReason}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setInspectPatient(featuredPatient)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => {
                    setSelectedPatientId(featuredPatient.id);
                    setActivePage('review');
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                >
                  Doctor Review
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: High & Medium Priority Review Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Review Queue</span>
            </h2>
            <button
              onClick={() => setActivePage('review')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <span>All ({pendingReviewsCount})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs">
            {patients.filter((p) => p.reviewStatus === 'pending').length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                <span>All demo patients are currently reviewed.</span>
              </div>
            ) : (
              patients
                .filter((p) => p.reviewStatus === 'pending')
                .slice(0, 4)
                .map((patient) => {
                  const latest = patient.readings[patient.readings.length - 1];
                  return (
                    <div
                      key={patient.id}
                      className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {patient.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {patient.id}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {patient.room} · Stay: {calculateAdmissionDuration(patient.admissionDate)}
                          </span>
                        </div>
                        <PriorityBadge priority={patient.priority} showIcon={false} />
                      </div>

                      <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                        {patient.priorityReason}
                      </div>

                      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
                        <span className="text-[10px] text-slate-400 tabular-nums">
                          HR: {latest?.heartRate ?? '--'} bpm · SpO2: {latest?.spO2 ?? '--'}%
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setInspectPatient(patient)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title="Inspect patient"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPatientId(patient.id);
                              setActivePage('review');
                            }}
                            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Review &rarr;
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          {/* Quick Action Buttons Card */}
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
            <span className="text-xs font-semibold text-slate-900 dark:text-white block mb-2">
              Clinical Quick Actions
            </span>
            <div className="space-y-1.5">
              <button
                onClick={() => setActivePage('patients')}
                className="w-full text-left px-3 py-2 rounded text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors"
              >
                <span>Filter Triage Directory</span>
                <Users className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => setActivePage('simulator')}
                className="w-full text-left px-3 py-2 rounded text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors"
              >
                <span>Open What-If Simulator</span>
                <Activity className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => setActivePage('status')}
                className="w-full text-left px-3 py-2 rounded text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors"
              >
                <span>Inspect Data & Model Status</span>
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Alerts & Missing/Stale Warning Strip */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Automated Demo Alerts & Data Quality Flags
            </h3>
          </div>
          <span className="text-xs text-slate-400">Deterministic rule activations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {activeAlerts.map((alt) => (
            <div
              key={alt.id}
              onClick={() => {
                setSelectedPatientId(alt.patient.id);
                setActivePage('review');
              }}
              className="p-3 rounded border border-rose-100 bg-rose-50/40 dark:border-rose-950 dark:bg-rose-950/20 hover:border-rose-200 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-rose-800 dark:text-rose-300">
                <span className="truncate">{alt.patient.name}</span>
                <span className="font-mono text-[10px]">{alt.patient.id}</span>
              </div>
              <p className="text-xs text-rose-900 dark:text-rose-200 mt-1 line-clamp-2">
                {alt.description}
              </p>
              <div className="mt-2 flex items-center justify-between text-[10px] text-rose-600 dark:text-rose-400">
                <span>{formatTimestamp(alt.timestamp)}</span>
                <span className="font-semibold hover:underline">Review &rarr;</span>
              </div>
            </div>
          ))}

          {/* Missing/Stale Indicator Card */}
          {dataQualitySummary.missingReadings > 0 && (
            <div
              onClick={() => setActivePage('status')}
              className="p-3 rounded border border-amber-200 bg-amber-50/50 dark:border-amber-900/60 dark:bg-amber-950/20 hover:border-amber-300 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-300">
                <span>Missing Packets Flagged</span>
                <span className="font-bold tabular-nums">{dataQualitySummary.missingReadings}</span>
              </div>
              <p className="text-xs text-amber-900 dark:text-amber-200 mt-1 line-clamp-2">
                Sensor packet dropouts identified. Null values preserved rather than converted to zero.
              </p>
              <div className="mt-2 text-[10px] text-amber-600 dark:text-amber-400 font-semibold hover:underline">
                View Data Status &rarr;
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Patient Details Modal */}
      {inspectPatient && (
        <PatientDetailsModal
          patient={inspectPatient}
          onClose={() => setInspectPatient(null)}
        />
      )}
    </div>
  );
};
