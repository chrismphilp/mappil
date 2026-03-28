import { FC } from 'react';
import { motion } from 'framer-motion';

interface ProfileButtonProps {
  onClick: () => void;
  compact?: boolean;
}

const ProfileButton: FC<ProfileButtonProps> = ({ onClick, compact = false }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`flex items-center justify-center rounded-full transition-colors ${
      compact
        ? 'h-10 w-10 border border-transparent bg-white/0 text-slate-300 hover:bg-white/8 hover:text-white'
        : 'h-12 w-12 border border-white/10 bg-slate-900/70 text-slate-300 shadow-xl backdrop-blur-xl hover:text-white'
    }`}
    aria-label="Profile"
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
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  </motion.button>
);

export default ProfileButton;
