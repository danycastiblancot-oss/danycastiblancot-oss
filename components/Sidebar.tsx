import React, { useMemo, useState, useEffect } from 'react';
import { BIBLE_BOOKS, CATEGORY_LABELS, VERSE_COUNTS } from '../constants';
import { BibleBook } from '../types';

interface SidebarProps {
  currentBook: string;
  onSelectBook: (bookName: string) => void;
  onSelectChapter: (chapter: number) => void;
  onSelectVerse: (book: string, chapter: number, verse: number) => void;
  isOpen: boolean;
  onClose: () => void;
  streak?: number;
}

type SidebarView = 'books' | 'chapters' | 'verses';

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentBook, onSelectBook, onSelectChapter, onSelectVerse, isOpen, onClose, streak = 0 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<SidebarView>('books');
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  useEffect(() => {
    if (currentBook) {
      if (view === 'books') setView('chapters');
    } else {
      setView('books');
      setSelectedChapter(null);
    }
  }, [currentBook]);

  const groupedBooks = useMemo<Record<string, BibleBook[]>>(() => {
    const filtered = BIBLE_BOOKS.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const groups: Record<string, BibleBook[]> = {};
    filtered.forEach(book => {
      if (!groups[book.category]) groups[book.category] = [];
      groups[book.category].push(book);
    });
    return groups;
  }, [searchTerm]);

  const activeBookData = BIBLE_BOOKS.find(b => b.name === currentBook);

  const handleBookClick = (bookName: string) => {
    onSelectBook(bookName);
    setView('chapters');
    setSelectedChapter(null);
    setSearchTerm('');
  };

  const handleChapterClick = (chapter: number) => {
    setSelectedChapter(chapter);
    setView('verses');
  };

  const handleVerseClick = (verse: number) => {
    if (activeBookData && selectedChapter) {
      onSelectVerse(activeBookData.name, selectedChapter, verse);
      if (window.innerWidth < 1024) onClose();
    }
  };

  const handleBack = () => {
    if (view === 'verses') { setView('chapters'); setSelectedChapter(null); }
    else if (view === 'chapters') { setView('books'); onSelectBook(''); }
  };

  const verseCount = (activeBookData && selectedChapter) 
    ? (VERSE_COUNTS[activeBookData.name]?.[selectedChapter - 1] || 20) 
    : 0;

  return (
    <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:w-80 bg-white border-r border-stone-200 z-50 transition-transform duration-300 ease-in-out flex flex-col h-full shadow-2xl lg:shadow-none`}>
      <div className="p-6 border-b border-stone-100 bg-bible-paper">
        <div className="flex items-center justify-between mb-8">
           {view === 'books' ? (
             <div className="flex items-center justify-between w-full">
               <h2 className="text-xl font-display font-bold text-bible-ink uppercase tracking-widest">Índice</h2>
               <button onClick={onClose} className="lg:hidden p-2 text-stone-400">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
           ) : (
             <div className="flex items-center gap-3">
               <button onClick={handleBack} className="p-2.5 rounded-full hover:bg-stone-100 text-stone-500 transition-all">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
               </button>
               <h2 className="text-lg font-display font-bold text-bible-ink truncate max-w-[180px]">
                 {view === 'chapters' ? activeBookData?.name : `${activeBookData?.name} ${selectedChapter}`}
               </h2>
             </div>
           )}
        </div>

        {view === 'books' && (
          <div className="relative">
            <input type="text" placeholder="Filtrar libros..." className="w-full px-5 py-3 rounded-2xl bg-stone-100 border-none focus:ring-2 focus:ring-bible-gold outline-none text-sm font-sans" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 absolute right-4 top-3.5 text-stone-400"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-bible-paper custom-scrollbar">
        {view === 'books' && Object.entries(groupedBooks).map(([category, books]: any) => (
          <div key={category} className="mb-8">
            <h3 className="text-[9px] font-bold text-bible-accent uppercase tracking-[0.4em] mb-4 ml-2 opacity-60">{CATEGORY_LABELS[category]}</h3>
            <div className="grid grid-cols-1 gap-1.5">
              {books.map((book: any) => (
                <button key={book.name} onClick={() => handleBookClick(book.name)} className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-medium transition-all ${currentBook === book.name ? 'bg-bible-leather text-white shadow-lg' : 'text-stone-600 hover:bg-stone-50 hover:pl-6'}`}>{book.name}</button>
              ))}
            </div>
          </div>
        ))}

        {view === 'chapters' && activeBookData && (
          <div className="animate-fade-in">
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-6 px-2">Capítulos:</h3>
            <div className="grid grid-cols-4 gap-2.5">{Array.from({ length: activeBookData.chapters }, (_, i) => i + 1).map(chap => (
                <button key={chap} onClick={() => handleChapterClick(chap)} className="aspect-square flex items-center justify-center text-sm font-bold rounded-2xl hover:bg-bible-gold hover:text-white transition-all bg-white border border-stone-100 text-stone-600 shadow-sm">{chap}</button>
              ))}</div>
          </div>
        )}

        {view === 'verses' && activeBookData && selectedChapter && (
           <div className="animate-fade-in">
              <button onClick={() => { onSelectChapter(selectedChapter); if (window.innerWidth < 1024) onClose(); }} className="w-full mb-8 py-5 bg-bible-gold text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-[1.5rem] hover:bg-bible-accent transition-all shadow-xl">
                Leer Capítulo
              </button>
              <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-6 px-2">Versículos:</h3>
              <div className="grid grid-cols-5 gap-2">{Array.from({ length: verseCount }, (_, i) => i + 1).map(verse => (
                  <button key={verse} onClick={() => handleVerseClick(verse)} className="aspect-square flex items-center justify-center text-[11px] font-bold rounded-xl hover:bg-bible-accent hover:text-white transition-all bg-white border border-stone-100 text-stone-500 shadow-sm">{verse}</button>
                ))}</div>
           </div>
        )}
      </div>
    </div>
  );
};
