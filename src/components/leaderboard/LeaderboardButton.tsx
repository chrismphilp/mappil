import { FC } from 'react';
import { motion } from 'framer-motion';

interface LeaderboardButtonProps {
  onClick: () => void;
  compact?: boolean;
}

const LeaderboardButton: FC<LeaderboardButtonProps> = ({ onClick, compact = false }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`flex items-center justify-center rounded-full text-slate-300 ${
      compact
        ? 'h-10 w-10 border border-transparent bg-white/0 hover:bg-white/8 hover:text-white'
        : 'h-12 w-12 border border-white/10 bg-slate-900/70 shadow-xl backdrop-blur-xl hover:text-white'
    }`}
    aria-label="Leaderboard"
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
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  </motion.button>
);

export default LeaderboardButton;
