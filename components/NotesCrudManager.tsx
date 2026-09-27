import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  BookOpen, 
  Tag, 
  Calendar, 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  AlertCircle, 
  Loader2,
  FolderGit2,
  Layers,
  X
} from 'lucide-react';
import { userService } from '../services/userService';
import { auth } from '../lib/firebase';
import { SavedNote } from '../types';

interface NotesCrudManagerProps {
  onNavigateToVerse?: (book: string, chapter: number, verse?: number) => void;
  onOpenAccount?: () => void;
}

const CATEGORIES = [
  { id: 'todos', label: 'Todas las Notas' },
  { id: 'devocional', label: 'Devocionales', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'estudio', label: 'Estudio Bíblico', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'teologia', label: 'Teología', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { id: 'oracion', label: 'Oraciones', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'general', label: 'Apuntes', color: 'bg-stone-100 text-stone-800 border-stone-300' },
];

const NOTE_COLORS: Record<string, { bg: string; border: string; badge: string }> = {
  amber: { bg: 'bg-amber-50/70', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-900' },
  blue: { bg: 'bg-blue-50/70', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-900' },
  emerald: { bg: 'bg-emerald-50/70', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-900' },
  purple: { bg: 'bg-purple-50/70', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-900' },
  rose: { bg: 'bg-rose-50/70', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-900' },
  stone: { bg: 'bg-stone-50', border: 'border-stone-200', badge: 'bg-stone-100 text-stone-900' }
};

export const NotesCrudManager: React.FC<NotesCrudManagerProps> = ({ 
  onNavigateToVerse,
  onOpenAccount
}) => {
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');

  // Modal State for Create / Edit
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<SavedNote | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [reference, setReference] = useState('');
  const [content, setContent] = useState('');
  const [passageText, setPassageText] = useState('');
  const [category, setCategory] = useState<'devocional' | 'estudio' | 'teologia' | 'oracion' | 'general'>('estudio');
  const [color, setColor] = useState('amber');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Copy feedback
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);
  const [copiedAllMd, setCopiedAllMd] = useState(false);

  // Load notes from Firestore (or fallback to local storage)
  const fetchNotes = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const firestoreNotes = await userService.getNotes(user.uid);
        setNotes(firestoreNotes);
      } else {
        // Fallback: cargar notas desde localStorage si no está autenticado
        loadLocalStorageNotes();
      }
    } catch (err) {
      console.warn("Error cargando notas de Firestore, usando local:", err);
      loadLocalStorageNotes();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalStorageNotes = () => {
    const loaded: SavedNote[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('note-')) {
        const val = localStorage.getItem(key) || '';
        const parts = key.split('-');
        const verse = parts.pop() || '';
        const chapter = parts.pop() || '';
        const book = parts.slice(1).join('-');
        loaded.push({
          id: key,
          userId: 'local-user',
          title: `Nota sobre ${book} ${chapter}:${verse}`,
          reference: `${book} ${chapter}:${verse}`,
          content: val,
          category: 'estudio',
          color: 'amber',
          createdAt: new Date().toISOString()
        });
      }
    }
    setNotes(loaded);
  };

  useEffect(() => {
    fetchNotes();
  }, [auth.currentUser]);

  // Handle open editor for CREATE
  const handleOpenCreate = () => {
    setEditingNote(null);
    setTitle('');
    setReference('Génesis 1:1');
    setContent('');
    setPassageText('');
    setCategory('estudio');
    setColor('amber');
    setTags(['estudio', 'fe']);
    setTagInput('');
    setFormError(null);
    setIsEditorOpen(true);
  };

  // Handle open editor for UPDATE
  const handleOpenEdit = (note: SavedNote) => {
    setEditingNote(note);
    setTitle(note.title || '');
    setReference(note.reference);
    setContent(note.content);
    setPassageText(note.text || '');
    setCategory(note.category || 'estudio');
    setColor(note.color || 'amber');
    setTags(note.tags || []);
    setTagInput('');
    setFormError(null);
    setIsEditorOpen(true);
  };

  // Handle Tag addition
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Handle SAVE (Create or Update in Firestore)
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setFormError('El contenido de la nota no puede estar vacío');
      return;
    }
    if (!reference.trim()) {
      setFormError('Debes indicar un pasaje o libro bíblico de referencia');
      return;
    }

    setSaving(true);
    setFormError(null);

    const user = auth.currentUser;
    const userId = user ? user.uid : 'local-user';

    try {
      if (editingNote && editingNote.id) {
        // UPDATE
        if (user && !editingNote.id.startsWith('note-legacy-')) {
          await userService.updateNote(userId, editingNote.id, {
            title: title.trim() || `Nota sobre ${reference}`,
            reference: reference.trim(),
            content: content.trim(),
            text: passageText.trim() || undefined,
            category,
            color,
            tags
          });
        }
        // Actualizar estado local
        setNotes(prev => prev.map(n => n.id === editingNote.id ? {
          ...n,
          title: title.trim() || `Nota sobre ${reference}`,
          reference: reference.trim(),
          content: content.trim(),
          text: passageText.trim() || undefined,
          category,
          color,
          tags,
          updatedAt: new Date().toISOString()
        } : n));
      } else {
        // CREATE
        if (user) {
          const newNote = await userService.createNote(userId, {
            userId,
            title: title.trim() || `Reflexión: ${reference}`,
            reference: reference.trim(),
            content: content.trim(),
            text: passageText.trim() || undefined,
            category,
            color,
            tags
          });
          setNotes(prev => [newNote, ...prev]);
        } else {
          // Fallback Local
          const localNote: SavedNote = {
            id: `note-${Date.now()}`,
            userId: 'local-user',
            title: title.trim() || `Reflexión: ${reference}`,
            reference: reference.trim(),
            content: content.trim(),
            text: passageText.trim() || undefined,
            category,
            color,
            tags,
            createdAt: new Date().toISOString()
          };
          localStorage.setItem(`note-${reference.replace(/\s+/g, '-')}`, content);
          setNotes(prev => [localNote, ...prev]);
        }
      }

      setIsEditorOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar la nota en Firestore');
    } finally {
      setSaving(false);
    }
  };

  // Handle DELETE in Firestore
  const handleDeleteNote = async (noteId?: string) => {
    if (!noteId) return;
    if (!confirm('¿Estás seguro de que deseas eliminar permanentemente esta nota de Firestore?')) return;

    try {
      const user = auth.currentUser;
      if (user && !noteId.startsWith('note-')) {
        await userService.deleteNote(user.uid, noteId);
      } else {
        localStorage.removeItem(noteId);
      }
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (err: any) {
      alert(`Error al eliminar nota: ${err.message}`);
    }
  };

  // Copy single note
  const handleCopyNote = (note: SavedNote) => {
    const textToCopy = `# ${note.title || note.reference}\nReferencia: ${note.reference}\n\n${note.content}\n\n${note.text ? `> ${note.text}\n` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedNoteId(note.id || 'current');
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  // Filter notes
  const filteredNotes = notes.filter(n => {
    const matchesCategory = selectedCategory === 'todos' || n.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (n.title && n.title.toLowerCase().includes(query)) ||
      n.reference.toLowerCase().includes(query) ||
      n.content.toLowerCase().includes(query) ||
      (n.tags && n.tags.some(t => t.toLowerCase().includes(query)));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
              <Sparkles size={12} />
              Gestor CRUD en la Base de Datos
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Cloud Firestore
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight">
            Bitácora Bíblica & Notas de Estudio
          </h1>
          <p className="text-sm text-stone-300">
            Crea, edita, organiza y respalda tus reflexiones exegéticas, apuntes devocionales y estudios conectados en tiempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm"
          >
            <Plus size={18} />
            <span>Nueva Nota Bíblica</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search and Category Pills */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-3.5 text-stone-400" />
            <input 
              type="text"
              placeholder="Buscar por tema, versículo o etiqueta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500 self-end sm:self-center font-medium">
            <span>{filteredNotes.length} {filteredNotes.length === 1 ? 'nota encontrada' : 'notas encontradas'}</span>
            <span className="text-stone-300">•</span>
            <button
              onClick={fetchNotes}
              className="text-amber-700 hover:underline flex items-center gap-1"
            >
              Actualizar Firestore
            </button>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-stone-400 space-y-3">
          <Loader2 size={32} className="animate-spin text-amber-600" />
          <p className="text-xs font-medium">Cargando notas desde Cloud Firestore...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-stone-300 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <FileText size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-800 font-serif">No hay notas en esta categoría</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
              {searchQuery ? 'No encontramos notas que coincidan con tu búsqueda.' : 'Crea tu primera reflexión o nota bíblica para comenzar a estructurar tu estudio en la base de datos.'}
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow"
          >
            Crear Primera Nota
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => {
            const colorScheme = NOTE_COLORS[note.color || 'amber'] || NOTE_COLORS.amber;
            return (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-5 rounded-3xl border ${colorScheme.border} ${colorScheme.bg} shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colorScheme.badge}`}>
                      {note.category || 'ESTUDIO'}
                    </span>

                    <div className="flex items-center gap-1 text-stone-400">
                      <button
                        onClick={() => handleCopyNote(note)}
                        className="p-1.5 hover:text-stone-700 rounded-lg transition-colors"
                        title="Copiar contenido"
                      >
                        {copiedNoteId === note.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(note)}
                        className="p-1.5 hover:text-amber-700 rounded-lg transition-colors"
                        title="Editar nota (Update)"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1.5 hover:text-rose-600 rounded-lg transition-colors"
                        title="Eliminar nota (Delete)"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Title and Reference */}
                  <div>
                    <h3 className="font-bold text-stone-900 font-serif text-base leading-snug">
                      {note.title || note.reference}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 mt-1">
                      <BookOpen size={13} />
                      <span>{note.reference}</span>
                    </div>
                  </div>

                  {/* Scripture Quote if present */}
                  {note.text && (
                    <blockquote className="text-[11px] italic text-stone-600 border-l-2 border-amber-400 pl-2.5 py-0.5 bg-white/50 rounded-r">
                      "{note.text}"
                    </blockquote>
                  )}

                  {/* Main Content */}
                  <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-wrap line-clamp-6">
                    {note.content}
                  </p>

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {note.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/80 text-stone-600 border border-stone-200">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer with date and action */}
                <div className="pt-4 mt-4 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{new Date(note.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}</span>
                  </div>

                  {onNavigateToVerse && (
                    <button
                      onClick={() => {
                        const parts = note.reference.split(' ');
                        const book = parts.slice(0, -1).join(' ');
                        const [chap] = (parts[parts.length - 1] || '1').split(':');
                        onNavigateToVerse(book || 'Génesis', parseInt(chap) || 1);
                      }}
                      className="text-amber-700 hover:underline font-bold flex items-center gap-1"
                    >
                      <span>Ir al texto</span>
                      <ExternalLink size={10} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* MODAL: CREATE / EDIT NOTE (CRUD) */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    {editingNote ? <Edit3 size={18} /> : <Plus size={18} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm font-serif">
                      {editingNote ? 'Editar Nota (Update)' : 'Nueva Nota Bíblica (Create)'}
                    </h3>
                    <p className="text-[11px] text-stone-400">Almacenada con persistencia en Cloud Firestore</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveNote} className="p-6 overflow-y-auto space-y-4 flex-1">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200 flex items-center gap-2">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Título de la Nota</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ej. La Gracia en Romanos 8"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Biblical Reference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Pasaje Bíblico</label>
                    <input 
                      type="text"
                      required
                      placeholder="Ej. Romanos 8:28"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Categoría</label>
                    <select
                      value={category}
                      onChange={(e: any) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    >
                      <option value="estudio">Estudio Bíblico</option>
                      <option value="devocional">Devocional</option>
                      <option value="teologia">Teología</option>
                      <option value="oracion">Oración</option>
                      <option value="general">Apuntes Generales</option>
                    </select>
                  </div>
                </div>

                {/* Color Selector */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">Color de Tarjeta</label>
                  <div className="flex items-center gap-3">
                    {Object.entries(NOTE_COLORS).map(([cKey, cVal]) => (
                      <button
                        key={cKey}
                        type="button"
                        onClick={() => setColor(cKey)}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          color === cKey ? 'ring-2 ring-amber-500 scale-110 border-stone-900' : 'border-stone-300'
                        } ${cVal.bg}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Scripture Text (optional quote) */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Cita Bíblica (Opcional)</label>
                  <input 
                    type="text"
                    placeholder="Texto bíblico resaltado..."
                    value={passageText}
                    onChange={(e) => setPassageText(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 italic"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Contenido / Reflexión</label>
                  <textarea 
                    rows={6}
                    required
                    placeholder="Escribe tu reflexión, análisis o notas de estudio..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed font-sans"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Etiquetas (Tags)</label>
                  <div className="flex gap-2 mb-2">
                    <input 
                      type="text"
                      placeholder="Ej. salvacion, promesa, pacto"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tags.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-100 text-amber-900 flex items-center gap-1">
                        #{t}
                        <button type="button" onClick={() => handleRemoveTag(t)} className="hover:text-rose-600">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Submit buttons */}
                <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5"
                  >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    <span>{editingNote ? 'Actualizar en Firestore' : 'Guardar en Firestore'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
