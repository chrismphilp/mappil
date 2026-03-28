import { FC } from 'react';
import { motion } from 'framer-motion';

interface QuitChallengeButtonProps {
  compact?: boolean;
}

const QuitChallengeButton: FC<QuitChallengeButtonProps> = ({ compact = false }) => (
  <motion.a
    href="/"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className={`flex items-center justify-center rounded-full text-slate-300 ${
      compact
        ? 'h-10 w-10 border border-transparent bg-white/0 hover:bg-white/8 hover:text-red-400'
        : 'h-12 w-12 border border-white/10 bg-slate-900/70 shadow-xl backdrop-blur-xl hover:text-red-400'
    }`}
    aria-label="Quit Challenge"
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  </motion.a>
);

export default QuitChallengeButton;
