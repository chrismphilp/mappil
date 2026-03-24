import React, { FC, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/app/SEO';
import PlayPage from '../app/PlayPage';

const PLAY_STYLES = [
  {
    title: 'World Quick Play',
    description: 'Jump into a shorter run to learn the map faster and keep retrying without waiting for the globe to reload.',
  },
  {
    title: 'Full Game',
    description: 'Play a longer world map game when you want broader country coverage and bigger score swings.',
  },
  {
    title: 'Daily And Friend Challenges',
    description: 'Use shared seeds, streaks, and leaderboard runs to turn geography practice into repeatable competition.',
  },
];

const CONTINENT_LINKS = [
  {
    href: '/world-map-quiz',
    title: 'World Map Quiz',
    description: 'Play the full world map and learn countries from every continent.',
  },
  {
    href: '/africa-map-quiz',
    title: 'Africa Map Game',
    description: 'Focus on African countries and build recognition faster.',
  },
  {
    href: '/asia-map-quiz',
    title: 'Asia Map Game',
    description: 'Practice Asia with the same 3D globe and difficulty controls.',
  },
  {
    href: '/europe-map-quiz',
    title: 'Europe Map Game',
    description: 'Use Europe runs for dense-country practice and faster repetitions.',
  },
  {
    href: '/north-america-map-quiz',
    title: 'North America Map Game',
    description: 'Cover North America, Central America, and the Caribbean.',
  },
  {
    href: '/south-america-map-quiz',
    title: 'South America Map Game',
    description: 'Rehearse South American countries on the rotating globe.',
  },
  {
    href: '/oceania-map-quiz',
    title: 'Oceania Map Game',
    description: 'Learn Australia, New Zealand, and Pacific island nations.',
  },
];

const QA = [
  {
    q: 'What kind of map game is Mappil?',
    a: 'Mappil is a free 3D world map game that also works as a geography quiz. You spin the globe, select countries, and replay runs with different regions, difficulties, and challenge modes.',
  },
  {
    q: 'Can I practice one region instead of the whole world?',
    a: 'Yes. You can filter to Africa, Asia, Europe, North America, South America, or Oceania and keep the same controls and scoring system.',
  },
  {
    q: 'Is this map game good for repeat practice?',
    a: 'Yes. Quick Play, Full Game, daily challenges, friend challenges, streaks, and score breakdowns all make it easier to replay with a clear improvement target.',
  },
];

const MapGamePage: FC = () => {
  const isSnap = typeof window !== 'undefined' && window.navigator.userAgent.includes('ReactSnap');
  const [showSEO, setShowSEO] = useState(isSnap);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showGame = mounted && !isSnap;

  return (
    <div className={`relative w-full overflow-x-hidden selection:bg-blue-500/30 ${isSnap ? 'bg-slate-900 min-h-screen text-slate-100' : ''}`}>
      <SEO
        title="Free 3D World Map Game | Play Mappil Online"
        description="Play a free 3D world map game with continent filters, difficulty levels, daily challenges, and replayable geography practice."
        canonicalUrl="https://mappil.com/map-game"
      />

      {showGame && <PlayPage suppressSEO />}

      {showGame && !showSEO && (
        <div className="fixed bottom-6 right-6 z-[100]">
          <button
            onClick={() => setShowSEO(true)}
            className="w-12 h-12 flex items-center justify-center bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur border border-slate-600 rounded-full text-slate-200 shadow-xl transition-all"
            aria-label="About Mappil"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </button>
        </div>
      )}

      {(showSEO || isSnap) && (
        <div className={isSnap ? 'py-12 px-4 flex flex-col items-center' : 'fixed inset-0 z-40 bg-slate-900/95 backdrop-blur-md shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center py-12 px-4 overflow-y-auto'}>
          {!isSnap && (
            <div className="fixed top-6 right-6 z-[100]">
              <button
                onClick={() => setShowSEO(false)}
                className="w-12 h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full text-slate-200 shadow-xl transition-all"
                aria-label="Close Info"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <main className="max-w-5xl w-full flex flex-col gap-12 mt-4 pb-20 text-slate-100">
            <header className="text-center space-y-6">
              <Link to="/" className="text-blue-400 hover:text-blue-300 font-semibold tracking-wide uppercase text-sm">
                ← Back to Home
              </Link>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-blue-400 to-emerald-400 pb-2">
                Free 3D World Map Game
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Mappil is a map game for learning countries through repeat play, not a static worksheet. Spin the globe, switch regions and difficulty in real time, and replay runs with clear score targets.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Link
                  to="/play?daily=true"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-full font-bold text-lg shadow-lg shadow-amber-500/25 transition-transform hover:scale-105 active:scale-95"
                >
                  Play Daily Challenge
                </Link>
                <Link
                  to="/world-map-quiz"
                  className="inline-block px-8 py-4 bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-slate-100 rounded-full font-bold text-lg shadow-lg shadow-slate-950/30 transition-transform hover:scale-105 active:scale-95"
                >
                  Start World Practice
                </Link>
              </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLAY_STYLES.map((style) => (
                <div key={style.title} className="rounded-3xl border border-slate-700/60 bg-slate-800/55 p-6 shadow-2xl shadow-slate-950/20">
                  <h2 className="text-xl font-semibold text-slate-100">{style.title}</h2>
                  <p className="mt-3 text-slate-300 leading-relaxed">{style.description}</p>
                </div>
              ))}
            </section>

            <section className="bg-slate-800/50 rounded-3xl p-8 backdrop-blur-sm border border-slate-700/50">
              <h2 className="text-2xl font-semibold mb-3 text-slate-200">Choose The Region You Want To Learn</h2>
              <p className="text-slate-300 max-w-3xl leading-relaxed mb-6">
                The same interactive game can be narrowed to a single continent when you want faster repetition. That makes Mappil useful both as a broad world map game and as focused geography practice for one region at a time.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {CONTINENT_LINKS.map((link) => (
                  <Link key={link.href} to={link.href} className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors">
                    <h3 className="font-bold text-lg">{link.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{link.description}</p>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-6 text-slate-200 text-center">Frequently Asked Questions</h2>
              <div className="space-y-4 max-w-3xl mx-auto">
                {QA.map((item) => (
                  <div key={item.q} className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/30">
                    <h3 className="font-semibold text-lg text-slate-300">{item.q}</h3>
                    <p className="text-slate-400 mt-2 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      )}
    </div>
  );
};

export default MapGamePage;
