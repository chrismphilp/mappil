import { motion } from 'framer-motion';

interface OptionSelectorProps<T extends string> {
  options: T[];
  selected: T;
  onChange: (value: T) => void;
  getLabel?: (value: T) => string;
}

function OptionSelector<T extends string>({
  options,
  selected,
  onChange,
  getLabel,
}: OptionSelectorProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <motion.button
          key={opt}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(opt)}
          className={`px-4 py-2.5 min-h-[44px] rounded-full text-sm font-semibold transition-all duration-200 flex items-center justify-center border ${
            selected === opt
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-300/25 shadow-lg shadow-blue-950/60 shadow-[0_10px_24px_rgba(37,99,235,0.45)]'
              : 'bg-slate-800/85 text-slate-200 border-white/5 hover:bg-slate-700/90 hover:border-cyan-400/15 hover:text-white'
          }`}
        >
          {getLabel ? getLabel(opt) : opt}
        </motion.button>
      ))}
    </div>
  );
}

export default OptionSelector;
