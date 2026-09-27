
import React from 'react';
import { motion } from 'motion/react';
import { 
  CloudRain, 
  Frown, 
  Sun, 
  Zap, 
  Wind, 
  ShieldAlert, 
  Sparkles, 
  BatteryLow,
  ChevronRight
} from 'lucide-react';

interface MoodSelectorProps {
  onSelectMood: (mood: string) => void;
}

const moods = [
  { id: 'anxious', label: 'Ansiedad', icon: <ShieldAlert size={32} />, color: 'bg-white text-blue-600 border-stone-100 hover:bg-blue-50', sub: 'Paz en la tormenta' },
  { id: 'sad', label: 'Tristeza', icon: <Frown size={32} />, color: 'bg-white text-indigo-600 border-stone-100 hover:bg-indigo-50', sub: 'Consuelo divino' },
  { id: 'grateful', label: 'Gratitud', icon: <Sun size={32} />, color: 'bg-white text-amber-600 border-stone-100 hover:bg-amber-50', sub: 'Corazón rebosante' },
  { id: 'angry', label: 'Ira', icon: <Zap size={32} />, color: 'bg-white text-red-600 border-stone-100 hover:bg-red-50', sub: 'Calma y perdón' },
  { id: 'lonely', label: 'Soledad', icon: <Wind size={32} />, color: 'bg-white text-stone-600 border-stone-100 hover:bg-stone-50', sub: 'Nunca estás solo' },
  { id: 'afraid', label: 'Miedo', icon: <CloudRain size={32} />, color: 'bg-white text-purple-600 border-stone-100 hover:bg-purple-50', sub: 'Fortaleza eterna' },
  { id: 'hopeful', label: 'Esperanza', icon: <Sparkles size={32} />, color: 'bg-white text-emerald-600 border-stone-100 hover:bg-emerald-50', sub: 'Nuevos comienzos' },
  { id: 'tired', label: 'Cansancio', icon: <BatteryLow size={32} />, color: 'bg-white text-orange-600 border-stone-100 hover:bg-orange-50', sub: 'Descanso sagrado' },
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({ onSelectMood }) => {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="text-center mb-16 px-4">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-display font-bold text-bible-ink mb-4"
        >
          ¿Cómo está tu <span className="text-bible-gold italic">alma</span> hoy?
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-bible-accent/60 font-bold uppercase tracking-widest text-[10px]"
        >
          Deja que la Academia ABBA ilumine tu camino
        </motion.p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {moods.map((mood, idx) => (
          <motion.button
            key={mood.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelectMood(mood.label)}
            className={`p-8 rounded-[2.5rem] border transition-all flex flex-col items-center gap-4 group relative overflow-hidden shadow-soft ${mood.color} active:scale-95`}
          >
            <div className="mb-2 group-hover:scale-125 transition-transform duration-500">
              {mood.icon}
            </div>
            <div className="text-center">
              <span className="font-display font-bold text-lg block mb-1 text-bible-ink">{mood.label}</span>
              <span className="text-[10px] uppercase font-extra-bold opacity-60 tracking-wider block">{mood.sub}</span>
            </div>
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-bible-gold">
              <ChevronRight size={16} />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
