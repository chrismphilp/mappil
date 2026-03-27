import { FC, useEffect, useRef } from 'react';
import { useIsMobileViewport } from '../../hooks/useIsMobileViewport';
import { FeedbackState } from '../../types/game.types';
import { getStreakState } from '../../lib/scoring';

interface FeedbackOverlayProps {
  feedback: FeedbackState | null;
  currentGuessErrors: number;
}

const POSITIVE_COPY = {
  cold: ['Clean hit', 'Nice pick', 'Locked in'],
  warm: ['Warm streak', 'Stacking it', 'Sharp work'],
  hot: ['Hot streak', 'Still rolling', 'Keep the pressure'],
  on_fire: ['On fire', 'No slowdown', 'Pressure cooking'],
  legendary: ['Legendary', 'Map machine', 'Untouchable'],
};

const FeedbackOverlay: FC<FeedbackOverlayProps> = ({ feedback, currentGuessErrors }) => {
  const revisionRef = useRef(0);
  const { isCoarsePointer } = useIsMobileViewport();

  useEffect(() => {
    if (feedback) {
      revisionRef.current += 1;
    }
  }, [feedback]);

  useEffect(() => {
    if (!feedback || feedback.outcome !== 'correct' || feedback.streak < 4) {
      return;
    }

    const intensity = Math.min(feedback.streak * 0.03, isCoarsePointer ? 0.22 : 0.4);
    const particleCountBase = isCoarsePointer ? 18 : 34;
    const particleCountMultiplier = isCoarsePointer ? 4 : 8;

    import('canvas-confetti').then(({ default: confetti }) => {
      confetti({
        particleCount: particleCountBase + feedback.streak * particleCountMultiplier,
        spread: 58 + feedback.streak * 4,
        origin: { y: 0.28 },
        colors: ['#34d399', '#38bdf8', '#fbbf24', '#fb7185'],
        scalar: 0.84 + intensity,
      });
    });
  }, [feedback, isCoarsePointer]);

  if (!feedback) {
    return null;
  }

  const streakState = getStreakState(feedback.streak);
  const positiveIndex = revisionRef.current % POSITIVE_COPY[streakState.key].length;
  const remainingTries = Math.max(0, 3 - currentGuessErrors);

  let title = 'Miss';
  let subtitle =
    remainingTries === 1 ? 'One more try on this one' : `${remainingTries} more tries on this one`;
  let titleClassName = 'text-red-400';

  if (feedback.outcome === 'correct') {
    titleClassName = 'text-emerald-400';

    if (feedback.wasThirdTrySave) {
      title = 'Clutch save';
      subtitle = 'You kept the run alive';
    } else if (feedback.wasFirstTry) {
      title = POSITIVE_COPY[streakState.key][positiveIndex];
      subtitle =
        streakState.key === 'cold' ? 'First try points secured' : `${streakState.label} streak`;
    } else {
      title = 'Recovered';
      subtitle = 'Still banked the answer';
    }
  }

  if (feedback.outcome === 'skip') {
    title = 'Skipping ahead';
    subtitle = feedback.skippedRegion ?? 'Moving on to the next country';
    titleClassName = 'text-amber-400';
  }

  return (
    <div
      key={`feedback-${revisionRef.current}`}
      className="fixed left-1/2 top-[38%] z-30 -translate-x-1/2 pointer-events-none sm:top-1/3"
    >
      <div className="min-w-[13rem] rounded-3xl border border-white/10 bg-slate-950/70 px-6 py-4 text-center shadow-2xl backdrop-blur-xl">
        <span className={`block text-3xl font-bold drop-shadow-2xl sm:text-4xl ${titleClassName}`}>
          {title}
        </span>
        <span className="mt-1 block text-sm font-medium text-slate-200/90 sm:text-base">
          {subtitle}
        </span>
        {feedback.scoreDelta > 0 && (
          <span className="mt-2 block text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300 sm:text-sm">
            +{feedback.scoreDelta} points
          </span>
        )}
      </div>
    </div>
  );
};

export default FeedbackOverlay;
