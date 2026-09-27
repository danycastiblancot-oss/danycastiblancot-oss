import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Calendar, 
  Users, 
  MapPin, 
  BookOpen, 
  Target, 
  Mic2, 
  History, 
  X, 
  Share2, 
  Check, 
  Info,
  Scroll
} from 'lucide-react';
import { ChapterMetadata } from '../types';

interface ContextPanelProps {
  metadata: ChapterMetadata | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({ metadata, isOpen, onClose, isLoading }) => {
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  if (!isOpen) return null;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopyFeedback(true);
      setTimeout(() => setShowCopyFeedback(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const InfoCard = ({ icon: Icon, title, content, color = "bg-stone-50" }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`${color} p-5 rounded-3xl border border-white/50 shadow-soft group hover:shadow-glass hover:-translate-y-1 transition-all`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-white rounded-xl text-bible-gold shadow-sm group-hover:scale-110 transition-transform">
          <Icon size={16} />
        </div>
        <span className="text-[10px] font-extra-bold text-bible-accent uppercase tracking-[0.2em]">{title}</span>
      </div>
      <p className="text-bible-ink text-sm leading-relaxed font-medium">{content}</p>
    </motion.div>
  );

  return (
    <div className="w-full h-full bg-bible-modern-bg flex flex-col shadow-2xl rounded-t-[3rem] lg:rounded-l-[3rem] lg:rounded-tr-none overflow-hidden border border-white/20">
      {/* Header */}
      <div className="p-8 border-b border-stone-200/50 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h2 className="text-2xl font-display font-bold text-bible-ink flex items-center gap-3">
            <Info className="text-bible-gold" size={24} />
            Contexto <span className="text-bible-gold italic">Académico</span>
          </h2>
          <p className="text-[10px] font-extra-bold text-stone-400 uppercase tracking-widest mt-1">Análisis profundo de la Academia ABBA</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleShare} 
            className="p-3 text-stone-500 hover:text-bible-gold transition-all rounded-2xl bg-white border border-stone-100 shadow-sm active:scale-90"
          >
            {showCopyFeedback ? <Check size={20} className="text-green-500" /> : <Share2 size={20} />}
          </button>
          <button 
            onClick={onClose} 
            className="p-3 text-stone-500 hover:text-red-500 transition-all rounded-2xl bg-white border border-stone-100 shadow-sm active:scale-90"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-stone-200/50 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : metadata ? (
          <div className="space-y-8 pb-12">
            {/* Essential Header Stats */}
            <div className="grid grid-cols-2 gap-4">
              <InfoCard icon={User} title="Autor" content={metadata.author} />
              <InfoCard icon={Calendar} title="Época" content={metadata.estimated_date} />
            </div>

            {/* Classification & Order */}
            <div className="bg-bible-leather text-white p-8 rounded-[2.5rem] shadow-glass relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Scroll size={80} />
               </div>
               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="p-2 bg-white/10 rounded-xl text-bible-gold">
                     <BookOpen size={16} />
                   </div>
                   <span className="text-[10px] font-extra-bold uppercase tracking-[0.3em]">Orden y Categoría</span>
                 </div>
                 <h4 className="text-xl font-display font-bold mb-2">{metadata.category_group}</h4>
                 <p className="text-xs text-stone-300 leading-relaxed font-medium">
                   <span className="text-bible-gold font-bold">Lugar en la Historia:</span> {metadata.chronological_order}
                 </p>
               </div>
            </div>

            {/* In-depth Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard icon={Target} title="Propósito" content={metadata.purpose} />
              <InfoCard icon={Users} title="Audiencia" content={metadata.target_audience} />
              <InfoCard icon={Mic2} title="Quién Habla" content={metadata.speaker_voice} />
              <InfoCard icon={MapPin} title="Escenario" content={metadata.historical_setting} />
            </div>

            {/* Theology Highlight */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               className="bg-white p-8 rounded-[2.5rem] border border-bible-gold/20 shadow-glass relative"
            >
               <div className="absolute -top-3 left-8 bg-bible-gold text-white text-[10px] font-extra-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                 Corazón Teológico
               </div>
               <p className="text-bible-ink font-serif italic text-lg leading-relaxed pt-2">
                 "{metadata.theological_theme}"
               </p>
            </motion.div>

            {/* Study Guidance */}
            <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100">
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-sm">
                   <History size={16} />
                 </div>
                 <span className="text-[10px] font-extra-bold text-emerald-600 uppercase tracking-widest">Guía de Estudio</span>
               </div>
               <p className="text-emerald-900 text-sm leading-relaxed">{metadata.reading_guidance}</p>
            </div>

            {/* Key Quotes */}
            {metadata.key_quotes && metadata.key_quotes.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-extra-bold text-bible-accent uppercase tracking-[0.3em] pl-4 border-l-4 border-bible-gold">Revelaciones Clave</h3>
                <div className="grid gap-4">
                  {metadata.key_quotes.map((quote, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ x: 10 }}
                      className="bg-white p-6 rounded-2xl border border-stone-100 shadow-soft flex gap-4"
                    >
                      <div className="text-bible-gold font-display font-bold text-2xl pt-1">“</div>
                      <p className="text-stone-600 font-serif italic text-sm leading-relaxed">{quote}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 bg-stone-100 rounded-[2rem] flex items-center justify-center text-stone-300 mb-6">
              <Scroll size={40} />
            </div>
            <p className="text-stone-400 font-medium">Selecciona un capítulo de la Academia para revelar su análisis profundo.</p>
          </div>
        )}
      </div>
    </div>
  );
};