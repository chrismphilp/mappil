import { motion } from 'framer-motion';

interface OptionSelectorProps<T extends string> {
  options: T[];
  selected: T;
  onChange: (value: T) => void;
}

function OptionSelector<T extends string>({
  options,
  selected,
  onChange,
}: OptionSelectorProps<T>) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <motion.button
          key={opt}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(opt)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selected === opt
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-700/60 text-slate-300 hover:bg-slate-600/60'
          }`}
        >
          {opt}
        </motion.button>
      ))}
    </div>
  );
}

export default OptionSelector;
