import React, { FC, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/app/SEO';
import PlayPage from './PlayPage';

const QA = [
  { q: "What is Mappil?", a: "Mappil is an interactive 3D geography quiz game that helps you learn countries and regions around the world." },
  { q: "Is it free?", a: "Yes, Mappil is completely free to play." },
  { q: "Can I choose which continent to learn?", a: "Absolutely! You can practice the whole world or focus on specific regions like Europe, Africa, or Asia." }
];

const HomePage: FC = () => {
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
        title="Mappil - 3D Interactive World Geography Quiz" 
        description="Learn world geography with Mappil. An interactive 3D globe map quiz to test your knowledge of countries and continents."
        canonicalUrl="https://mappil.com/"
      />
      
      {/* Real users see the game immediately; react-snap skips it to prevent WebGL timeouts */}
      {showGame && <PlayPage />}

      {/* About Section Button */}
      {showGame && !showSEO && (
        <div className="fixed bottom-6 right-6 z-[100]">
          <button 
            onClick={() => setShowSEO(true)}
            className="w-14 h-14 flex items-center justify-center bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur border border-slate-600 rounded-full text-slate-200 shadow-xl transition-all"
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
        <div className={isSnap ? "py-12 px-4 flex flex-col items-center" : "fixed inset-0 z-40 bg-slate-900/95 backdrop-blur-md shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center py-12 px-4 overflow-y-auto"}>
          {!isSnap && (
            <div className="fixed bottom-6 right-6 z-[100]">
              <button 
                onClick={() => setShowSEO(false)}
                className="w-14 h-14 flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full text-slate-200 shadow-xl transition-all"
                aria-label="Close Info"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <main className="max-w-4xl w-full flex flex-col gap-12 mt-4 pb-20 text-slate-100">
            <header className="text-center space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-emerald-400">
                Mappil Geography Quiz
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto">
                Test your knowledge of the world with our interactive 3D globe. Find countries, build streaks, and learn geography intuitively.
              </p>
            </header>

            <section className="bg-slate-800/50 rounded-3xl p-8 backdrop-blur-sm border border-slate-700/50">
              <h2 className="text-2xl font-semibold mb-6 text-slate-200">Practice By Continent</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Link to="/africa-map-quiz" className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors">
                  <h3 className="font-bold text-lg">Africa Map Quiz</h3>
                  <p className="text-sm text-slate-400 mt-1">Practice identifying African countries.</p>
                </Link>
                <Link to="/asia-map-quiz" className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors">
                  <h3 className="font-bold text-lg">Asia Map Quiz</h3>
                  <p className="text-sm text-slate-400 mt-1">Test your knowledge of Asia.</p>
                </Link>
                <Link to="/europe-map-quiz" className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors">
                  <h3 className="font-bold text-lg">Europe Map Quiz</h3>
                  <p className="text-sm text-slate-400 mt-1">Find all the European nations.</p>
                </Link>
                <Link to="/north-america-map-quiz" className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors">
                  <h3 className="font-bold text-lg">North America Map Quiz</h3>
                  <p className="text-sm text-slate-400 mt-1">Learn North American geography.</p>
                </Link>
                <Link to="/south-america-map-quiz" className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors">
                  <h3 className="font-bold text-lg">South America Map Quiz</h3>
                  <p className="text-sm text-slate-400 mt-1">Identify South American countries.</p>
                </Link>
                <Link to="/oceania-map-quiz" className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors">
                  <h3 className="font-bold text-lg">Oceania Map Quiz</h3>
                  <p className="text-sm text-slate-400 mt-1">Master the regions of Oceania.</p>
                </Link>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-slate-200 text-center">Frequently Asked Questions</h2>
              <div className="space-y-4 max-w-3xl mx-auto">
                {QA.map((item, idx) => (
                  <div key={idx} className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/30">
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

export default HomePage;
