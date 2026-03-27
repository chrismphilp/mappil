import { FC } from 'react';

const QuitChallengeButton: FC = () => (
  <a
    href="/"
    className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-slate-900/70 text-slate-300 shadow-xl backdrop-blur-xl transition-all hover:scale-110 hover:text-red-400 active:scale-90"
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
  </a>
);

export default QuitChallengeButton;
