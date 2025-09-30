import { motion } from 'framer-motion';

export function PulsingScoreButton({ 
  onClick, 
  variant = 'default',
  children 
}: { 
  onClick: () => void;
  variant?: 'default' | 'winning' | 'losing';
  children: React.ReactNode;
}) {
  const variants = {
    default: 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600',
    winning: 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white border-green-400 shadow-lg shadow-green-500/50',
    losing: 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600'
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`px-4 py-3 rounded-lg font-semibold border-2 transition-all ${variants[variant]}`}
    >
      {children}
    </motion.button>
  );
}
