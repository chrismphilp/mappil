import Link from 'next/link';
import GameViewportClient from '../app/GameViewportClient';
import LandingAboutPanel from './LandingAboutPanel';
import type { LandingPageContent } from '../../lib/landingContent';

interface LandingPageShellProps {
  content: LandingPageContent;
}

const LandingPageShell = ({ content }: LandingPageShellProps) => {
  return (
    <div
      id="top"
      className="relative min-h-screen overflow-x-hidden selection:bg-blue-500/30"
    >
      <GameViewportClient {...content.gameProps} />

      <div className="pointer-events-none relative z-0 min-h-screen">
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
      </div>

      <LandingAboutPanel>
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
          <h1 className="bg-gradient-to-br from-cyan-300 via-blue-400 to-emerald-400 bg-clip-text pb-2 text-5xl font-bold tracking-tight text-transparent md:text-7xl">
            {content.heading}
          </h1>
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-slate-300 md:text-2xl">
            {content.intro}
          </p>
          <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
            <Link
              href={content.primaryCta.href}
              className="inline-block rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-amber-500/25 transition-transform hover:scale-105 hover:from-amber-400 hover:to-orange-400 active:scale-95"
            >
              {content.primaryCta.label}
            </Link>
            {content.secondaryCta && (
              <Link
                href={content.secondaryCta.href}
                className="inline-block rounded-full border border-slate-600 bg-slate-800/90 px-8 py-4 text-lg font-bold text-slate-100 shadow-lg shadow-slate-950/30 transition-transform hover:scale-105 hover:bg-slate-700 active:scale-95"
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
            <h2 className="text-2xl font-semibold text-slate-100 md:text-3xl">
              {section.title}
            </h2>
            {section.text && (
              <p className="max-w-3xl leading-relaxed text-slate-300">
                {section.text}
              </p>
            )}
            {section.cards && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {section.cards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-3xl border border-slate-700/60 bg-slate-800/55 p-6 shadow-2xl shadow-slate-950/20"
                  >
                    <h3 className="text-xl font-semibold text-slate-100">
                      {card.title}
                    </h3>
                    <p className="mt-3 leading-relaxed text-slate-300">
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {section.tiles && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {section.tiles.map((tile) => (
                  <Link
                    key={tile.href}
                    href={tile.href}
                    className="rounded-xl border border-slate-700 bg-slate-800 p-4 transition-colors hover:bg-slate-700"
                  >
                    <h3 className="text-lg font-bold">{tile.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">
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
                    className="rounded-2xl border border-slate-700/30 bg-slate-800/30 p-6"
                  >
                    <h3 className="text-lg font-semibold text-slate-300">
                      {faq.q}
                    </h3>
                    <p className="mt-2 leading-relaxed text-slate-400">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </LandingAboutPanel>
    </div>
  );
};

export default LandingPageShell;
