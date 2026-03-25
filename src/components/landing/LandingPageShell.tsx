'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import GameViewportClient from '../app/GameViewportClient';
import { LandingPageContent } from '../../lib/landingContent';

interface LandingPageShellProps {
  content: LandingPageContent;
}

const LandingPageShell = ({ content }: LandingPageShellProps) => {
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
    <div
      id="top"
      className="relative min-h-screen overflow-x-hidden selection:bg-blue-500/30"
    >
      <GameViewportClient {...content.gameProps} />

      <div className="relative z-0 min-h-screen pointer-events-none">
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
      </div>

      <div className="fixed bottom-6 right-6 z-30 pointer-events-auto">
        <button
          type="button"
          onClick={() => setShowAbout((current) => !current)}
          className="w-12 h-12 flex items-center justify-center bg-slate-800/85 hover:bg-slate-700/85 backdrop-blur border border-slate-600 rounded-full text-slate-200 shadow-xl transition-all"
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
          showAbout ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
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
          <div className="max-w-5xl mx-auto w-full flex flex-col gap-12 px-4 py-12 pb-20 text-slate-100">
            <div className="fixed top-6 right-6 z-50">
              <button
                type="button"
                onClick={() => setShowAbout(false)}
                className="w-12 h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full text-slate-200 shadow-xl transition-all"
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

            <header className="text-center space-y-6">
              {content.backLink && (
                <Link
                  href={content.backLink.href}
                  className="inline-flex text-blue-400 hover:text-blue-300 font-semibold tracking-wide uppercase text-sm"
                >
                  ← {content.backLink.label}
                </Link>
              )}
              {content.introEyebrow && (
                <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
                  {content.introEyebrow}
                </p>
              )}
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-blue-400 to-emerald-400 pb-2">
                {content.heading}
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                {content.intro}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Link
                  href={content.primaryCta.href}
                  className="inline-block px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-full font-bold text-lg shadow-lg shadow-amber-500/25 transition-transform hover:scale-105 active:scale-95"
                >
                  {content.primaryCta.label}
                </Link>
                {content.secondaryCta && (
                  <Link
                    href={content.secondaryCta.href}
                    className="inline-block px-8 py-4 bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-slate-100 rounded-full font-bold text-lg shadow-lg shadow-slate-950/30 transition-transform hover:scale-105 active:scale-95"
                  >
                    {content.secondaryCta.label}
                  </Link>
                )}
              </div>
            </header>

            {content.sections.map((section) => (
              <section
                key={section.title}
                className="flex flex-col gap-6 rounded-3xl border border-slate-700/50 bg-slate-900/60 p-8 shadow-2xl shadow-slate-950/20"
              >
                <h2 className="text-2xl md:text-3xl font-semibold text-slate-100">
                  {section.title}
                </h2>
                {section.text && (
                  <p className="text-slate-300 leading-relaxed max-w-3xl">
                    {section.text}
                  </p>
                )}
                {section.cards && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {section.cards.map((card) => (
                      <div
                        key={card.title}
                        className="rounded-3xl border border-slate-700/60 bg-slate-800/55 p-6 shadow-2xl shadow-slate-950/20"
                      >
                        <h3 className="text-xl font-semibold text-slate-100">
                          {card.title}
                        </h3>
                        <p className="mt-3 text-slate-300 leading-relaxed">
                          {card.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {section.tiles && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {section.tiles.map((tile) => (
                      <Link
                        key={tile.href}
                        href={tile.href}
                        className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                      >
                        <h3 className="font-bold text-lg">{tile.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">
                          {tile.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
                {section.faqs && (
                  <div className="space-y-4">
                    {section.faqs.map((faq) => (
                      <div
                        key={faq.q}
                        className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/30"
                      >
                        <h3 className="font-semibold text-lg text-slate-300">
                          {faq.q}
                        </h3>
                        <p className="text-slate-400 mt-2 leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}

            <footer className="border-t border-slate-800 pt-8 text-center text-slate-500">
              <p>
                <button
                  type="button"
                  onClick={() => setShowAbout(false)}
                  className="text-blue-400 hover:underline"
                >
                  Back to the game
                </button>
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LandingPageShell;
