import { FC, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { submitScore } from '../../lib/leaderboard';
import { useIsMobileViewport } from '../../hooks/useIsMobileViewport';
import { createFriendChallenge } from '../../lib/friendChallenge';
import { shareChallengeLink } from '../../lib/share';
import { ContinentFilter, Difficulty, GameMode, ChallengeType, ShareState, SubmitState } from '../../types/game.types';

interface GameCompleteModalProps {
  open: boolean;
  score: number;
  errors: number;
  bestStreak: number;
  totalRegions: number;
  difficulty: Difficulty;
  continent: ContinentFilter;
  gameMode: GameMode;
  durationSecs: number;
  challengeId?: string;
  challengeType?: ChallengeType;
  seed?: string;
  isDailyChallenge?: boolean;
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
  gameMode,
  durationSecs,
  challengeId,
  challengeType,
  seed,
  isDailyChallenge,
  onPlayAgain,
}) => {
  const [username, setUsername] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '');
  const [submitState, setSubmitState] = useState<SubmitState>(SubmitState.IDLE);
  const [errorMsg, setErrorMsg] = useState('');
  const [shareState, setShareState] = useState<ShareState>(ShareState.IDLE);
  const { isCoarsePointer } = useIsMobileViewport();

  useEffect(() => {
    if (open) {
      setSubmitState(SubmitState.IDLE);
      setShareState(ShareState.IDLE);
      setErrorMsg('');
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({
          particleCount: isCoarsePointer ? 75 : 150,
          spread: isCoarsePointer ? 70 : 100,
          origin: { y: 0.5 },
          colors: ['#34d399', '#38bdf8', '#fbbf24', '#f472b6', '#a78bfa'],
        });
      });
    }
  }, [open, isCoarsePointer]);

  const handleSubmit = async () => {
    const trimmed = username.trim();
    if (trimmed.length < 3 || trimmed.length > 20) {
      setErrorMsg('Username must be 3-20 characters');
      return;
    }

    localStorage.setItem(STORAGE_KEY, trimmed);
    setSubmitState(SubmitState.SUBMITTING);
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
        game_mode: gameMode,
        duration_secs: durationSecs,
        challenge_id: challengeId,
        seed,
        is_daily_challenge: isDailyChallenge,
      });
      setSubmitState(SubmitState.SUBMITTED);
    } catch (e: any) {
      setSubmitState(SubmitState.ERROR);
      setErrorMsg(e.message ?? 'Failed to submit score');
    }
  };

  const handleShareChallenge = async () => {
    const trimmed = username.trim();
    if (trimmed.length < 3 || trimmed.length > 20) {
      setErrorMsg('Please set a username (3-20 chars) to challenge a friend.');
      return;
    }

    localStorage.setItem(STORAGE_KEY, trimmed);
    setShareState(ShareState.SHARING);
    setErrorMsg('');

    try {
      // If we are already in a friend challenge, share the same ID. Otherwise create one.
      let shareId = challengeId;
      if (challengeType !== ChallengeType.FRIEND) {
        shareId = await createFriendChallenge(trimmed, difficulty, continent, gameMode);
      }

      if (!shareId) throw new Error('Failed to resolve challenge ID');

      const url = `${window.location.origin}/play?challenge=${encodeURIComponent(shareId)}`;
      const title = 'Mappil Friend Challenge';
      const text = `I scored ${score}/${totalRegions} in Mappil (${continent} - ${difficulty}). Can you beat me?`;

      const success = await shareChallengeLink(title, text, url);
      setShareState(success ? ShareState.SHARED : ShareState.ERROR);
      if (!success) {
        setErrorMsg('Failed to copy to clipboard.');
      }
    } catch (e: any) {
      setShareState(ShareState.ERROR);
      setErrorMsg(e.message ?? 'Failed to create challenge link.');
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
            className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 max-w-sm w-[90vw] max-h-[90dvh] overflow-y-auto text-center shadow-2xl"
          >
            {isDailyChallenge && (
              <div className="mb-4 inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                Daily Challenge Complete
              </div>
            )}
            {challengeType === ChallengeType.FRIEND && (
              <div className="mb-4 inline-block px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                Friend Challenge Complete
              </div>
            )}
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Game Complete!</h2>
            <p className="text-slate-400 text-sm mb-5 sm:mb-6">
              You explored {totalRegions} countries
            </p>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-emerald-400">{score}</div>
                <div className="text-[10px] sm:text-xs text-slate-400 uppercase">Score</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-red-400">{errors}</div>
                <div className="text-[10px] sm:text-xs text-slate-400 uppercase">Errors</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-amber-400">{bestStreak}</div>
                <div className="text-[10px] sm:text-xs text-slate-400 uppercase">Best Streak</div>
              </div>
            </div>

            {submitState !== SubmitState.SUBMITTED && (
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
                  disabled={submitState === SubmitState.SUBMITTING}
                  className="w-full py-2 rounded-xl bg-cyan-500/20 text-cyan-400 font-semibold text-sm hover:bg-cyan-500/30 disabled:opacity-50 transition-colors"
                >
                  {submitState === SubmitState.SUBMITTING ? 'Submitting...' : 'Submit Score'}
                </button>
              </div>
            )}

            {submitState === SubmitState.SUBMITTED && (
              <p className="text-emerald-400 text-sm mb-6">Score submitted!</p>
            )}

            <div className="flex flex-col gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onPlayAgain}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
              >
                {challengeType === ChallengeType.FRIEND ? 'Rematch Challenge' : 'Play Again'}
              </motion.button>

              {!isDailyChallenge && (
                <button
                  onClick={handleShareChallenge}
                  disabled={shareState === ShareState.SHARING}
                  className={`w-full py-3 rounded-xl border font-semibold transition-colors flex items-center justify-center gap-2 ${
                    shareState === ShareState.SHARED 
                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                      : 'bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30 text-purple-400'
                  }`}
                >
                  {shareState === ShareState.SHARING ? 'Generating...' : shareState === ShareState.SHARED ? 'Link Copied!' : 'Challenge a Friend'}
                </button>
              )}

              {(isDailyChallenge || challengeType === ChallengeType.FRIEND) && (
                <a 
                  href="/"
                  className="block w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors mt-1"
                >
                  Back to Free Play
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameCompleteModal;
