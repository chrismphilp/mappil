import { FC } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Difficulty, ContinentFilter } from '../types/game.types';
import OptionSelector from './OptionSelector';

const CONTINENT_OPTIONS: ContinentFilter[] = [
  'World', 'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania',
];

const CONTINENT_LABELS: Record<ContinentFilter, string> = {
  'World': 'World',
  'Africa': 'Africa',
  'Asia': 'Asia',
  'Europe': 'Europe',
  'North America': 'N. America',
  'South America': 'S. America',
  'Oceania': 'Oceania',
};

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  difficulty: Difficulty;
  continent: ContinentFilter;
  onChangeDifficulty: (d: Difficulty) => void;
  onChangeContinent: (c: ContinentFilter) => void;
  onReset: () => void;
}

const SettingsPanel: FC<SettingsPanelProps> = ({
  open,
  onClose,
  difficulty,
  continent,
  onChangeDifficulty,
  onChangeContinent,
  onReset,
}) => (
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
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -320, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-slate-900/90 backdrop-blur-2xl border-r border-white/10 p-6 flex flex-col gap-8"
        >
          <h2 className="text-lg font-bold text-white">Settings</h2>

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
                onClose();
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
                onClose();
              }}
            />
          </div>

          <button
            onClick={() => {
              onReset();
              onClose();
            }}
            className="px-4 py-3 rounded-xl bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition-colors"
          >
            Reset Game
          </button>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default SettingsPanel;
