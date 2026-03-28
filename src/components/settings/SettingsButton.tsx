import { FC } from 'react';
import { motion } from 'framer-motion';

interface SettingsButtonProps {
  onClick: () => void;
  compact?: boolean;
}

const SettingsButton: FC<SettingsButtonProps> = ({ onClick, compact = false }) => (
  <motion.button
    whileHover={{ rotate: 90 }}
    whileTap={{ scale: 0.9 }}
    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
    onClick={onClick}
    className={`flex items-center justify-center rounded-full text-slate-300 ${
      compact
        ? 'h-10 w-10 border border-transparent bg-white/0 hover:bg-white/8 hover:text-white'
        : 'h-12 w-12 border border-white/10 bg-slate-900/70 shadow-xl backdrop-blur-xl hover:text-white'
    }`}
    aria-label="Settings"
  >
    <svg
      width={compact ? '18' : '22'}
      height={compact ? '18' : '22'}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  </motion.button>
);

export default SettingsButton;
