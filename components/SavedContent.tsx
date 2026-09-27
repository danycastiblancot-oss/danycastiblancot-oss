
import React, { useState, useEffect } from 'react';
import { Highlight } from '../types';

interface SavedItem {
  key: string;
  type: 'note' | 'highlight';
  book: string;
  chapter: number;
  verse: number;
  content: string | Highlight[];
  timestamp: number;
}

interface SavedContentProps {
  onNavigateToVerse: (book: string, chapter: number, verse: number) => void;
  onDeleteItem: (key: string) => void;
}

const colorMap: Record<string, string> = {
  yellow: 'bg-yellow-400',
  green: 'bg-green-400',
  blue: 'bg-blue-400',
  pink: 'bg-pink-400'
};

export const SavedContent: React.FC<SavedContentProps> = ({ onNavigateToVerse, onDeleteItem }) => {
  const [items, setItems] = useState<SavedItem[]>([]);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = () => {
    const loadedItems: SavedItem[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      try {
        if (key.startsWith('note-')) {
          const parts = key.split('-');
          // Format: note-Book-Chapter-Verse
          if (parts.length >= 4) {
            const verse = parseInt(parts.pop() || '0');
            const chapter = parseInt(parts.pop() || '0');
            const book = parts.slice(1).join('-'); 

            loadedItems.push({
              key,
              type: 'note',
              book,
              chapter,
              verse,
              content: localStorage.getItem(key) || '',
              timestamp: Date.now() 
            });
          }
        } else if (key.startsWith('highlights-v2-')) {
          const parts = key.split('-');
          // Format: highlights-v2-Book-Chapter-Verse
          if (parts.length >= 5) {
            const verse = parseInt(parts.pop() || '0');
            const chapter = parseInt(parts.pop() || '0');
            const book = parts.slice(2).join('-');

            const highlights = JSON.parse(localStorage.getItem(key) || '[]');
            if (highlights.length > 0) {
              loadedItems.push({
                key,
                type: 'highlight',
                book,
                chapter,
                verse,
                content: highlights,
                timestamp: Date.now()
              });
            }
          }
        }
      } catch (e) {
        console.error("Error parsing saved item", key, e);
      }
    }

    // Sort by book and chapter
    setItems(loadedItems.sort((a, b) => a.book.localeCompare(b.book) || a.chapter - b.chapter || a.verse - b.verse));
  };

  const handleDelete = (key: string) => {
    if (confirm('¿Estás seguro de querer eliminar este elemento?')) {
      onDeleteItem(key);
      loadItems(); // Refresh list immediately
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 text-stone-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-display font-bold text-bible-ink mb-2">No tienes elementos guardados</h3>
        <p className="text-stone-500 max-w-xs">Tus notas personales y versículos resaltados aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pt-4 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold text-bible-ink">Mis Guardados</h1>
        <p className="text-stone-500 mt-2">Tu colección personal de notas y resaltados.</p>
      </div>

      <div className="space-y-4 pb-20">
        {items.map((item) => (
          <div key={item.key} className="bg-white p-5 rounded-lg border border-stone-200 shadow-sm hover:border-bible-gold transition-colors relative group">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.type === 'note' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                  {item.type === 'note' ? 'Nota' : 'Resaltado'}
                </span>
                <h3 className="font-display font-bold text-bible-leather text-lg">
                  {item.book} {item.chapter}:{item.verse}
                </h3>
              </div>
              
              <div className="flex items-center gap-1">
                 <button
                   onClick={() => onNavigateToVerse(item.book, item.chapter, item.verse)}
                   className="p-2 text-bible-accent hover:bg-stone-50 rounded-full transition-colors"
                   title="Ir al versículo"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                   </svg>
                 </button>
                 <button
                   onClick={() => handleDelete(item.key)}
                   className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                   title="Eliminar"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                 </button>
              </div>
            </div>

            {item.type === 'note' ? (
              <div className="bg-yellow-50 p-3 rounded border-l-2 border-yellow-400">
                <p className="font-handwriting text-stone-800 italic">{item.content as string}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(item.content as Highlight[]).map((hl) => (
                   <div key={hl.id} className="flex items-start gap-2">
                      <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${colorMap[hl.color] || 'bg-yellow-400'}`}></div>
                      <p className="text-stone-700 font-serif italic text-sm">"{hl.text}"</p>
                   </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
