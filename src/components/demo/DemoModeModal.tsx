import React from 'react';
import { useHealthGuard } from '../../context/HealthGuardContext';
import { DEMO_SCENARIO_CONFIGS } from '../../data/demoScenarios';
import { X, Play, Pause, RotateCcw, SkipForward, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const DemoModeModal: React.FC = () => {
  const {
    isDemoModeModalOpen,
    setIsDemoModeModalOpen,
    activeScenario,
    playbackStep,
    maxPlaybackSteps,
    isPlaying,
    loadDemoScenario,
    startPlayback,
    pausePlayback,
    stepForward,
    resetCurrentScenario,
    returnToDefaultDataset,
  } = useHealthGuard();

  if (!isDemoModeModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 id="demo-modal-title" className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Demo Mode Control Panel</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Deterministic, reproducible scenarios designed for live college hackathon presentations.
            </p>
          </div>
          <button
            onClick={() => setIsDemoModeModalOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Callout */}
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded text-xs text-amber-900 dark:text-amber-200">
          <div className="font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Simulation Guarantee:</span>
          </div>
          <p className="mt-1 text-amber-800 dark:text-amber-300">
            All data in these scenarios is synthetic. Resetting or switching scenarios updates simulated telemetry streams without erasing saved doctor review notes, audit logs, or custom triage statuses.
          </p>
        </div>

        {/* Scenarios List */}
        <div className="mt-5 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Available Deterministic Scenarios
          </h3>

          {DEMO_SCENARIO_CONFIGS.map((cfg) => {
            const isSelected = activeScenario === cfg.id;
            return (
              <div
                key={cfg.id}
                className={`p-4 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 dark:border-blue-500 dark:bg-blue-950/30'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {cfg.title}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {cfg.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {cfg.description}
                    </p>
                    <div className="mt-2 text-[11px] text-slate-500">
                      Target Subject: <span className="font-mono font-medium">{cfg.targetPatientId}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center">
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Active Stream</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => loadDemoScenario(cfg.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                      >
                        Load Scenario
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-controls when this scenario is active */}
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-900/60 flex items-center justify-between gap-2 flex-wrap">
                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      Playback: Step {playbackStep} of {maxPlaybackSteps}
                    </div>

                    <div className="flex items-center gap-2">
                      {isPlaying ? (
                        <button
                          onClick={pausePlayback}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-900 text-white rounded hover:bg-slate-800"
                        >
                          <Pause className="w-3.5 h-3.5" />
                          <span>Pause</span>
                        </button>
                      ) : (
                        <button
                          onClick={startPlayback}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{playbackStep >= maxPlaybackSteps ? 'Replay' : 'Play Stream'}</span>
                        </button>
                      )}

                      <button
                        onClick={stepForward}
                        disabled={playbackStep >= maxPlaybackSteps || isPlaying}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded disabled:opacity-40"
                      >
                        <SkipForward className="w-3.5 h-3.5" />
                        <span>Next Step</span>
                      </button>

                      <button
                        onClick={resetCurrentScenario}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Rewind</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              returnToDefaultDataset();
              setIsDemoModeModalOpen(false);
            }}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
          >
            Reset to Default Baseline
          </button>

          <button
            onClick={() => setIsDemoModeModalOpen(false)}
            className="px-4 py-2 text-xs font-medium bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
