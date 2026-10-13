import React, { useMemo } from 'react';
import { useHealthGuard } from '../context/HealthGuardContext';
import { InteractiveVitalChart } from '../components/charts/InteractiveVitalChart';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { SimulatedDataBadge } from '../components/common/SimulatedDataBadge';
import { formatTimestamp, calculateAdmissionDuration, isReadingStale, validateVitalReading, SIMULATED_NOW } from '../utils/rules';
import {
  Activity,
  Heart,
  Droplets,
  Thermometer,
  Gauge,
  AlertTriangle,
  Clock,
  EyeOff,
  Stethoscope,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const HealthMonitoringView: React.FC = () => {
  const {
    patients,
    selectedPatientId,
    setSelectedPatientId,
    selectedPatient,
    setActivePage,
  } = useHealthGuard();

  const patient = selectedPatient || patients[0];

  // Latest reading
  const latest = patient?.readings[patient.readings.length - 1];

  // Calculate summary metrics across patient's reading history
  const historyStats = useMemo(() => {
    if (!patient?.readings) return null;
    const hrs = patient.readings.map((r) => r.heartRate).filter((v): v is number => v !== null);
    const bps = patient.readings.map((r) => r.bloodPressureSys).filter((v): v is number => v !== null);
    const spo2s = patient.readings.map((r) => r.spO2).filter((v): v is number => v !== null);
    const glus = patient.readings.map((r) => r.glucose).filter((v): v is number => v !== null);

    const calcAvg = (arr: number[]) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null);
    const calcMin = (arr: number[]) => (arr.length ? Math.min(...arr) : null);
    const calcMax = (arr: number[]) => (arr.length ? Math.max(...arr) : null);

    return {
      hr: { avg: calcAvg(hrs), min: calcMin(hrs), max: calcMax(hrs) },
      bpSys: { avg: calcAvg(bps), min: calcMin(bps), max: calcMax(bps) },
      spo2: { avg: calcAvg(spo2s), min: calcMin(spo2s), max: calcMax(spo2s) },
      glu: { avg: calcAvg(glus), min: calcMin(glus), max: calcMax(glus) },
    };
  }, [patient]);

  // Specific alerts for this patient
  const patientAlerts = patient?.historyEvents.filter((e) => e.type === 'alert') || [];

  return (
    <div className="space-y-6">
      {/* Top Header & Patient Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Continuous Telemetry & Vital Streams
            </h2>
            <SimulatedDataBadge />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time wave simulations, packet gap alerts, and physiological anomaly monitors.
          </p>
        </div>

        {/* Patient Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="patient-select" className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
            Select Patient:
          </label>
          <select
            id="patient-select"
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 shadow-xs"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id} · {p.room}) — {p.priority.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Dossier Bar */}
      {patient && (
        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {patient.name}
            </span>
            <span className="font-mono text-slate-400">{patient.id}</span>
            <PriorityBadge priority={patient.priority} />
            <StatusBadge status={patient.reviewStatus} />
            <span className="text-slate-400">·</span>
            <span className="text-slate-600 dark:text-slate-300">
              Stay: {calculateAdmissionDuration(patient.admissionDate)}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">{patient.primaryCondition}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePage('review')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Review Patient</span>
            </button>
          </div>
        </div>
      )}

      {/* Recent Measurement Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Heart Rate */}
        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Heart Rate</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
            {latest?.heartRate !== null ? (
              <span>{latest?.heartRate} <span className="text-xs font-normal text-slate-500">bpm</span></span>
            ) : (
              <span className="text-amber-600 text-lg flex items-center gap-1 font-bold">
                <EyeOff className="w-4 h-4" /> Missing
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Ref: 60–100 bpm</span>
            {historyStats?.hr.avg && (
              <span className="tabular-nums">Avg: {historyStats.hr.avg} bpm</span>
            )}
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Blood Pressure</span>
            <Gauge className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
            {latest?.bloodPressureSys && latest?.bloodPressureDia ? (
              <span>
                {latest.bloodPressureSys}/{latest.bloodPressureDia}{' '}
                <span className="text-xs font-normal text-slate-500">mmHg</span>
              </span>
            ) : (
              <span className="text-amber-600 text-lg flex items-center gap-1 font-bold">
                <EyeOff className="w-4 h-4" /> Missing Cuff
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Ref: &lt;120/80 mmHg</span>
            {historyStats?.bpSys.avg && (
              <span className="tabular-nums">Avg Sys: {historyStats.bpSys.avg}</span>
            )}
          </div>
        </div>

        {/* SpO2 */}
        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Oxygen Saturation</span>
            <Activity className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
            {latest?.spO2 !== null ? (
              <span className={latest && latest.spO2! < 93 ? 'text-rose-600' : ''}>
                {latest?.spO2} <span className="text-xs font-normal text-slate-500">%</span>
              </span>
            ) : (
              <span className="text-amber-600 text-lg flex items-center gap-1 font-bold">
                <EyeOff className="w-4 h-4" /> Disconnected
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Ref: 95–100%</span>
            {historyStats?.spo2.avg && (
              <span className="tabular-nums">Avg: {historyStats.spo2.avg}%</span>
            )}
          </div>
        </div>

        {/* Blood Glucose */}
        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Blood Glucose</span>
            <Droplets className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
            {latest?.glucose !== null ? (
              <span>{latest?.glucose} <span className="text-xs font-normal text-slate-500">mg/dL</span></span>
            ) : (
              <span className="text-amber-600 text-lg flex items-center gap-1 font-bold">
                <EyeOff className="w-4 h-4" /> Unmeasured
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Ref: 70–140 mg/dL</span>
            {historyStats?.glu.avg && (
              <span className="tabular-nums">Avg: {historyStats.glu.avg}</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Interactive SVG Vital Chart */}
      {patient && (
        <InteractiveVitalChart
          readings={patient.readings}
          patientName={`${patient.name} (${patient.id})`}
        />
      )}

      {/* Telemetry Reading History Table & Rule-Based Alert Trigger List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Reading History Table */}
        <div className="lg:col-span-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Telemetry Log History ({patient?.readings.length} Packets)
            </h3>
            <span className="text-xs text-slate-400">Chronological telemetry packets</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-2">Heart Rate</th>
                  <th className="py-2.5 px-2">Blood Pressure</th>
                  <th className="py-2.5 px-2">SpO2</th>
                  <th className="py-2.5 px-2">Glucose</th>
                  <th className="py-2.5 px-2">Temp</th>
                  <th className="py-2.5 px-3">Packet Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 tabular-nums">
                {patient?.readings.slice().reverse().map((r) => {
                  const isStale = r.isStale || isReadingStale(r.timestamp, SIMULATED_NOW);
                  const isMissingAny = r.heartRate === null || r.spO2 === null || r.bloodPressureSys === null;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                        {formatTimestamp(r.timestamp)}
                      </td>

                      <td className="py-2.5 px-2">
                        {r.heartRate !== null ? (
                          <span>{r.heartRate} bpm</span>
                        ) : (
                          <span className="text-amber-600 font-bold">--</span>
                        )}
                      </td>

                      <td className="py-2.5 px-2">
                        {r.bloodPressureSys && r.bloodPressureDia ? (
                          <span>{r.bloodPressureSys}/{r.bloodPressureDia}</span>
                        ) : (
                          <span className="text-amber-600 font-bold">--</span>
                        )}
                      </td>

                      <td className="py-2.5 px-2">
                        {r.spO2 !== null ? (
                          <span>{r.spO2}%</span>
                        ) : (
                          <span className="text-amber-600 font-bold">--</span>
                        )}
                      </td>

                      <td className="py-2.5 px-2">
                        {r.glucose !== null ? `${r.glucose}` : <span className="text-slate-400">--</span>}
                      </td>

                      <td className="py-2.5 px-2">
                        {r.temperature !== null ? `${r.temperature}°F` : '--'}
                      </td>

                      <td className="py-2.5 px-3">
                        {isMissingAny ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                            <EyeOff className="w-3 h-3" />
                            <span>Missing Data</span>
                          </span>
                        ) : r.sampleStatus === 'unusual' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Review Needed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Nominal</span>
                          </span>
                        )}
                        {isStale && (
                          <span className="ml-1 text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                            [Stale]
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Active Rule Alerts for this Patient */}
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Rule Alert Ledger</span>
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Transparent demo rules triggered by incoming sample thresholds for {patient?.name}.
            </p>

            <div className="space-y-2.5">
              {patientAlerts.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded">
                  No active rule alerts recorded for this patient.
                </div>
              ) : (
                patientAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-3 rounded border border-rose-100 bg-rose-50/50 dark:border-rose-950 dark:bg-rose-950/20 text-xs"
                  >
                    <div className="font-bold text-rose-800 dark:text-rose-300">
                      {alt.title}
                    </div>
                    <p className="text-rose-900 dark:text-rose-200 mt-1">
                      {alt.description}
                    </p>
                    <div className="mt-2 text-[10px] text-rose-600 dark:text-rose-400 flex items-center justify-between">
                      <span>{formatTimestamp(alt.timestamp)}</span>
                      <span>Trigger: {alt.actor}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Educational Disclaimer Card */}
          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/60 dark:border-blue-900/60 dark:bg-blue-950/20 text-xs space-y-1.5 text-blue-900 dark:text-blue-200">
            <div className="font-bold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Telemetry Architecture Note</span>
            </div>
            <p className="text-blue-800 dark:text-blue-300 text-[11px]">
              Missing values in HealthGuard are never coerced to 0 or replaced with interpolated approximations. Missing packets trigger data quality alarms and are visualized with dashed discontinuity markers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
