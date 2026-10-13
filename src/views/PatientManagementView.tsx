import React, { useState, useMemo } from 'react';
import { useHealthGuard } from '../context/HealthGuardContext';
import { Priority, ReviewStatus, Patient } from '../types';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { SimulatedDataBadge } from '../components/common/SimulatedDataBadge';
import { PatientDetailsModal } from '../components/patient/PatientDetailsModal';
import { Sparkline } from '../components/charts/Sparkline';
import {
  calculateAdmissionDuration,
  formatDateOnly,
  formatTimestamp,
  isReadingStale,
  SIMULATED_NOW,
} from '../utils/rules';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Stethoscope,
  Activity,
  Sparkles,
  X,
  FileQuestion,
  Info,
} from 'lucide-react';

type SortField = 'name' | 'admissionDate' | 'priority' | 'reviewStatus';
type SortOrder = 'asc' | 'desc';

export const PatientManagementView: React.FC = () => {
  const {
    patients,
    searchQuery,
    setSearchQuery,
    setActivePage,
    setSelectedPatientId,
  } = useHealthGuard();

  // Local filter states
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [qualityFilter, setQualityFilter] = useState<string>('all');

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Selected patient for modal details view
  const [inspectPatient, setInspectPatient] = useState<Patient | null>(null);

  // Sorting priorities weight
  const priorityWeight: Record<Priority, number> = {
    high: 1,
    medium: 2,
    routine: 3,
  };

  const statusWeight: Record<ReviewStatus, number> = {
    pending: 1,
    followup: 2,
    reviewed: 3,
  };

  // Filtered and Sorted list
  const filteredPatients = useMemo(() => {
    return patients
      .filter((p) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchId = p.id.toLowerCase().includes(q);
          const matchRoom = p.room.toLowerCase().includes(q);
          const matchCondition = p.primaryCondition.toLowerCase().includes(q);
          if (!matchName && !matchId && !matchRoom && !matchCondition) return false;
        }

        // Priority filter
        if (priorityFilter !== 'all' && p.priority !== priorityFilter) {
          return false;
        }

        // Review status filter
        if (statusFilter !== 'all' && p.reviewStatus !== statusFilter) {
          return false;
        }

        // Data quality filter
        if (qualityFilter !== 'all') {
          const hasMissing = p.readings.some((r) => r.heartRate === null || r.spO2 === null || r.bloodPressureSys === null);
          const hasStale = p.readings.some((r) => r.isStale || isReadingStale(r.timestamp, SIMULATED_NOW));
          const hasReviewTrigger = !!p.reviewTriggerRule || p.priority === 'high';

          if (qualityFilter === 'missing_stale' && !hasMissing && !hasStale) return false;
          if (qualityFilter === 'triggered' && !hasReviewTrigger) return false;
          if (qualityFilter === 'nominal' && (hasMissing || hasStale || p.priority !== 'routine')) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let compare = 0;
        if (sortField === 'name') {
          compare = a.name.localeCompare(b.name);
        } else if (sortField === 'admissionDate') {
          compare = new Date(a.admissionDate).getTime() - new Date(b.admissionDate).getTime();
        } else if (sortField === 'priority') {
          compare = priorityWeight[a.priority] - priorityWeight[b.priority];
        } else if (sortField === 'reviewStatus') {
          compare = statusWeight[a.reviewStatus] - statusWeight[b.reviewStatus];
        }
        return sortOrder === 'asc' ? compare : -compare;
      });
  }, [patients, searchQuery, priorityFilter, statusFilter, qualityFilter, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const resetFilters = () => {
    setPriorityFilter('all');
    setStatusFilter('all');
    setQualityFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    priorityFilter !== 'all' || statusFilter !== 'all' || qualityFilter !== 'all' || !!searchQuery.trim();

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Patient Directory & Triage Roster
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Dynamic calculated admission stays, transparent triage derivations, and unified doctor review synchronization.
          </p>
        </div>
        <SimulatedDataBadge />
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID, or room..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
              aria-label="Filter patients search"
            />
          </div>

          {/* Priority filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 font-medium text-slate-800 dark:text-slate-200"
              aria-label="Filter by priority"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="routine">Routine</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 font-medium text-slate-800 dark:text-slate-200"
              aria-label="Filter by review status"
            >
              <option value="all">All Review Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="followup">Follow-up Required</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>

          {/* Data Quality filter */}
          <div>
            <select
              value={qualityFilter}
              onChange={(e) => setQualityFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 font-medium text-slate-800 dark:text-slate-200"
              aria-label="Filter by data quality"
            >
              <option value="all">All Data Quality States</option>
              <option value="nominal">Fully Nominal Telemetry</option>
              <option value="missing_stale">Missing / Stale Packets</option>
              <option value="triggered">Review Rules Triggered</option>
            </select>
          </div>
        </div>

        {/* Filter clear button when active */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500">
              Showing {filteredPatients.length} of {patients.length} demo records
            </span>
            <button
              onClick={resetFilters}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Patients Table */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 select-none">
              <tr>
                <th className="py-3 px-4">
                  <button
                    onClick={() => toggleSort('name')}
                    className="inline-flex items-center gap-1 font-semibold hover:text-slate-900 dark:hover:text-white"
                  >
                    <span>Patient & Room</span>
                    {sortField === 'name' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </button>
                </th>

                <th className="py-3 px-3">Age / Sex</th>

                <th className="py-3 px-3">
                  <button
                    onClick={() => toggleSort('admissionDate')}
                    className="inline-flex items-center gap-1 font-semibold hover:text-slate-900 dark:hover:text-white"
                  >
                    <span>Admission & Stay</span>
                    {sortField === 'admissionDate' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </button>
                </th>

                <th className="py-3 px-3">
                  <button
                    onClick={() => toggleSort('priority')}
                    className="inline-flex items-center gap-1 font-semibold hover:text-slate-900 dark:hover:text-white"
                  >
                    <span>Triage Priority</span>
                    {sortField === 'priority' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </button>
                </th>

                <th className="py-3 px-3">Latest Sample Vitals</th>

                <th className="py-3 px-3">Vital Trend</th>

                <th className="py-3 px-3">
                  <button
                    onClick={() => toggleSort('reviewStatus')}
                    className="inline-flex items-center gap-1 font-semibold hover:text-slate-900 dark:hover:text-white"
                  >
                    <span>Doctor Review</span>
                    {sortField === 'reviewStatus' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </button>
                </th>

                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="max-w-xs mx-auto text-slate-500">
                      <FileQuestion className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                        No demo patients match filters
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Try clearing or adjusting your search term and filter criteria.
                      </p>
                      <button
                        onClick={resetFilters}
                        className="mt-3 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-300 rounded hover:bg-blue-100 transition-colors"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const duration = calculateAdmissionDuration(patient.admissionDate);
                  const latest = patient.readings[patient.readings.length - 1];
                  const hrTrend = patient.readings.map((r) => r.heartRate);

                  return (
                    <tr
                      key={patient.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & ID */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {patient.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-slate-400">{patient.id}</span>
                          <span aria-hidden="true">·</span>
                          <span>{patient.room}</span>
                        </div>
                      </td>

                      {/* Age / Sex */}
                      <td className="py-3 px-3">
                        <span className="tabular-nums font-medium text-slate-800 dark:text-slate-200">
                          {patient.age}y
                        </span>
                        <span className="text-[11px] text-slate-400 block">{patient.gender}</span>
                      </td>

                      {/* Admission & Stay */}
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-900 dark:text-white tabular-nums">
                          {duration}
                        </span>
                        <span className="text-[10px] text-slate-400 block tabular-nums">
                          Admitted {formatDateOnly(patient.admissionDate)}
                        </span>
                      </td>

                      {/* Priority Badge & Tooltip reason */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-1 items-start">
                          <PriorityBadge priority={patient.priority} />
                          <span
                            className="text-[10px] text-slate-500 line-clamp-1 max-w-[180px] cursor-help"
                            title={patient.priorityReason}
                          >
                            {patient.priorityReason}
                          </span>
                        </div>
                      </td>

                      {/* Latest Vitals */}
                      <td className="py-3 px-3 tabular-nums">
                        {latest ? (
                          <div className="space-y-0.5 font-medium">
                            <div className="text-slate-900 dark:text-white">
                              {latest.heartRate !== null ? `${latest.heartRate} bpm` : (
                                <span className="text-amber-600 font-bold">HR: Missing</span>
                              )}
                              <span className="text-slate-400 mx-1">/</span>
                              {latest.spO2 !== null ? `${latest.spO2}% SpO2` : (
                                <span className="text-amber-600 font-bold">SpO2: Missing</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {latest.bloodPressureSys && latest.bloodPressureDia
                                ? `${latest.bloodPressureSys}/${latest.bloodPressureDia} mmHg`
                                : '--'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">No data</span>
                        )}
                      </td>

                      {/* Sparkline Trend */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <Sparkline
                            data={hrTrend}
                            color={patient.priority === 'high' ? '#e11d48' : '#2563eb'}
                          />
                        </div>
                      </td>

                      {/* Review Status */}
                      <td className="py-3 px-3">
                        <StatusBadge status={patient.reviewStatus} />
                        {patient.lastReviewedAt && (
                          <span className="text-[10px] text-slate-400 block mt-0.5 tabular-nums">
                            {formatTimestamp(patient.lastReviewedAt)}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setInspectPatient(patient)}
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                            title="Inspect Patient Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedPatientId(patient.id);
                              setActivePage('monitoring');
                            }}
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                            title="Open Telemetry Monitor"
                          >
                            <Activity className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedPatientId(patient.id);
                              setActivePage('review');
                            }}
                            className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 transition-colors"
                            title="Open Doctor Review"
                          >
                            <Stethoscope className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
