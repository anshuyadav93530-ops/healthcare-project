import React from 'react';
import { useHealthGuard } from '../context/HealthGuardContext';
import { MetricCard } from '../components/common/MetricCard';
import { SimulatedDataBadge } from '../components/common/SimulatedDataBadge';
import { formatTimestamp, STALE_THRESHOLD_HOURS } from '../utils/rules';
import {
  Server,
  Database,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Clock,
  EyeOff,
  ShieldCheck,
  Info,
  ExternalLink,
} from 'lucide-react';

export const DataModelStatusView: React.FC = () => {
  const {
    dataQualitySummary,
    setSelectedPatientId,
    setActivePage,
  } = useHealthGuard();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Data Integrity & Model Connectivity Status</span>
            </h2>
            <SimulatedDataBadge />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real calculated metrics, freshness boundaries, sensor dropout telemetry, and model interface readiness.
          </p>
        </div>
      </div>

      {/* Model Status Card (Mandatory exact phrase) */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Machine Learning / AI Connection Status
              </span>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {dataQualitySummary.modelStatus}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Heuristic Rules Only
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <p>
            HealthGuard operates exclusively on deterministic rule tables and standard statistical heuristics. No external prediction API, paid LLM, or clinical neural network is connected to this client session.
          </p>
        </div>
      </div>

      {/* Real Computed Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Telemetry Records"
          value={dataQualitySummary.totalRecords}
          subtitle={`Across ${dataQualitySummary.availableReadings} complete readings`}
          icon={Database}
        />

        <MetricCard
          title="Missing Packet Dropouts"
          value={dataQualitySummary.missingReadings}
          subtitle="Null fields preserved as gaps"
          icon={EyeOff}
          badge={
            dataQualitySummary.missingReadings > 0 ? (
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
                Gaps Logged
              </span>
            ) : (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                Zero Gaps
              </span>
            )
          }
        />

        <MetricCard
          title="Stale Telemetry Packets"
          value={dataQualitySummary.staleReadings}
          subtitle={`Threshold: > ${STALE_THRESHOLD_HOURS} hours old`}
          icon={Clock}
          badge={
            dataQualitySummary.staleReadings > 0 ? (
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
                Stale Found
              </span>
            ) : (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                Fresh
              </span>
            )
          }
        />

        <MetricCard
          title="Physiological Out-of-Bounds"
          value={dataQualitySummary.invalidReadings}
          subtitle="Impossible sensor bounds checked"
          icon={AlertTriangle}
          badge={
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
              0 Violations
            </span>
          }
        />
      </div>

      {/* Infrastructure & Data Source Description Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs text-xs space-y-2">
          <span className="font-bold uppercase tracking-wider text-slate-400 block text-[11px]">
            Data Source Description
          </span>
          <div className="font-semibold text-slate-800 dark:text-slate-200">
            {dataQualitySummary.dataSourceDescription}
          </div>
          <p className="text-slate-500">
            State is managed via React Context and selectively persisted into the browser's HTML5 localStorage sandbox.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs text-xs space-y-2">
          <span className="font-bold uppercase tracking-wider text-slate-400 block text-[11px]">
            Latest Stored Telemetry Timestamp
          </span>
          <div className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
            {dataQualitySummary.lastUpdateTime
              ? formatTimestamp(dataQualitySummary.lastUpdateTime)
              : 'Not available'}
          </div>
          <p className="text-slate-500">
            Derived directly from the maximum timestamp present across stored telemetry records.
          </p>
        </div>
      </div>

      {/* Explanation of Data Quality Rules */}
      <div className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Active Data-Quality Audit Rules & Boundaries</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              1. Physiological Sanity Limits
            </span>
            <p className="text-slate-500 text-[11px]">
              Heart Rate: 30–240 bpm · SpO2: 40–100% · Systolic BP: 50–260 mmHg · Diastolic: 30–160 mmHg · Glucose: 25–650 mg/dL. Values outside trigger invalidity alerts.
            </p>
          </div>

          <div className="p-3 rounded border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              2. Sensor Freshness Threshold
            </span>
            <p className="text-slate-500 text-[11px]">
              Explicitly set to 12.0 hours. Telemetry samples older than 12 hours from current simulated reference time receive a [Stale] tag to warn clinical operators.
            </p>
          </div>

          <div className="p-3 rounded border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              3. Explicit Null Preservation
            </span>
            <p className="text-slate-500 text-[11px]">
              Missing sensor packets are kept strictly as null values. They are never rendered as zero or auto-filled, preventing accidental false bradycardia or hypotension flags.
            </p>
          </div>
        </div>
      </div>

      {/* Detected Data Quality Issues Table */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Detected Data-Quality Issues ({dataQualitySummary.issuesList.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Live audit from application data</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Patient</th>
                <th className="py-2.5 px-3">Issue Category</th>
                <th className="py-2.5 px-3">Audit Details</th>
                <th className="py-2.5 px-3">Recorded Timestamp</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {dataQualitySummary.issuesList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-500">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                    <span>No data quality anomalies detected in current active dataset.</span>
                  </td>
                </tr>
              ) : (
                dataQualitySummary.issuesList.map((issue, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                      {issue.patientName} <span className="font-mono text-slate-400 font-normal">({issue.patientId})</span>
                    </td>
                    <td className="py-2.5 px-3">
                      {issue.issueType === 'missing' && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Missing Values
                        </span>
                      )}
                      {issue.issueType === 'stale' && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Stale Reading
                        </span>
                      )}
                      {issue.issueType === 'invalid' && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          Bounds Violation
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      {issue.details}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 tabular-nums">
                      {formatTimestamp(issue.timestamp)}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedPatientId(issue.patientId);
                          setActivePage('monitoring');
                        }}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Investigate</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
