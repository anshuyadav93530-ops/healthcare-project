import React, { useState, useMemo } from 'react';
import { useHealthGuard } from '../context/HealthGuardContext';
import { SimulationInputs } from '../types';
import { DEFAULT_SIMULATION_INPUTS, runWhatIfSimulation } from '../utils/simulator';
import { SimulatedDataBadge } from '../components/common/SimulatedDataBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import {
  Sparkles,
  RotateCcw,
  Play,
  Info,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Minus,
  Moon,
  Footprints,
  Utensils,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const WhatIfSimulatorView: React.FC = () => {
  const {
    patients,
    selectedPatientId,
    setSelectedPatientId,
    selectedPatient,
  } = useHealthGuard();

  const patient = selectedPatient || patients[0];

  // User input states
  const [inputs, setInputs] = useState<SimulationInputs>({ ...DEFAULT_SIMULATION_INPUTS });
  const [activeSimulation, setActiveSimulation] = useState<SimulationInputs>({ ...DEFAULT_SIMULATION_INPUTS });
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  // Run simulation based on current inputs & patient baseline
  const simulationResult = useMemo(() => {
    if (!patient) return null;
    return runWhatIfSimulation(patient, activeSimulation);
  }, [patient, activeSimulation]);

  const handleRunSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSimulation({ ...inputs });
  };

  const handleResetInputs = () => {
    setInputs({ ...DEFAULT_SIMULATION_INPUTS });
    setActiveSimulation({ ...DEFAULT_SIMULATION_INPUTS });
  };

  // Check which inputs were modified from default baseline
  const changedInputsList: string[] = [];
  if (inputs.sleepHours !== DEFAULT_SIMULATION_INPUTS.sleepHours) {
    changedInputsList.push(`Sleep Duration: ${inputs.sleepHours} hrs (Default: ${DEFAULT_SIMULATION_INPUTS.sleepHours} hrs)`);
  }
  if (inputs.activityMinutes !== DEFAULT_SIMULATION_INPUTS.activityMinutes) {
    changedInputsList.push(`Physical Activity: ${inputs.activityMinutes} mins (Default: ${DEFAULT_SIMULATION_INPUTS.activityMinutes} mins)`);
  }
  if (inputs.mealRegularity !== DEFAULT_SIMULATION_INPUTS.mealRegularity) {
    changedInputsList.push(`Meal Regularity: Level ${inputs.mealRegularity}/5 (Default: Level 3/5)`);
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>What-If Physiological Simulator</span>
            </h2>
            <SimulatedDataBadge />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Deterministic lifestyle scenario heuristic modeling resting rate and blood pressure responsiveness.
          </p>
        </div>

        {/* Patient Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="sim-patient-select" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Subject:
          </label>
          <select
            id="sim-patient-select"
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mandatory Prominent Disclaimer Banner */}
      <div className="p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50/90 dark:border-indigo-900 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-xs">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-extrabold uppercase tracking-wide text-indigo-900 dark:text-indigo-100">
              “Illustrative simulation — not a medical prediction.”
            </div>
            <p className="mt-1 text-xs text-indigo-800 dark:text-indigo-300">
              This interactive sandbox uses a transparent, mathematical heuristic. It is strictly for educational design exploration. It does not use a trained machine learning model, does not assess medical risk, and does not alter stored patient telemetry or clinical review status.
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Controls on Left, Comparison on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Parameter Input Controls */}
        <div className="lg:col-span-5 space-y-4">
          <form
            onSubmit={handleRunSimulation}
            className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Scenario Lifestyle Parameters
              </span>
              <button
                type="button"
                onClick={handleResetInputs}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                title="Reset to default inputs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Parameter 1: Sleep Duration */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label htmlFor="sleep-slider" className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span>Sleep Duration:</span>
                </label>
                <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {inputs.sleepHours.toFixed(1)} hrs / night
                </span>
              </div>
              <input
                id="sleep-slider"
                type="range"
                min="4.0"
                max="11.0"
                step="0.5"
                value={inputs.sleepHours}
                onChange={(e) => setInputs({ ...inputs, sleepHours: parseFloat(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>4.0h (Deficit)</span>
                <span>8.0h (Target)</span>
                <span>11.0h (Excess)</span>
              </div>
            </div>

            {/* Parameter 2: Physical Activity */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label htmlFor="activity-slider" className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Footprints className="w-4 h-4 text-emerald-500" />
                  <span>Physical Activity:</span>
                </label>
                <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {inputs.activityMinutes} mins / day
                </span>
              </div>
              <input
                id="activity-slider"
                type="range"
                min="0"
                max="120"
                step="5"
                value={inputs.activityMinutes}
                onChange={(e) => setInputs({ ...inputs, activityMinutes: parseInt(e.target.value, 10) })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>0m (Sedentary)</span>
                <span>30m (Nominal)</span>
                <span>120m (Active)</span>
              </div>
            </div>

            {/* Parameter 3: Meal Regularity */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-amber-500" />
                  <span>Meal Schedule Regularity:</span>
                </label>
                <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  Level {inputs.mealRegularity} / 5
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setInputs({ ...inputs, mealRegularity: lvl })}
                    className={`py-1.5 text-xs font-semibold rounded border transition-colors ${
                      inputs.mealRegularity === lvl
                        ? 'bg-amber-500 text-slate-950 border-amber-600'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Erratic (1)</span>
                <span>Moderate (3)</span>
                <span>Strict Timed (5)</span>
              </div>
            </div>

            {/* Parameter Change Summary */}
            {changedInputsList.length > 0 && (
              <div className="p-3 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  Active Modifications from Baseline:
                </span>
                {changedInputsList.map((item, idx) => (
                  <div key={idx}>· {item}</div>
                ))}
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Compute Scenario Model</span>
            </button>
          </form>

          {/* Formula Breakdown Accordion */}
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <button
              onClick={() => setShowFormulaDetails(!showFormulaDetails)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-slate-400" />
                <span>Simulation Mechanics & Heuristic Formula</span>
              </span>
              {showFormulaDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showFormulaDetails && (
              <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <p>
                  <strong>Formula Specification:</strong>
                </p>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li>
                    <strong>Sleep Deficit Shift:</strong> ΔHR = max(0, 7.5 - Sleep) × 1.5 bpm; ΔBP = max(0, 7.5 - Sleep) × 1.8 mmHg.
                  </li>
                  <li>
                    <strong>Physical Activity Conditioning:</strong> ΔHR = -(min(60, Mins) / 20) × 1.4 bpm; ΔBP = -(min(60, Mins) / 20) × 1.6 mmHg.
                  </li>
                  <li>
                    <strong>Glycemic Schedule Variance:</strong> ΔGlucose = (3 - Regularity) × 6 mg/dL.
                  </li>
                </ul>
                <p className="text-[10px] text-slate-500 italic">
                  * Note: This is an idealized educational toy equation. Human physiology involves multifaceted neuroendocrine interactions not captured by algebraic formulas.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Comparative Results */}
        <div className="lg:col-span-7 space-y-4">
          {simulationResult && (
            <div className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Baseline vs. Scenario Comparison
                  </h3>
                  <span className="text-xs text-slate-500">
                    {simulationResult.baselineSummary}
                  </span>
                </div>

                <div className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Illustrative Factor: <span className="text-indigo-600 dark:text-indigo-400">{simulationResult.illustrativeScore}/100</span>
                </div>
              </div>

              {/* Metric Delta Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {simulationResult.metrics.map((m, idx) => {
                  const isFavorable = m.direction === 'favorable';
                  const isUnfavorable = m.direction === 'unfavorable';

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {m.metric}
                        </span>
                        <span className="text-[11px] text-slate-400 uppercase font-mono">
                          {m.unit}
                        </span>
                      </div>

                      {/* Side by Side Baseline vs Simulated */}
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Baseline</span>
                          <span className="text-base font-bold tabular-nums text-slate-700 dark:text-slate-300">
                            {m.baseline}
                          </span>
                        </div>

                        <ArrowRight className="w-4 h-4 text-slate-400" />

                        <div>
                          <span className="text-[10px] text-slate-400 block">Simulated</span>
                          <span className="text-base font-bold tabular-nums text-slate-900 dark:text-white">
                            {m.simulated}
                          </span>
                        </div>

                        {/* Delta Tag */}
                        <div
                          className={`px-2 py-0.5 rounded text-xs font-bold tabular-nums flex items-center gap-1 ${
                            isFavorable
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : isUnfavorable
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {m.delta > 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : m.delta < 0 ? (
                            <TrendingDown className="w-3 h-3" />
                          ) : (
                            <Minus className="w-3 h-3" />
                          )}
                          <span>
                            {m.delta > 0 ? `+${m.delta}` : m.delta} {m.unit}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                        {m.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Data Safety Note */}
              <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200">
                <span className="font-semibold block mb-0.5">Telemetry Non-Destructive Guarantee:</span>
                <p className="text-[11px] text-blue-800 dark:text-blue-300">
                  Running this simulation has zero effect on {patient.name}’s telemetry records or doctor review status. All baseline metrics remain intact in the database.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
