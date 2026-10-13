import React from 'react';
import { useHealthGuard } from '../../context/HealthGuardContext';
import { Play, Pause, RotateCcw, XCircle, SkipForward, SlidersHorizontal } from 'lucide-react';
import { DEMO_SCENARIO_CONFIGS } from '../../data/demoScenarios';

export const DemoModeBanner: React.FC = () => {
  const {
    activeScenario,
    playbackStep,
    maxPlaybackSteps,
    isPlaying,
    startPlayback,
    pausePlayback,
    stepForward,
    resetCurrentScenario,
    returnToDefaultDataset,
    setIsDemoModeModalOpen,
  } = useHealthGuard();

  const isScenarioActive = activeScenario !== 'default';
  const currentScenarioConfig = DEMO_SCENARIO_CONFIGS.find((s) => s.id === activeScenario);

  if (!isScenarioActive) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Demo Mode Control Banner"
      className="sticky top-0 z-30 border-b border-amber-300 bg-amber-500 text-slate-950 px-4 py-2.5 shadow-sm transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Exact required banner text & scenario tag */}
        <div className="flex items-center gap-3">
          <span className="font-extrabold tracking-wide text-xs sm:text-sm bg-slate-950 text-white px-2 py-0.5 rounded uppercase">
            DEMO MODE — All readings are simulated.
          </span>
          {currentScenarioConfig && (
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-900 border-l border-amber-600 pl-3">
              {currentScenarioConfig.title} (Step {playbackStep} of {maxPlaybackSteps})
            </span>
          )}
        </div>

        {/* Playback & Reset controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {isPlaying ? (
            <button
              onClick={pausePlayback}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-slate-900"
              title="Pause playback sequence"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={startPlayback}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-slate-900"
              title={playbackStep >= maxPlaybackSteps ? 'Replay sequence' : 'Resume playback'}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{playbackStep >= maxPlaybackSteps ? 'Replay' : 'Play Stream'}</span>
            </button>
          )}

          <button
            onClick={stepForward}
            disabled={playbackStep >= maxPlaybackSteps || isPlaying}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-600/30 hover:bg-amber-600/40 text-slate-950 rounded disabled:opacity-40 transition-colors"
            title="Step forward one telemetry packet"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Next Step</span>
          </button>

          <button
            onClick={resetCurrentScenario}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-600/30 hover:bg-amber-600/40 text-slate-950 rounded transition-colors"
            title="Reset scenario to step 1 (preserves doctor reviews & patient records)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Step</span>
          </button>

          <button
            onClick={() => setIsDemoModeModalOpen(true)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-600/30 hover:bg-amber-600/40 text-slate-950 rounded transition-colors"
            title="Change scenario in control panel"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scenarios</span>
          </button>

          <button
            onClick={returnToDefaultDataset}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white text-slate-900 border border-slate-300 rounded hover:bg-slate-100 transition-colors ml-1"
            title="Exit scenario and return to default demo dataset"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Exit Demo Stream</span>
          </button>
        </div>
      </div>
    </div>
  );
};
