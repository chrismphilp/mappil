import { FC, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { describeRuleset } from '../../lib/ruleset';
import { shareChallengeLink } from '../../lib/share';
import { usePlayerProfile } from '../../hooks/usePlayerProfile';
import { useIsMobileViewport } from '../../hooks/useIsMobileViewport';
import { ContinentFilter, Difficulty, GameMode, ShareState } from '../../types/game.types';
import OptionSelector from './OptionSelector';

const CONTINENT_OPTIONS: ContinentFilter[] = [
  ContinentFilter.WORLD,
  ContinentFilter.AFRICA,
  ContinentFilter.ASIA,
  ContinentFilter.EUROPE,
  ContinentFilter.NORTH_AMERICA,
  ContinentFilter.SOUTH_AMERICA,
  ContinentFilter.OCEANIA,
];

const CONTINENT_LABELS: Record<ContinentFilter, string> = {
  [ContinentFilter.WORLD]: 'World',
  [ContinentFilter.AFRICA]: 'Africa',
  [ContinentFilter.ASIA]: 'Asia',
  [ContinentFilter.EUROPE]: 'Europe',
  [ContinentFilter.NORTH_AMERICA]: 'N. America',
  [ContinentFilter.SOUTH_AMERICA]: 'S. America',
  [ContinentFilter.OCEANIA]: 'Oceania',
};

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  difficulty: Difficulty;
  continent: ContinentFilter;
  gameMode: GameMode;
  onChangeDifficulty: (difficulty: Difficulty) => void;
  onChangeContinent: (continent: ContinentFilter) => void;
  onChangeGameMode: (gameMode: GameMode) => void;
  onReset: () => void;
}

