import { FC, memo } from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 1
}

const ProgressBar: FC<ProgressBarProps> = ({ progress }) => (
  <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
    <div
      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
      style={{
        width: `${progress * 100}%`,
        transition: 'width 240ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    />
  </div>
);

export default memo(ProgressBar);
