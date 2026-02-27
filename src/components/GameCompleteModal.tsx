import { FC, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { submitScore } from '../lib/leaderboard';

interface GameCompleteModalProps {
  open: boolean;
  score: number;
  errors: number;
  bestStreak: number;
  totalRegions: number;
  difficulty: string;
  continent: string;
  durationSecs: number;
  onPlayAgain: () => void;
}

const STORAGE_KEY = 'mappil_username';

const GameCompleteModal: FC<GameCompleteModalProps> = ({
  open,
  score,
  errors,
  bestStreak,
  totalRegions,
  difficulty,
  continent,
  durationSecs,
  onPlayAgain,
}) => {
  const [username, setUsername] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '');
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (open) {
      setSubmitState('idle');
      setErrorMsg('');
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#34d399', '#38bdf8', '#fbbf24', '#f472b6', '#a78bfa'],
      });
    }
  }, [open]);

  const handleSubmit = async () => {
    const trimmed = username.trim();
    if (trimmed.length < 3 || trimmed.length > 20) {
      setErrorMsg('Username must be 3-20 characters');
      return;
    }

    localStorage.setItem(STORAGE_KEY, trimmed);
    setSubmitState('submitting');
    setErrorMsg('');

    try {
      await submitScore({
        username: trimmed,
        score,
        errors,
        best_streak: bestStreak,
        total_regions: totalRegions,
        difficulty,
        continent,
        duration_secs: durationSecs,
      });
      setSubmitState('submitted');
    } catch (e: any) {
      setSubmitState('error');
      setErrorMsg(e.message ?? 'Failed to submit score');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 max-w-sm w-[90vw] text-center shadow-2xl"
          >
            <h2 className="text-3xl font-black text-white mb-2">Game Complete!</h2>
            <p className="text-slate-400 text-sm mb-6">
              You explored {totalRegions} countries
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-2xl font-bold text-emerald-400">{score}</div>
                <div className="text-xs text-slate-400 uppercase">Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">{errors}</div>
                <div className="text-xs text-slate-400 uppercase">Errors</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400">{bestStreak}</div>
                <div className="text-xs text-slate-400 uppercase">Best Streak</div>
              </div>
            </div>

            {submitState !== 'submitted' && (
              <div className="mb-6">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  maxLength={20}
                  className="w-full px-4 py-2 rounded-xl bg-slate-800/80 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 mb-2"
                />
                {errorMsg && (
                  <p className="text-red-400 text-xs mb-2">{errorMsg}</p>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={submitState === 'submitting'}
                  className="w-full py-2 rounded-xl bg-cyan-500/20 text-cyan-400 font-medium text-sm hover:bg-cyan-500/30 disabled:opacity-50 transition-colors"
                >
                  {submitState === 'submitting' ? 'Submitting...' : 'Submit Score'}
                </button>
              </div>
            )}

            {submitState === 'submitted' && (
              <p className="text-emerald-400 text-sm mb-6">Score submitted!</p>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPlayAgain}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
            >
              Play Again
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameCompleteModal;
