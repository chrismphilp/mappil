'use client';

import { FC, memo } from 'react';

interface PerformanceSample {
  avgFps: number;
  durationMs: number;
  frames: number;
}

interface PerformanceTimings {
  challengeResolvedMs: number | null;
  dataReadyMs: number | null;
  geometryReadyMs: number | null;
  globeModuleReadyMs: number | null;
  interactiveMs: number | null;
}

interface PerformanceDebugPanelProps {
  experienceLabel: string;
  geometryTierLabel: string;
  hasChallenge: boolean;
  timings: PerformanceTimings;
  fpsSample: PerformanceSample | null;
}

function formatMs(value: number | null): string {
  return value === null ? 'pending' : `${value.toFixed(1)}ms`;
}

const PerformanceDebugPanel: FC<PerformanceDebugPanelProps> = ({
  experienceLabel,
  geometryTierLabel,
  hasChallenge,
  timings,
  fpsSample,
}) => {
  return (
    <aside className="pointer-events-none fixed right-4 top-4 z-[70] w-[18rem] rounded-2xl border border-cyan-400/20 bg-slate-950/88 p-4 font-mono text-[11px] text-slate-200 shadow-2xl shadow-slate-950/60 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-cyan-300">Perf Debug</span>
        <span className="text-slate-400">
          {experienceLabel}/{geometryTierLabel}
        </span>
      </div>

      <div className="space-y-1 text-slate-300">
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">challenge</span>
          <span>{hasChallenge ? formatMs(timings.challengeResolvedMs) : 'n/a'}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">data ready</span>
          <span>{formatMs(timings.dataReadyMs)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">geometry ready</span>
          <span>{formatMs(timings.geometryReadyMs)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">globe chunk</span>
          <span>{formatMs(timings.globeModuleReadyMs)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">interactive</span>
          <span>{formatMs(timings.interactiveMs)}</span>
        </div>
      </div>

      <div className="mt-3 border-t border-slate-800 pt-3 text-slate-300">
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">fps sample</span>
          <span>{fpsSample ? `${fpsSample.avgFps.toFixed(1)} fps` : 'sampling...'}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">sample span</span>
          <span>
            {fpsSample
              ? `${fpsSample.durationMs.toFixed(0)}ms / ${fpsSample.frames} frames`
              : 'pending'}
          </span>
        </div>
      </div>
    </aside>
  );
};

export type { PerformanceSample, PerformanceTimings };
export default memo(PerformanceDebugPanel);
