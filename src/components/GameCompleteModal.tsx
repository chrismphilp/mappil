import { FC, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface GameCompleteModalProps {
  open: boolean;
  score: number;
  errors: number;
  bestStreak: number;
  totalRegions: number;
  onPlayAgain: () => void;
}

const GameCompleteModal: FC<GameCompleteModalProps> = ({
  open,
  score,
  errors,
  bestStreak,
  totalRegions,
  onPlayAgain,
}) => {
  useEffect(() => {
    if (open) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#34d399', '#38bdf8', '#fbbf24', '#f472b6', '#a78bfa'],
      });
    }
  }, [open]);

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

            <div className="grid grid-cols-3 gap-4 mb-8">
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
