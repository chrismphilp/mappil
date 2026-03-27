import { FC } from 'react';

interface ProfileButtonProps {
  onClick: () => void;
}

const ProfileButton: FC<ProfileButtonProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-slate-900/70 text-slate-300 shadow-xl backdrop-blur-xl transition-all hover:scale-110 hover:text-white active:scale-90"
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
  </button>
);

export default ProfileButton;
