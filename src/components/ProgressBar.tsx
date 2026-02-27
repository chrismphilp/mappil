import { FC, memo } from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // 0 to 1
}

const ProgressBar: FC<ProgressBarProps> = ({ progress }) => (
  <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
    <motion.div
      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
      initial={{ width: 0 }}
      animate={{ width: `${progress * 100}%` }}
      transition={{ type: 'spring', stiffness: 60, damping: 15 }}
    />
  </div>
);

export default memo(ProgressBar);
