import { FC, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface FeedbackOverlayProps {
  lastAnswerCorrect: boolean | null;
  streak: number;
  skippedRegion: string | null;
}

const FeedbackOverlay: FC<FeedbackOverlayProps> = ({ lastAnswerCorrect, streak, skippedRegion }) => {
  const revisionRef = useRef(0);
  useEffect(() => {
    if (lastAnswerCorrect !== null) revisionRef.current += 1;
  }, [lastAnswerCorrect, streak, skippedRegion]);

  useEffect(() => {
    if (lastAnswerCorrect && streak >= 3) {
      const intensity = Math.min(streak * 0.03, 0.4);
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({
          particleCount: 40 + streak * 10,
          spread: 60 + streak * 5,
          origin: { y: 0.3 },
          colors: ['#34d399', '#38bdf8', '#fbbf24', '#f472b6'],
          scalar: 0.8 + intensity,
        });
      });
    }
  }, [lastAnswerCorrect, streak]);

  return (
    <AnimatePresence>
      {lastAnswerCorrect !== null && (
        <motion.div
          key={`feedback-${revisionRef.current}`}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.2, y: -30 }}
          transition={{ duration: 0.25 }}
          className="fixed top-1/3 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
        >
          {skippedRegion ? (
            <span className="text-center">
              <span className="block text-4xl sm:text-5xl font-bold drop-shadow-2xl text-amber-400">
                Skipped
              </span>
              <span className="block text-lg sm:text-xl font-semibold text-amber-300/80 mt-1">
                {skippedRegion}
              </span>
            </span>
          ) : (
            <span
              className={`text-4xl sm:text-5xl font-bold drop-shadow-2xl ${
                lastAnswerCorrect ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {lastAnswerCorrect ? 'Correct!' : 'Wrong!'}
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackOverlay;