const SettingsPanel: FC<SettingsPanelProps> = ({
  open,
  onClose,
  difficulty,
  continent,
  gameMode,
  onChangeDifficulty,
  onChangeContinent,
  onChangeGameMode,
  onReset,
}) => {
  const { isMobile } = useIsMobileViewport();
  const { profile, refreshProfile, updateUsername, clearProfile } = usePlayerProfile();
  const [shareState, setShareState] = useState<ShareState>(ShareState.IDLE);
  const [usernameInput, setUsernameInput] = useState(profile.username);

  useEffect(() => {
    if (open) {
      const nextProfile = refreshProfile();
      setUsernameInput(nextProfile.username);
    }
  }, [open, refreshProfile]);

  useEffect(() => {
    if (!open || typeof document === 'undefined') {
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
  }, [open]);

  const favoriteRuleset = useMemo(() => {
    if (!profile.summary.favoriteRulesetKey) {
      return null;
    }

    return profile.personalBests[profile.summary.favoriteRulesetKey] ?? null;
  }, [profile.personalBests, profile.summary.favoriteRulesetKey]);

  const handleCreateChallenge = async () => {
    const trimmed = usernameInput.trim();

    if (trimmed.length < 3 || trimmed.length > 20) {
      alert('Set a username between 3 and 20 characters before creating a challenge.');
      return;
    }

    updateUsername(trimmed);
    setShareState(ShareState.SHARING);

    try {
      const { createFriendChallenge } = await import('../../lib/friendChallenge');
      const shareId = await createFriendChallenge(trimmed, difficulty, continent, gameMode);
      const url = `${window.location.origin}/play?challenge=${encodeURIComponent(shareId)}`;
      const title = 'Mappil Friend Challenge';
      const text = `I set up a ${continent} ${gameMode} ${difficulty} challenge on Mappil. Can you beat my run?`;

      const success = await shareChallengeLink(title, text, url);
      if (success) {
        setShareState(ShareState.SHARED);
        setTimeout(() => setShareState(ShareState.IDLE), 3000);
      } else {
        setShareState(ShareState.IDLE);
      }
    } catch (error) {
      console.error(error);
      setShareState(ShareState.ERROR);
      alert(error instanceof Error ? error.message : 'Failed to create challenge link.');
      setTimeout(() => setShareState(ShareState.IDLE), 3000);
    }
  };

  const handleSaveUsername = () => {
    const trimmed = usernameInput.trim();
    if (trimmed.length > 0 && (trimmed.length < 3 || trimmed.length > 20)) {
      alert('Username must be 3-20 characters.');
      return;
    }

    updateUsername(trimmed);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <motion.div
            initial={isMobile ? { y: '100%', opacity: 0 } : { x: -320, opacity: 0 }}
            animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
            exit={isMobile ? { y: '100%', opacity: 0 } : { x: -320, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={
              isMobile
                ? 'fixed bottom-0 left-0 right-0 z-50 flex h-[85dvh] flex-col overflow-hidden'
                : 'fixed left-0 top-0 bottom-0 z-50 w-[26rem] max-w-[calc(100vw-3rem)] overflow-hidden'
            }
          >
            <div
              className={
                isMobile
                  ? 'min-h-0 flex-1 rounded-t-3xl border-t border-white/10 bg-slate-900 p-6 flex flex-col gap-6 overflow-y-auto overscroll-contain'
                  : 'h-full border-r border-white/10 bg-[#141e33] p-6 flex flex-col gap-6 overflow-y-auto overscroll-contain shadow-[24px_0_80px_rgba(2,6,23,0.55)]'
              }
              style={isMobile ? { paddingBottom: 'max(1.5rem, var(--sab))' } : undefined}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Settings</h2>
                {isMobile && (
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="rounded-2xl bg-slate-800/55 border border-white/5 p-4">
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">
                  Username
                </label>
                <div className="flex gap-2">
                  <input
                    value={usernameInput}
                    onChange={(event) => setUsernameInput(event.target.value)}
                    placeholder="Set username"
                    maxLength={20}
                    className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                  />
                  <button
                    onClick={handleSaveUsername}
                    className="px-3 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 text-sm font-semibold hover:bg-cyan-500/30 transition-colors"
                  >
                    Save
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Saved locally for leaderboards, daily runs, and friend challenges.
                </p>
              </div>

            <div className="flex flex-col gap-2">
              <a
                href="/play?daily=true"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 text-amber-400 font-bold text-center transition-colors shadow-lg shadow-amber-500/10"
              >
                Play Daily Challenge
              </a>

              <button
                onClick={handleCreateChallenge}
                disabled={shareState === ShareState.SHARING}
                className={`w-full py-3 rounded-xl border font-bold text-center transition-colors shadow-lg ${
                  shareState === ShareState.SHARED
                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                    : 'bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30 text-purple-400'
                }`}
              >
                {shareState === ShareState.SHARING
                  ? 'Generating...'
                  : shareState === ShareState.SHARED
                    ? 'Link Copied!'
                    : 'Challenge A Friend'}
              </button>
            </div>

            <div className="rounded-2xl bg-slate-800/55 border border-white/5 p-4 space-y-3">
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Progress Snapshot</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-900/60 border border-white/5 p-3">
                    <div className="text-lg font-bold text-white">{profile.summary.totalRuns}</div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Runs</div>
                  </div>
                  <div className="rounded-xl bg-slate-900/60 border border-white/5 p-3">
                    <div className="text-lg font-bold text-amber-300">{profile.summary.bestOverallStreak}</div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Best Streak</div>
                  </div>
                  <div className="rounded-xl bg-slate-900/60 border border-white/5 p-3">
                    <div className="text-lg font-bold text-cyan-300">{profile.summary.totalPerfectRuns}</div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Perfect Runs</div>
                  </div>
                  <div className="rounded-xl bg-slate-900/60 border border-white/5 p-3">
                    <div className="text-lg font-bold text-emerald-300">{profile.summary.totalRegionsFound}</div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Regions Found</div>
                  </div>
                </div>
              </div>

              {favoriteRuleset && (
                <div className="rounded-xl bg-slate-900/60 border border-white/5 p-3">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500 mb-1">Favorite Ruleset</div>
                  <div className="text-sm font-semibold text-white">
                    {describeRuleset({
                      difficulty: favoriteRuleset.ruleset.difficulty,
                      continent: favoriteRuleset.ruleset.continent,
                      gameMode: favoriteRuleset.ruleset.gameMode,
                      challengeSource: favoriteRuleset.ruleset.challengeSource,
                      challengeId: favoriteRuleset.ruleset.challengeId,
                      modifier: favoriteRuleset.ruleset.modifier,
                    })}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {favoriteRuleset.totalRuns} runs • best {favoriteRuleset.highestScore} pts
                  </div>
                </div>
              )}

            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">
                Region
              </label>
              <OptionSelector
                options={CONTINENT_OPTIONS}
                selected={continent}
                getLabel={(value) => CONTINENT_LABELS[value]}
                onChange={(value) => {
                  onChangeContinent(value);
                  if (!isMobile) onClose();
                }}
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">
                Mode
              </label>
              <OptionSelector
                options={[GameMode.QUICK, GameMode.FULL]}
                selected={gameMode}
                onChange={(value) => {
                  onChangeGameMode(value);
                  if (!isMobile) onClose();
                }}
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">
                Difficulty
              </label>
              <OptionSelector
                options={[Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD]}
                selected={difficulty}
                onChange={(value) => {
                  onChangeDifficulty(value);
                  if (!isMobile) onClose();
                }}
              />
            </div>

            <button
              onClick={() => {
                onReset();
                onClose();
              }}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-rose-500/20 to-red-500/20 hover:from-rose-500/30 hover:to-red-500/30 border border-rose-500/25 text-rose-300 font-bold text-center transition-colors shadow-lg shadow-rose-500/10"
            >
              Reset Current Game
            </button>

            <button
              onClick={() => {
                if (!window.confirm('Clear your local progress and personal bests on this device?')) {
                  return;
                }

                clearProfile();
                setUsernameInput('');
              }}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-slate-700/70 to-slate-800/90 hover:from-slate-600/80 hover:to-slate-700/95 border border-white/10 text-slate-100 font-bold text-center transition-colors shadow-lg shadow-slate-950/35"
            >
              Clear Local Progress
            </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;
