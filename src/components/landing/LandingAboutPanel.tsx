'use client';

import { type ReactNode, useEffect, useState } from 'react';

interface LandingAboutPanelProps {
  children: ReactNode;
}

const LandingAboutPanel = ({ children }: LandingAboutPanelProps) => {
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    if (!showAbout || typeof document === 'undefined') {
      return;
    }

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [showAbout]);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-30 pointer-events-auto">
        <button
          type="button"
          onClick={() => setShowAbout((current) => !current)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-600 bg-slate-800/85 text-slate-200 shadow-xl backdrop-blur transition-all hover:bg-slate-700/85"
          aria-label={showAbout ? 'Close About Mappil' : 'About Mappil'}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {showAbout ? (
              <>
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </>
            ) : (
              <>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </>
            )}
          </svg>
        </button>
      </div>

      <div
        className={`fixed inset-0 z-40 transition-opacity duration-200 ${
          showAbout ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div
          className="absolute inset-0 bg-slate-950/78 backdrop-blur-md"
          onClick={() => setShowAbout(false)}
        />
        <main
          id="about"
          className="absolute inset-0 overflow-y-auto overscroll-contain border-t border-slate-800 bg-slate-950/96 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-12 pb-20 text-slate-100">
            <div className="sticky top-[max(var(--sat),1rem)] z-50 flex justify-end pr-[max(var(--sar),0px)] sm:fixed sm:right-6 sm:top-6 sm:pr-0">
              <button
                type="button"
                onClick={() => setShowAbout(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-slate-200 shadow-xl transition-all hover:bg-slate-700 sm:h-12 sm:w-12"
                aria-label="Close About Mappil"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {children}

            <footer className="border-t border-slate-800 pt-8 text-center text-slate-500">
              <button
                type="button"
                onClick={() => setShowAbout(false)}
                className="text-blue-400 hover:underline"
              >
                Back to the game
              </button>
            </footer>
          </div>
        </main>
      </div>
    </>
  );
};

export default LandingAboutPanel;
