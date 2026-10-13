import React, { useState, useMemo } from 'react';
import { useHealthGuard } from '../context/HealthGuardContext';
import { PatientHistoryEvent } from '../types';
import { SimulatedDataBadge } from '../components/common/SimulatedDataBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatTimestamp, formatDateOnly } from '../utils/rules';
import {
  History,
  Filter,
  Search,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  Activity,
  FileText,
  User,
  Clock,
  Layers,
} from 'lucide-react';

export const PatientHistoryView: React.FC = () => {
  const {
    patients,
    selectedPatientId,
    setSelectedPatientId,
    selectedPatient,
  } = useHealthGuard();

  const patient = selectedPatient || patients[0];

  // Local filter states
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [timelineSearch, setTimelineSearch] = useState<string>('');

  // Combined and sorted event timeline for selected patient
  const timelineEvents = useMemo(() => {
    if (!patient) return [];

    // Combine historyEvents with all individual vital reading events
    const vitalEvents: PatientHistoryEvent[] = patient.readings.map((r) => ({
      id: `vit-${r.id}`,
      patientId: patient.id,
      timestamp: r.timestamp,
      type: 'vital_reading',
      title: `Telemetry Packet Recorded (${r.sampleStatus === 'unusual' ? 'Unusual' : r.sampleStatus === 'missing' ? 'Missing Packet' : 'Nominal'})`,
      description: `HR: ${r.heartRate ?? 'Missing'} bpm · BP: ${r.bloodPressureSys && r.bloodPressureDia ? `${r.bloodPressureSys}/${r.bloodPressureDia}` : 'Missing'} mmHg · SpO2: ${r.spO2 ?? 'Missing'}% · Glucose: ${r.glucose ?? '--'} mg/dL`,
      actor: 'Continuous Telemetry Monitor',
    }));

    const allEvents = [...patient.historyEvents, ...vitalEvents];

    // Filter by type
    return allEvents
      .filter((evt) => {
        if (eventTypeFilter !== 'all' && evt.type !== eventTypeFilter) return false;
        if (timelineSearch.trim()) {
          const q = timelineSearch.toLowerCase();
          const matchTitle = evt.title.toLowerCase().includes(q);
          const matchDesc = evt.description.toLowerCase().includes(q);
          const matchActor = evt.actor?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchActor) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [patient, eventTypeFilter, timelineSearch]);

  const getEventIcon = (type: PatientHistoryEvent['type']) => {
    switch (type) {
      case 'admission':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'vital_reading':
        return <Activity className="w-4 h-4 text-cyan-600" />;
      case 'review_status':
        return <Stethoscope className="w-4 h-4 text-emerald-600" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'note':
      default:
        return <FileText className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Patient Historical Audit Timeline
            </h2>
            <SimulatedDataBadge />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Synchronized audit log of admissions, telemetry readings, review actions, and demo rule triggers.
          </p>
        </div>

        {/* Patient Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="history-patient-select" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Selected Record:
          </label>
          <select
            id="history-patient-select"
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id}) · {p.reviewStatus.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Dossier Bar */}
      {patient && (
        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {patient.name}
            </span>
            <span className="font-mono text-slate-400">{patient.id}</span>
            <PriorityBadge priority={patient.priority} />
            <StatusBadge status={patient.reviewStatus} />
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <span>Room: {patient.room}</span>
            <span aria-hidden="true">·</span>
            <span>Admitted: {formatDateOnly(patient.admissionDate)}</span>
            <span aria-hidden="true">·</span>
            <span>Total Stored Events: {timelineEvents.length}</span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar for Timeline */}
      <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={timelineSearch}
            onChange={(e) => setTimelineSearch(e.target.value)}
            placeholder="Filter timeline entries..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
            aria-label="Filter timeline entries"
          />
        </div>

        {/* Event Type Filter */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Events' },
            { id: 'review_status', label: 'Doctor Reviews' },
            { id: 'alert', label: 'Rule Alerts' },
            { id: 'vital_reading', label: 'Telemetry Packets' },
            { id: 'admission', label: 'Admissions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setEventTypeFilter(tab.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                eventTypeFilter === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chronological Timeline Container */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
        {timelineEvents.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            <History className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
              No timeline events recorded
            </p>
            <p className="text-slate-500 mt-1">
              No stored events match the selected event type or search keyword for {patient?.name}.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 space-y-6">
            {timelineEvents.map((evt) => (
              <div key={evt.id} className="relative group">
                {/* Event Marker */}
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center group-hover:border-blue-500 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                </div>

                <div className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-white dark:bg-slate-800 shadow-2xs">
                        {getEventIcon(evt.type)}
                      </div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {evt.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 tabular-nums">
                      {formatTimestamp(evt.timestamp)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">
                    {evt.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Logged by: {evt.actor || 'HealthGuard Engine'}</span>
                    <span className="font-mono text-[10px] uppercase">{evt.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
