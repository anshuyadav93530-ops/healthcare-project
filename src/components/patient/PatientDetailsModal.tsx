import React from 'react';
import { Patient } from '../../types';
import { useHealthGuard } from '../../context/HealthGuardContext';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';
import {
  calculateAdmissionDuration,
  formatDateOnly,
  formatTimestamp,
} from '../../utils/rules';
import {
  X,
  Clock,
  MapPin,
  Calendar,
  Activity,
  Stethoscope,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface PatientDetailsModalProps {
  patient: Patient | null;
  onClose: () => void;
}

export const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({ patient, onClose }) => {
  const { setActivePage, setSelectedPatientId } = useHealthGuard();

  if (!patient) return null;

  const admissionDuration = calculateAdmissionDuration(patient.admissionDate);
  const latestReading = patient.readings[patient.readings.length - 1];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="patient-details-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h2 id="patient-details-title" className="text-xl font-bold text-slate-900 dark:text-white">
                {patient.name}
              </h2>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {patient.id}
              </span>
              <PriorityBadge priority={patient.priority} />
              <StatusBadge status={patient.reviewStatus} />
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{patient.room}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Admitted: {formatDateOnly(patient.admissionDate)}</span>
              </span>
              <span className="flex items-center gap-1 font-medium text-blue-700 dark:text-blue-300">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>Duration: {admissionDuration}</span>
              </span>
              <span>{patient.age} yrs · {patient.gender}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close patient details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Priority Reason Explanation Box (Mandatory rule transparency) */}
        <div className="mt-4 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Triage Priority Derivation Rule</span>
          </div>
          <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
            {patient.priorityReason}
          </p>
          <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 italic">
            * Disclaimer: Derived strictly from demo telemetry threshold equations. Not a clinical diagnosis or medical risk assessment.
          </p>
        </div>

        {/* Latest Vitals Snapshot Cards */}
        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Latest Sample Readings ({latestReading ? formatTimestamp(latestReading.timestamp) : 'N/A'})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div className="p-2.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-[11px] text-slate-500">Heart Rate</span>
              <div className="text-lg font-bold tabular-nums text-slate-900 dark:text-white mt-0.5">
                {latestReading?.heartRate ? `${latestReading.heartRate} bpm` : '--'}
              </div>
              <span className="text-[10px] text-slate-400">Ref: 60-100</span>
            </div>

            <div className="p-2.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-[11px] text-slate-500">Blood Pressure</span>
              <div className="text-lg font-bold tabular-nums text-slate-900 dark:text-white mt-0.5">
                {latestReading?.bloodPressureSys && latestReading?.bloodPressureDia
                  ? `${latestReading.bloodPressureSys}/${latestReading.bloodPressureDia}`
                  : '--'}
              </div>
              <span className="text-[10px] text-slate-400">Ref: &lt;120/80</span>
            </div>

            <div className="p-2.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-[11px] text-slate-500">SpO2</span>
              <div className="text-lg font-bold tabular-nums text-slate-900 dark:text-white mt-0.5">
                {latestReading?.spO2 ? `${latestReading.spO2}%` : '--'}
              </div>
              <span className="text-[10px] text-slate-400">Ref: 95-100%</span>
            </div>

            <div className="p-2.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-[11px] text-slate-500">Blood Glucose</span>
              <div className="text-lg font-bold tabular-nums text-slate-900 dark:text-white mt-0.5">
                {latestReading?.glucose ? `${latestReading.glucose} mg/dL` : '--'}
              </div>
              <span className="text-[10px] text-slate-400">Ref: 70-140</span>
            </div>

            <div className="p-2.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-[11px] text-slate-500">Temp</span>
              <div className="text-lg font-bold tabular-nums text-slate-900 dark:text-white mt-0.5">
                {latestReading?.temperature ? `${latestReading.temperature}°F` : '--'}
              </div>
              <span className="text-[10px] text-slate-400">Ref: 97.8-99.1</span>
            </div>
          </div>
        </div>

        {/* Chronological Timeline */}
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Event & Review Audit Timeline
          </h3>
          <div className="space-y-3 relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {patient.historyEvents.map((evt) => (
              <div key={evt.id} className="relative pl-3">
                <span className="absolute -left-3.5 top-1.5 w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 ring-4 ring-white dark:ring-slate-900" />
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {evt.title}
                  </span>
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {formatTimestamp(evt.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {evt.description}
                </p>
                {evt.actor && (
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Logged by: {evt.actor}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="text-xs text-slate-500">
            Assigned: <span className="font-medium text-slate-700 dark:text-slate-300">{patient.assignedReviewer}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedPatientId(patient.id);
                setActivePage('monitoring');
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Telemetry Monitor</span>
            </button>

            <button
              onClick={() => {
                setSelectedPatientId(patient.id);
                setActivePage('simulator');
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>What-If Simulator</span>
            </button>

            <button
              onClick={() => {
                setSelectedPatientId(patient.id);
                setActivePage('review');
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor Review</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
