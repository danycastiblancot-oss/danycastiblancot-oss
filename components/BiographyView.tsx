import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, History, BookOpen, User, Calendar, Star, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { CharacterBiography } from '../types';

interface BiographyViewProps {
  onBack: () => void;
}

export const BiographyView: React.FC<BiographyViewProps> = ({ onBack }) => {
  const [query, setQuery] = useState('');
  const [biography, setBiography] = useState<CharacterBiography | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await geminiService.getCharacterBiography(query);
      setBiography(result);
    } catch (err) {
      console.error(err);
      setError('No se pudo encontrar la biografía. Intenta con otro nombre.');
    } finally {
      setLoading(false);
    }
  };

  const trendingCharacters = ['David', 'Moisés', 'Pablo de Tarso', 'Ester', 'Pedro'];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4 mb-12"
      >
        <button 
          onClick={onBack}
          className="p-3 bg-white border border-stone-200 rounded-2xl hover:bg-stone-50 transition-all shadow-sm"
        >
          <ArrowLeft size={20} className="text-stone-600" />
        </button>
        <div>
          <h2 className="text-3xl font-display font-bold text-bible-ink">Biografías Bíblicas</h2>
          <p className="text-stone-500 text-sm font-extra-bold uppercase tracking-widest">Conoce a los héroes de la fe</p>
        </div>
      </motion.div>

      {!biography && !loading && (
        <div className="space-y-12">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400" size={24} />
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej. Abraham, Jose, Maria..."
              className="w-full pl-16 pr-6 py-6 rounded-[2rem] border-2 border-stone-100 focus:border-bible-gold outline-none text-xl shadow-soft transition-all"
            />
            <button 
              type="submit"
              className="absolute right-3 top-3 bottom-3 px-8 bg-bible-leather text-white rounded-full font-bold hover:bg-bible-ink transition-colors shadow-lg"
            >
              Buscar
            </button>
          </form>

          <div className="text-center">
            <p className="text-stone-400 font-bold uppercase tracking-[0.3em] text-[10px] mb-6">Tendencias de estudio</p>
            <div className="flex flex-wrap justify-center gap-3">
              {trendingCharacters.map(char => (
                <button 
                  key={char}
                  onClick={() => { setQuery(char); handleSearch(); }}
                  className="px-6 py-3 bg-white border border-stone-200 rounded-full text-stone-600 font-bold text-sm hover:border-bible-gold hover:text-bible-accent transition-all shadow-sm"
                >
                  {char}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <div className="p-8 bg-white border border-stone-100 rounded-3xl shadow-soft">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <History size={24} />
              </div>
              <h3 className="text-xl font-display font-bold mb-4">Contexto Histórico</h3>
              <p className="text-stone-600 leading-relaxed text-sm">
                Entiende el mundo en el que vivieron estos personajes: sus imperios, sus luchas y cómo Dios se reveló a través de sus vidas.
              </p>
            </div>
            <div className="p-8 bg-white border border-stone-100 rounded-3xl shadow-soft">
              <div className="w-12 h-12 bg-bible-gold/10 text-bible-gold rounded-2xl flex items-center justify-center mb-6">
                <Star size={24} />
              </div>
              <h3 className="text-xl font-display font-bold mb-4">Legado Espiritual</h3>
              <p className="text-stone-600 leading-relaxed text-sm">
                Descubre por qué su caminar con Dios sigue siendo relevante para tu propia vida y fe el día de hoy.
              </p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-12 h-12 text-bible-gold animate-spin mb-4" />
          <p className="text-stone-500 font-extra-bold uppercase tracking-widest text-xs animate-pulse">Relatando historia...</p>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-12 bg-red-50 rounded-3xl border border-red-100">
          <p className="text-red-500 font-bold">{error}</p>
          <button onClick={() => setBiography(null)} className="mt-4 text-stone-500 underline text-sm">Volver a intentar</button>
        </div>
      )}

      {biography && !loading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="p-8 md:p-12 bg-white border border-stone-100 rounded-[3rem] shadow-glass relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-bible-gold/5 rounded-full -translate-y-12 translate-x-12 blur-3xl"></div>
            
            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-12 relative z-10">
              <div className="w-32 h-32 bg-bible-leather rounded-3xl flex items-center justify-center shadow-2xl shrink-0">
                <User size={64} className="text-bible-gold" />
              </div>
              <div>
                <span className="inline-block px-3 py-1 bg-bible-gold/10 text-bible-accent rounded-full text-[10px] font-extra-bold uppercase tracking-widest mb-3">
                  {biography.role}
                </span>
                <h1 className="text-4xl md:text-6xl font-display font-bold text-bible-ink mb-2">{biography.name}</h1>
                <div className="flex items-center gap-2 text-stone-500">
                  <Calendar size={16} />
                  <span className="text-sm font-bold">{biography.period}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-3">
                    <BookOpen size={20} className="text-bible-gold" />
                    Biografía Detallada
                  </h3>
                  <div className="text-stone-600 leading-relaxed text-lg space-y-4 whitespace-pre-wrap">
                    {biography.detailed_bio}
                  </div>
                </div>

                <div>
                   <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-3">
                    <Star size={20} className="text-bible-gold" />
                    Significado Teológico
                  </h3>
                  <div className="p-8 bg-stone-50 rounded-3xl border border-stone-100 text-stone-700 italic leading-relaxed">
                    "{biography.significance}"
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="p-6 bg-white border border-stone-100 rounded-2xl shadow-soft">
                  <h4 className="font-display font-bold mb-6 text-sm uppercase tracking-widest text-bible-accent">Eventos Clave</h4>
                  <div className="space-y-4">
                    {biography.key_events.map((event, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-6 h-6 bg-bible-gold text-white rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-1">
                          {i + 1}
                        </div>
                        <p className="text-sm text-stone-600 leading-tight">{event}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-white border border-stone-100 rounded-2xl shadow-soft">
                  <h4 className="font-display font-bold mb-6 text-sm uppercase tracking-widest text-bible-accent">Pasajes Clave</h4>
                  <div className="space-y-3">
                    {biography.related_verses.map(verse => (
                      <div key={verse} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl group transition-all hover:bg-bible-gold/10">
                        <span className="text-sm font-bold text-stone-700">{verse}</span>
                        <ChevronRight size={14} className="text-stone-400 group-hover:text-bible-accent" />
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setBiography(null)}
                  className="w-full py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-all active:scale-95"
                >
                  Nueva Búsqueda
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
