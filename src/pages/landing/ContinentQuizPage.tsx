import React, { FC, useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { SEO } from '../../components/app/SEO';
import { ContinentFilter } from '../../types/game.types';
import PlayPage from '../app/PlayPage';

const QUIZ_DATA: Record<string, { title: string; continent: ContinentFilter; desc: string; faq: {q: string, a: string}[] }> = {
  'world-map-quiz': {
    title: 'World',
    continent: ContinentFilter.WORLD,
    desc: 'Test your knowledge on countries all over the globe.',
    faq: [
      { q: 'How many countries are in the world quiz?', a: 'The world quiz includes sovereign states across all continents.' },
      { q: 'Can I change the difficulty?', a: 'Yes! You can choose Easy, Medium, or Hard modes before or during the quiz.' }
    ]
  },
  'africa-map-quiz': {
    title: 'Africa',
    continent: ContinentFilter.AFRICA,
    desc: 'Practice identifying the diverse countries of Africa.',
    faq: [
      { q: 'What does the Africa map quiz cover?', a: 'It covers the fully recognized sovereign nations across the African continent.' },
      { q: 'Is there a time limit?', a: 'No time limit! Take your time to find each country on the 3D globe.' }
    ]
  },
  'asia-map-quiz': {
    title: 'Asia',
    continent: ContinentFilter.ASIA,
    desc: 'Find all the nations within the vast continent of Asia.',
    faq: [
      { q: 'Does this include the Middle East?', a: 'Yes, countries in Western Asia (frequently referred to as the Middle East) are included in the Asia map quiz.' }
    ]
  },
  'europe-map-quiz': {
    title: 'Europe',
    continent: ContinentFilter.EUROPE,
    desc: 'Master the geography of Europe, from Portugal to the Urals.',
    faq: [
      { q: 'Are microstates included?', a: 'Depending on the difficulty setting, smaller nations like Monaco or Andorra may be included or excluded.' }
    ]
  },
  'north-america-map-quiz': {
    title: 'North America',
    continent: ContinentFilter.NORTH_AMERICA,
    desc: 'Learn the countries of North America, including Central America and the Caribbean.',
    faq: [
      { q: 'Does this quiz include the Caribbean islands?', a: 'Yes, the North America quiz includes sovereign island nations in the Caribbean.' }
    ]
  },
  'south-america-map-quiz': {
    title: 'South America',
    continent: ContinentFilter.SOUTH_AMERICA,
    desc: 'Identify the countries of South America on our interactive globe.',
    faq: [
      { q: 'How many countries are in South America?', a: 'There are generally 12 sovereign states forming South America which are featured in this quiz.' }
    ]
  },
  'oceania-map-quiz': {
    title: 'Oceania',
    continent: ContinentFilter.OCEANIA,
    desc: 'Test your knowledge of Australia, New Zealand, and Pacific island nations.',
    faq: [
      { q: 'What regions are in Oceania?', a: 'Oceania encompasses Australasia, Melanesia, Micronesia, and Polynesia.' }
    ]
  }
};

const ContinentQuizPage: FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  
  const isSnap = typeof window !== 'undefined' && window.navigator.userAgent.includes('ReactSnap');
  const [showSEO, setShowSEO] = useState(isSnap);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!quizId || !QUIZ_DATA[quizId]) {
    return <Navigate to="/" replace />;
  }

  const { title, continent, desc, faq } = QUIZ_DATA[quizId];
  const urlParam = encodeURIComponent(continent);
  const showGame = mounted && !isSnap;

  return (
    <div className={`relative w-full overflow-x-hidden selection:bg-blue-500/30 ${isSnap ? 'bg-slate-900 min-h-screen text-slate-100' : ''}`}>
      <SEO 
        title={`${title} Map Quiz - Play Mappil 3D Geography Game`}
        description={desc}
        canonicalUrl={`https://mappil.com/${quizId}`}
      />

      {/* Real users see the game immediately; react-snap skips it to prevent WebGL timeouts */}
      {showGame && <PlayPage continent={continent} />}

      {/* About Section Button */}
      {showGame && (
        <div className="fixed bottom-6 right-6 z-50">
          <button 
            onClick={() => setShowSEO(!showSEO)}
            className="px-6 py-3 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur border border-slate-600 rounded-full text-slate-200 shadow-xl transition-all font-semibold"
          >
            {showSEO ? 'Close' : 'About'}
          </button>
        </div>
      )}

      {(showSEO || isSnap) && (
        <div className={isSnap ? "py-12 px-4 flex flex-col items-center" : "fixed inset-0 z-40 bg-slate-900/95 backdrop-blur-md shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center py-12 px-4 overflow-y-auto"}>
          <main className="max-w-4xl mx-auto w-full space-y-12 mt-10 pb-20 text-slate-100">
            <header className="text-center space-y-6">
              <Link to="/" className="text-blue-400 hover:text-blue-300 font-semibold tracking-wide uppercase text-sm">
                ← Back to Home
              </Link>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-emerald-400">
                {title} Map Quiz
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                {desc}
              </p>
            </header>

            <section className="bg-slate-800/60 rounded-3xl p-8 md:p-12 border border-slate-700/50 shadow-2xl text-center">
              <h2 className="text-2xl font-bold mb-4 text-slate-200">Play the {title} Map Quiz</h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Find the countries of {title} on our interactive 3D globe. Use the in-game settings to adjust the difficulty from Easy to Hard.
              </p>
              {!showGame && (
                <Link 
                  to={`/play?continent=${urlParam}&mode=Quick%20Play&difficulty=Medium`}
                  className="inline-block px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold text-lg transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
                >
                  Start {title} Quiz
                </Link>
              )}
            </section>

            {faq.length > 0 && (
              <section className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold mb-6 text-slate-200 text-center">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {faq.map((item, idx) => (
                    <div key={idx} className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/30">
                      <h3 className="font-semibold text-lg text-slate-300">{item.q}</h3>
                      <p className="text-slate-400 mt-2 leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="border-t border-slate-800 pt-8 mt-12 text-center text-slate-500">
              <p>Looking for other regions? Visit the <Link to="/" className="text-blue-400 hover:underline">homepage</Link> to explore more map quizzes.</p>
            </section>
          </main>
        </div>
      )}
    </div>
  );
};

export default ContinentQuizPage;
