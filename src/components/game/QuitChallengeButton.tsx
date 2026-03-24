import { FC } from 'react';
import { motion } from 'framer-motion';

const QuitChallengeButton: FC = () => (
  <motion.a
    href="/"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className="w-12 h-12 rounded-full bg-slate-900/70 backdrop-blur-xl border border-white/10 flex items-center justify-center text-slate-300 hover:text-red-400 shadow-xl"
    aria-label="Quit Challenge"
  >
    <svg
      width="22"
      height="22"
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