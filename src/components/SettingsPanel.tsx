import { FC } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Difficulty } from '../types/game.types';
import OptionSelector from './OptionSelector';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  difficulty: Difficulty;
  onChangeDifficulty: (d: Difficulty) => void;
  onReset: () => void;
}

const SettingsPanel: FC<SettingsPanelProps> = ({
  open,
  onClose,
  difficulty,
  onChangeDifficulty,
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
