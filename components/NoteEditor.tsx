
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Edit3, Check, Trash2, X, Hash } from 'lucide-react';

interface NoteEditorProps {
  initialNote: string;
  onSave: (note: string) => void;
  onCancel: () => void;
  onDelete: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ initialNote, onSave, onCancel, onDelete }) => {
  const [note, setNote] = useState(initialNote);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 mb-10 glass-card p-8 rounded-[2.5rem] shadow-glass border-white/50 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
        <Edit3 size={100} />
      </div>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-bible-gold/10 text-bible-gold rounded-xl">
            <Edit3 size={18} />
          </div>
          <h4 className="text-xs font-extra-bold text-bible-ink uppercase tracking-[0.2em]">
            Tu Hallazgo Teológico
          </h4>
        </div>
        <div className="h-1 flex-1 mx-6 bg-gradient-to-r from-bible-gold/20 to-transparent rounded-full"></div>
      </div>

      <textarea
        className="w-full bg-white/50 border border-stone-200/50 rounded-2xl p-6 text-bible-ink font-serif text-base focus:ring-4 focus:ring-bible-gold/5 focus:border-bible-gold/30 outline-none resize-none transition-all placeholder:text-stone-400 italic shadow-inner"
        rows={4}
        placeholder="¿Qué te revela el Espíritu en este pasaje? Escribe tus pensamientos, oración o notas de estudio avanzado aquí..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        autoFocus
      />

      <div className="flex justify-end gap-3 mt-8 relative z-10">
        {initialNote && (
           <button
             onClick={onDelete}
             className="px-6 py-3 text-xs font-extra-bold text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all uppercase tracking-widest"
           >
             Eliminar
           </button>
        )}
        <button
          onClick={onCancel}
          className="px-6 py-3 text-xs font-extra-bold text-stone-400 hover:text-bible-ink hover:bg-stone-50 rounded-2xl transition-all uppercase tracking-widest"
        >
          Cancelar
        </button>
        <button
          onClick={() => onSave(note)}
          className="px-8 py-3 bg-bible-leather text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 uppercase tracking-widest text-[10px]"
        >
          <Check size={14} />
          Guardar Nota
        </button>
      </div>
    </motion.div>
  );
};
