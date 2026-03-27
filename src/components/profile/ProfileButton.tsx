import { FC } from 'react';
import { motion } from 'framer-motion';

interface ProfileButtonProps {
  onClick: () => void;
}

const ProfileButton: FC<ProfileButtonProps> = ({ onClick }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-slate-900/70 text-slate-300 shadow-xl backdrop-blur-xl transition-colors hover:text-white"
    aria-label="Profile"
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
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  </motion.button>
);

export default ProfileButton;
