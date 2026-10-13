import React, { useState, useEffect } from 'react';
import { useHealthGuard } from '../context/HealthGuardContext';
import { ReviewStatus, Patient } from '../types';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { SimulatedDataBadge } from '../components/common/SimulatedDataBadge';
import { formatTimestamp, calculateAdmissionDuration } from '../utils/rules';
import {
  Stethoscope,
  Clock,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  FileEdit,
  Save,
  History,
  ShieldAlert,
  Info,
  User,
  Heart,
  Activity,
  Gauge,
} from 'lucide-react';

export const DoctorReviewView: React.FC = () => {
  const {
    patients,
    selectedPatientId,
    setSelectedPatientId,
    updatePatientReview,
  } = useHealthGuard();

  const [queueTab, setQueueTab] = useState<'pending' | 'followup' | 'reviewed' | 'all'>('pending');

  // Currently focused patient in doctor review
  const activePatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Local draft state for doctor review notes and status
  const [selectedStatus, setSelectedStatus] = useState<ReviewStatus>(activePatient?.reviewStatus || 'pending');
  const [reviewNoteText, setReviewNoteText] = useState<string>(activePatient?.reviewNotes || '');

  // Synchronize draft form when active patient changes
  useEffect(() => {
    if (activePatient) {
      setSelectedStatus(activePatient.reviewStatus);
      setReviewNoteText(activePatient.reviewNotes || '');
    }
  }, [activePatient?.id, activePatient?.reviewStatus, activePatient?.reviewNotes]);

  // Filtered queue of patients
  const queuePatients = patients.filter((p) => {
    if (queueTab === 'all') return true;
    return p.reviewStatus === queueTab;
  });

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;
    updatePatientReview(activePatient.id, selectedStatus, reviewNoteText);
  };

  const latestReading = activePatient?.readings[activePatient.readings.length - 1];

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Attending Physician Review Queue</span>
            </h2>
            <SimulatedDataBadge />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Synchronized clinical triage, rule trigger explanations, and persistent local review notes.
          </p>
        </div>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/30 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Simulated Doctor Action Notice:</span>
          <p className="mt-0.5 text-amber-800 dark:text-amber-300">
            This review workflow is a frontend hackathon demonstration. Submitting reviews updates persistent local application state only. It does not constitute medical advice, real physician authorization, or clinical decision support.
          </p>
        </div>
      </div>

      {/* Main 2-Column Split: Queue on Left, Patient Dossier & Review Form on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Triage Queue */}
        <div className="lg:col-span-4 space-y-3">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs mb-3">
              {[
                { id: 'pending', label: 'Pending' },
                { id: 'followup', label: 'Follow-up' },
                { id: 'reviewed', label: 'Reviewed' },
                { id: 'all', label: 'All' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setQueueTab(tab.id as any)}
                  className={`flex-1 py-1 text-center font-medium rounded transition-colors whitespace-nowrap ${
                    queueTab === tab.id
                      ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Patients in selected queue tab */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {queuePatients.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                  <span>No patients in this status category.</span>
                </div>
              ) : (
                queuePatients.map((p) => {
                  const isSelected = p.id === activePatient?.id;
                  const duration = calculateAdmissionDuration(p.admissionDate);

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPatientId(p.id)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/40 ring-1 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {p.name}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {p.id}
                          </span>
                        </div>
                        <PriorityBadge priority={p.priority} showIcon={false} />
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{p.room}</span>
                        <span>Stay: {duration}</span>
                      </div>

                      <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1">
                        {p.priorityReason}
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <StatusBadge status={p.reviewStatus} />
                        {p.lastReviewedAt && (
                          <span className="text-[10px] text-slate-400 tabular-nums">
                            {formatTimestamp(p.lastReviewedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (8 cols): Selected Patient Details & Interactive Review Form */}
        <div className="lg:col-span-8 space-y-4">
          {activePatient ? (
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-5">
              {/* Patient Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {activePatient.name}
                    </h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {activePatient.id}
                    </span>
                    <PriorityBadge priority={activePatient.priority} />
                    <StatusBadge status={activePatient.reviewStatus} />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>{activePatient.age} yrs · {activePatient.gender}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activePatient.room}</span>
                    <span aria-hidden="true">·</span>
                    <span>Stay Duration: {calculateAdmissionDuration(activePatient.admissionDate)}</span>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-400">
                  <span>Assigned Reviewer:</span>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">
                    {activePatient.assignedReviewer}
                  </div>
                </div>
              </div>

              {/* Trigger Rule Explanation Box */}
              <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/40 dark:border-rose-900/60 dark:bg-rose-950/20 text-xs">
                <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider text-[11px]">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>Automated Demo Review Trigger</span>
                </div>
                <p className="mt-1 text-rose-900 dark:text-rose-200 font-medium">
                  {activePatient.reviewTriggerRule || activePatient.priorityReason}
                </p>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {activePatient.priorityReason}
                </p>
              </div>

              {/* Vitals Snapshot Grid */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                  Telemetry Snapshot at Trigger
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      <span>Heart Rate</span>
                    </span>
                    <div className="text-base font-bold tabular-nums text-slate-900 dark:text-white mt-1">
                      {latestReading?.heartRate ? `${latestReading.heartRate} bpm` : '--'}
                    </div>
                  </div>

                  <div className="p-2.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-blue-500" />
                      <span>Blood Pressure</span>
                    </span>
                    <div className="text-base font-bold tabular-nums text-slate-900 dark:text-white mt-1">
                      {latestReading?.bloodPressureSys && latestReading?.bloodPressureDia
                        ? `${latestReading.bloodPressureSys}/${latestReading.bloodPressureDia} mmHg`
                        : '--'}
                    </div>
                  </div>

                  <div className="p-2.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-cyan-500" />
                      <span>SpO2</span>
                    </span>
                    <div className="text-base font-bold tabular-nums text-slate-900 dark:text-white mt-1">
                      {latestReading?.spO2 ? `${latestReading.spO2}%` : '--'}
                    </div>
                  </div>

                  <div className="p-2.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-slate-500">Glucose</span>
                    <div className="text-base font-bold tabular-nums text-slate-900 dark:text-white mt-1">
                      {latestReading?.glucose ? `${latestReading.glucose} mg/dL` : '--'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Working Doctor Review Form */}
              <form onSubmit={handleSaveReview} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Select Review Disposition:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedStatus('pending')}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                        selectedStatus === 'pending'
                          ? 'border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200 ring-1 ring-amber-500'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Pending Review</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedStatus('followup')}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                        selectedStatus === 'followup'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <RotateCcw className="w-4 h-4 text-indigo-600" />
                      <span>Follow-up Required</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedStatus('reviewed')}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                        selectedStatus === 'reviewed'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 ring-1 ring-emerald-500'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Mark as Reviewed</span>
                    </button>
                  </div>
                </div>

                {/* Review Notes Textarea */}
                <div>
                  <label htmlFor="review-note-input" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Physician Clinical Note / Observation (Demo Record):
                  </label>
                  <textarea
                    id="review-note-input"
                    rows={3}
                    value={reviewNoteText}
                    onChange={(e) => setReviewNoteText(e.target.value)}
                    placeholder="Enter observation notes (e.g., patient ambulating well, titration protocol approved, nurse alerted)..."
                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 font-sans"
                  />
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-400">
                    Saves to browser localStorage & app state.
                  </span>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Review Disposition</span>
                  </button>
                </div>
              </form>

              {/* Review History Audit Trail for this Patient */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-500" />
                  <span>Review Log History for {activePatient.name}</span>
                </h4>

                <div className="space-y-2">
                  {activePatient.reviewLogs.length === 0 ? (
                    <p className="text-xs text-slate-400">No previous reviews logged yet.</p>
                  ) : (
                    activePatient.reviewLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={log.status} />
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {log.reviewer}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 tabular-nums">
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 mt-1.5 pl-1 border-l-2 border-blue-400">
                          {log.notes}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              Select a patient from the queue to start review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
