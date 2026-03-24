import { FC } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Difficulty, ContinentFilter, GameMode } from '../../types/game.types';
import OptionSelector from './OptionSelector';
import { useIsMobileViewport } from '../../hooks/useIsMobileViewport';

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
  onChangeDifficulty: (d: Difficulty) => void;
  onChangeContinent: (c: ContinentFilter) => void;
  onChangeGameMode: (m: GameMode) => void;
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

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40"
          />
          {/* Panel */}
          <motion.div
            initial={isMobile ? { y: '100%', opacity: 0 } : { x: -320, opacity: 0 }}
            animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
            exit={isMobile ? { y: '100%', opacity: 0 } : { x: -320, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={
              isMobile
                ? 'fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-2xl border-t border-white/10 p-6 rounded-t-3xl flex flex-col gap-6 max-h-[85dvh] overflow-y-auto'
                : 'fixed left-0 top-0 bottom-0 z-50 w-72 bg-slate-900/90 backdrop-blur-2xl border-r border-white/10 p-6 flex flex-col gap-8'
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

            <a 
              href="/play?daily=true"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 text-amber-400 font-bold text-center transition-colors shadow-lg shadow-amber-500/10"
            >
              Play Daily Challenge
            </a>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">
                Region
              </label>
              <OptionSelector
                options={CONTINENT_OPTIONS}
                selected={continent}
                getLabel={(c) => CONTINENT_LABELS[c]}
                onChange={(c) => {
                  onChangeContinent(c);
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
                onChange={(m) => {
                  onChangeGameMode(m);
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
                onChange={(d) => {
                  onChangeDifficulty(d);
                  if (!isMobile) onClose();
                }}
              />
            </div>

            <button
              onClick={() => {
                onReset();
                onClose();
              }}
              className="px-4 py-3 rounded-xl bg-red-500/20 text-red-400 font-semibold hover:bg-red-500/30 transition-colors mt-auto"
            >
              Reset Game
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;
