
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Heart, 
  Calendar, 
  GraduationCap, 
  Bookmark, 
  Search, 
  ArrowLeft, 
  LayoutGrid,
  Sparkles,
  Flame,
  Settings2,
  ChevronRight,
  Menu,
  X,
  User
} from 'lucide-react';
import { ContextPanel } from './components/ContextPanel';
import { NoteEditor } from './components/NoteEditor';
import { ChapterExplanation } from './components/ChapterExplanation';
import { HighlightableVerse } from './components/HighlightableVerse';
import { TextAudioPlayer } from './components/TextAudioPlayer';
import { MoodSelector } from './components/MoodSelector';
import { SavedContent } from './components/SavedContent';
import { StudyMode } from './components/StudyMode';
import { ShareableImage } from './components/ShareableImage';
import { ReadingGoalSelector } from './components/ReadingGoalSelector';
import { TheologyTutor } from './components/TheologyTutor';
import { BiographyView } from './components/BiographyView';
import { AuthButton } from './components/AuthButton';
import { geminiService } from './services/geminiService';
import { userService } from './services/userService';
import { localStorageService } from './services/localStorageService';
import { BibleBookModel } from './models/BibleBook';
import { UserStatsModel } from './models/UserStats';
import { AudioSyncManager } from './models/AudioSyncManager';
import { ChapterResponse, LoadingState, ReadingPlanItem, SearchResult, DailyDevotional, Highlight, MoodResult } from './types';
import { BIBLE_BOOKS, CATEGORY_LABELS } from './constants';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const getNoteKey = (book: string, chapter: number, verse: number) => localStorageService.getNoteKey(book, chapter, verse);
const getHighlightKey = (book: string, chapter: number, verse: number) => localStorageService.getHighlightKey(book, chapter, verse);

function App() {
  const [currentBook, setCurrentBook] = useState<string>('');
  const [currentChapter, setCurrentChapter] = useState<number>(1);
  const [data, setData] = useState<ChapterResponse | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [isContextOpen, setContextOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'home' | 'reader' | 'plan' | 'search' | 'devotional' | 'mood' | 'saved' | 'study' | 'biography'>('home');
  const [devotional, setDevotional] = useState<DailyDevotional | null>(null);
  const [loadingDevotional, setLoadingDevotional] = useState(false);
  const [moodResults, setMoodResults] = useState<MoodResult[]>([]);
  const [loadingMood, setLoadingMood] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userNotes, setUserNotes] = useState<Record<string, string>>({});
  const [verseHighlights, setVerseHighlights] = useState<Record<string, Highlight[]>>({});
  const [fontSize, setFontSize] = useState<number>(18); 
  const [lineHeight, setLineHeight] = useState<number>(1.625); 
  const [isReaderTutorOpen, setIsReaderTutorOpen] = useState(false);
  const [tutorTopic, setTutorTopic] = useState<string>('');
  const [audioActiveVerse, setAudioActiveVerse] = useState<number | null>(null);
  const [globalAudioCharIndex, setGlobalAudioCharIndex] = useState<number>(0);
  const [userStats, setUserStats] = useState<UserStatsModel | null>(null);
  const [bibleBrowserView, setBibleBrowserView] = useState<'books' | 'chapters'>('books');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Instancia del gestor de audio orientado a objetos
  const audioSyncManager = useMemo(() => {
    return new AudioSyncManager(data?.verses || []);
  }, [data]);

  const verseOffsets = useMemo(() => {
    return audioSyncManager.getOffsets();
  }, [audioSyncManager]);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const handleAudioProgress = (charIndex: number) => {
     setGlobalAudioCharIndex(charIndex); 
     const activeVerseNumber = audioSyncManager.findActiveVerse(charIndex);
     if (activeVerseNumber !== null && activeVerseNumber !== audioActiveVerse) {
        setAudioActiveVerse(activeVerseNumber);
        const el = document.getElementById(`verse-${activeVerseNumber}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
     }
  };

  useEffect(() => {
    // Carga de notas y resaltados usando el servicio POO LocalStorageService
    setUserNotes(localStorageService.loadUserNotes());
    setVerseHighlights(localStorageService.loadVerseHighlights());
    
    // Autenticación y persistencia con servicio de usuario POO
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const stats = await userService.getUserStats(user.uid);
        if (stats) setUserStats(stats);
        else setUserStats(UserStatsModel.createDefault());
      } else {
        setUserStats(localStorageService.loadUserStats());
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchChapter = async (book: string, chapter: number) => {
    setLoadingState(LoadingState.LOADING);
    setData(null);
    setAudioActiveVerse(null);
    setGlobalAudioCharIndex(0);
    setContextOpen(false); 
    try {
      const result = await geminiService.getBibleChapter(book, chapter);
      setData(result);
      setLoadingState(LoadingState.SUCCESS);
      setTutorTopic(`${result.metadata.book_name} Capítulo ${result.metadata.chapter_number}`);
      
      // Persistir progreso utilizando la clase UserService
      if (auth.currentUser) {
        userService.saveReadingProgress(auth.currentUser.uid, book, chapter).catch(console.error);
        
        if (userStats) {
          const updatedStats = new UserStatsModel(userStats);
          updatedStats.addXP(10);
          setUserStats(updatedStats);
          userService.saveUserStats(auth.currentUser.uid, updatedStats).catch(console.error);
        }
      } else if (userStats) {
        const updatedStats = new UserStatsModel(userStats);
        updatedStats.addXP(10);
        setUserStats(updatedStats);
        localStorageService.saveUserStats(updatedStats);
      }
    } catch (error) {
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleSelectBook = (book: string) => { 
    setCurrentBook(book); 
    setBibleBrowserView('chapters');
  };

  const handleSelectChapter = (chapter: number) => {
    setCurrentChapter(chapter);
    fetchChapter(currentBook, chapter);
    setViewMode('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setData(null); setLoadingState(LoadingState.IDLE); setViewMode('home');
    setCurrentBook(''); setCurrentChapter(1); setSearchQuery('');
    setBibleBrowserView('books');
    setContextOpen(false);
  };

  const handleNavigate = (mode: 'reader' | 'plan' | 'devotional' | 'mood' | 'saved' | 'study' | 'biography') => {
    if (mode === 'reader') { 
      setViewMode('reader');
      if (!data) setBibleBrowserView('books');
    }
    else if (mode === 'plan') setViewMode('plan');
    else if (mode === 'devotional') loadDevotional();
    else if (mode === 'mood') setViewMode('mood');
    else if (mode === 'saved') setViewMode('saved');
    else if (mode === 'study') setViewMode('study');
    else if (mode === 'biography') setViewMode('biography');
  };

  const loadDevotional = async () => {
    setViewMode('devotional');
    if (!devotional) {
      setLoadingDevotional(true);
      try { const result = await geminiService.getDailyDevotional(); setDevotional(result); } catch (e) {} finally { setLoadingDevotional(false); }
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setViewMode('search'); setIsSearching(true); setSearchResults([]);
    try { const results = await geminiService.searchBible(searchQuery); setSearchResults(results); } catch (error) {} finally { setIsSearching(false); }
  };

  const handleNextChapter = () => {
    const bookIndex = BIBLE_BOOKS.findIndex(b => b.name === currentBook);
    if (bookIndex === -1) return;

    if (currentChapter < BIBLE_BOOKS[bookIndex].chapters) {
      handleSelectChapter(currentChapter + 1);
    } else if (bookIndex < BIBLE_BOOKS.length - 1) {
      const nextBook = BIBLE_BOOKS[bookIndex + 1];
      setCurrentBook(nextBook.name);
      setCurrentChapter(1);
      fetchChapter(nextBook.name, 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevChapter = () => {
    const bookIndex = BIBLE_BOOKS.findIndex(b => b.name === currentBook);
    if (bookIndex === -1) return;

    if (currentChapter > 1) {
      handleSelectChapter(currentChapter - 1);
    } else if (bookIndex > 0) {
      const prevBook = BIBLE_BOOKS[bookIndex - 1];
      setCurrentBook(prevBook.name);
      setCurrentChapter(prevBook.chapters);
      fetchChapter(prevBook.name, prevBook.chapters);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const activeBookData = BIBLE_BOOKS.find(b => b.name === currentBook);
  const bookIndex = BIBLE_BOOKS.findIndex(b => b.name === currentBook);
  const hasPrev = currentChapter > 1 || bookIndex > 0;
  const hasNext = bookIndex !== -1 && (currentChapter < BIBLE_BOOKS[bookIndex].chapters || bookIndex < BIBLE_BOOKS.length - 1);

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden font-sans selection:bg-bible-gold/30 text-bible-ink">
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="sticky top-0 z-40 glass-card mx-4 mt-4 rounded-3xl border-stone-200/50 p-3 flex items-center justify-between shadow-soft">
          <div className="flex items-center gap-3">
            {viewMode !== 'home' && (
              <button onClick={handleGoHome} className="p-2.5 text-bible-leather flex items-center gap-2 bg-white/50 rounded-2xl hover:bg-white transition-all shadow-sm active:scale-95">
                 <ArrowLeft size={18} strokeWidth={2.5} />
                 <span className="text-xs font-bold uppercase tracking-wider text-bible-ink">Inicio</span>
              </button>
            )}
            {viewMode === 'home' && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-2xl border border-white/40">
                <Flame size={18} className="text-orange-500 fill-orange-500 animate-pulse" />
                <span className="text-xs font-extra-bold text-bible-ink whitespace-nowrap">{userStats?.streak || 0} DÍAS</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 max-w-md mx-6 group">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-bible-gold transition-colors" />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar sabiduría..." 
                className="w-full bg-stone-100/50 border border-transparent focus:border-bible-gold/30 rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:ring-4 focus:ring-bible-gold/5 outline-none transition-all placeholder:text-stone-400/80" 
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AuthButton />
            {viewMode === 'reader' && data && (
               <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setContextOpen(!isContextOpen)} 
                    className={`p-2.5 rounded-2xl transition-all shadow-sm active:scale-95 ${isContextOpen ? 'bg-bible-gold text-white' : 'bg-white/50 text-stone-500 hover:text-bible-gold'}`} 
                    title="Contexto Profundo"
                  >
                    <Sparkles size={20} />
                  </button>
                  <button 
                    onClick={() => { setData(null); setBibleBrowserView('books'); setLoadingState(LoadingState.IDLE); }} 
                    className="p-2.5 bg-white/50 text-stone-500 hover:text-bible-leather rounded-2xl transition-all shadow-sm active:scale-95" 
                    title="Cambiar Libro"
                  >
                    <BookOpen size={20} />
                  </button>
               </div>
            )}
          </div>
        </header>

        <main id="bible-content-area" className="flex-1 overflow-y-auto px-4 py-6 md:p-8 lg:p-12 scroll-smooth">
          <AnimatePresence mode="wait">
            {loadingState === LoadingState.ERROR && (
               <motion.div 
                 key="error"
                 initial={{ opacity: 0, rotateY: 10 }}
                 animate={{ opacity: 1, rotateY: 0 }}
                 exit={{ opacity: 0, rotateY: -10 }}
                 className="flex flex-col items-center justify-center py-20 text-center px-4"
               >
                  <div className="w-24 h-24 bg-red-50 text-red-400 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
                     <X size={48} />
                  </div>
                  <h2 className="text-3xl font-display font-bold text-bible-ink mb-4">No pudimos cargar la Palabra</h2>
                  <button onClick={() => fetchChapter(currentBook, currentChapter)} className="px-10 py-4 bg-bible-leather text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all uppercase tracking-widest text-sm">Intentar de nuevo</button>
               </motion.div>
            )}

            {viewMode === 'home' && (
               <motion.div 
                 key="home"
                 initial={{ opacity: 0, rotateY: 20 }}
                 animate={{ opacity: 1, rotateY: 0 }}
                 exit={{ opacity: 0, rotateY: -20 }}
                 transition={{ duration: 0.5 }}
                 className="max-w-6xl mx-auto py-12 px-4"
               >
                  <div className="mb-20 relative">
                     {deferredPrompt && (
                        <motion.div 
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-12 p-5 bg-bible-paper border border-bible-gold/30 rounded-[2rem] flex items-center justify-between shadow-gold animate-float"
                        >
                          <div className="flex items-center gap-4">
                             <div className="p-3 bg-bible-gold rounded-2xl text-white shadow-lg">
                                <Sparkles size={24} />
                             </div>
                             <div>
                                <p className="text-sm font-bold text-bible-ink">Instalar Academia ABBA</p>
                                <p className="text-[10px] text-stone-500 font-medium uppercase tracking-widest">Acceso directo desde tu pantalla de inicio</p>
                             </div>
                          </div>
                          <button 
                            onClick={handleInstallClick}
                            className="px-8 py-3 bg-bible-leather text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-95"
                          >
                            Instalar
                          </button>
                        </motion.div>
                     )}

                     <motion.div 
                        initial={{ scale: 0.8, rotate: -3 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="w-48 h-64 bg-bible-leather rounded-[0.5rem] flex flex-col items-center justify-center mx-auto mb-10 shadow-2xl relative border-r-8 border-bible-gold"
                     >
                        <div className="absolute inset-y-4 left-4 w-0.5 bg-white/10"></div>
                        <div className="absolute inset-y-4 left-6 w-0.5 bg-white/5"></div>
                        <BookOpen size={64} className="text-bible-gold mb-4" />
                        <span className="font-display font-bold text-bible-gold text-xl tracking-widest">ABBA</span>
                        <div className="mt-8 px-6 text-center">
                           <div className="h-px w-full bg-bible-gold/20 mb-2"></div>
                           <span className="text-[8px] text-bible-gold uppercase tracking-[0.3em] font-extra-bold">Sagrada Escritura</span>
                        </div>
                     </motion.div>
                     
                     <div className="text-center">
                        <h1 className="text-6xl md:text-8xl font-display font-bold text-bible-ink mb-4 tracking-tighter uppercase">
                          ABBA
                        </h1>
                        <div className="flex items-center justify-center gap-4 mb-6">
                           <div className="h-px w-12 bg-bible-gold/30"></div>
                           <span className="text-bible-accent font-bold uppercase tracking-[0.6em] text-[10px]">Academia Teológica</span>
                           <div className="h-px w-12 bg-bible-gold/30"></div>
                        </div>
                        <p className="max-w-md mx-auto text-stone-500 font-medium text-sm leading-relaxed">
                          La experiencia bíblica inmersiva diseñada como una biblioteca teológica viva.
                        </p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     {[
                        { mode: 'reader', label: 'Explorar', sub: 'TEXTOS SAGRADOS', icon: <BookOpen className="text-amber-600" />, color: 'hover:bg-amber-100/50' },
                        { mode: 'devotional', label: 'Devocional', sub: 'PAN DE VIDA', icon: <Sparkles className="text-emerald-600" />, color: 'hover:bg-emerald-100/50' },
                        { mode: 'plan', label: 'Rutas', sub: 'PLAN DE LECTURA', icon: <Calendar className="text-blue-600" />, color: 'hover:bg-blue-100/50' },
                        { mode: 'study', label: 'Academia', sub: 'CURSOS Y QUICES', icon: <GraduationCap className="text-purple-600" />, color: 'hover:bg-purple-100/50' },
                        { mode: 'mood', label: 'Guía', sub: 'SEGÚN TUS EMOCIONES', icon: <Heart className="text-rose-600" />, color: 'hover:bg-rose-100/50' },
                        { mode: 'saved', label: 'Tesoro', sub: 'MIS MARCAS Y NOTAS', icon: <Bookmark className="text-stone-600" />, color: 'hover:bg-stone-200/50' },
                        { mode: 'biography', label: 'Héroes', sub: 'BIOGRAFÍAS BÍBLICAS', icon: <User className="text-orange-600" />, color: 'hover:bg-orange-100/50' },
                     ].map((item: any, idx) => (
                        <motion.button 
                          key={item.mode}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => handleNavigate(item.mode)} 
                          className={`bg-white p-8 rounded-[2.5rem] shadow-soft border border-white/20 hover:shadow-glass hover:-translate-y-2 transition-all flex flex-col items-start text-left group overflow-hidden relative active:scale-95 ${item.color}`}
                        >
                           <div className="p-4 bg-stone-50 rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-inner">
                              {item.icon}
                           </div>
                           <div>
                              <p className="text-[10px] font-extra-bold text-bible-accent/60 uppercase tracking-widest mb-1">{item.sub}</p>
                              <h3 className="text-2xl font-display font-bold text-bible-ink flex items-center gap-2">
                                {item.label}
                                <ChevronRight size={18} className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-bible-gold" />
                              </h3>
                           </div>
                        </motion.button>
                     ))}
                  </div>
               </motion.div>
            )}

            {viewMode === 'biography' && (
              <motion.div
                key="biography"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <BiographyView onBack={handleGoHome} />
              </motion.div>
            )}

            {viewMode === 'reader' && loadingState !== LoadingState.ERROR && (
              <motion.div 
                key={viewMode + bibleBrowserView + (data?.metadata?.book_name || '') + currentChapter}
                initial={{ opacity: 0, rotateY: 15, x: 30 }}
                animate={{ opacity: 1, rotateY: 0, x: 0 }}
                exit={{ opacity: 0, rotateY: -15, x: -30 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                className="max-w-4xl mx-auto origin-left"
              >
                {!data && loadingState !== LoadingState.LOADING && (
                   <div className="py-4">
                      {bibleBrowserView === 'books' ? (
                         <div className="max-w-4xl mx-auto py-8">
                            <div className="text-center mb-16">
                               <motion.h2 
                                 initial={{ opacity: 0, y: -20 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 className="text-4xl font-display font-bold text-bible-ink mb-4"
                               >
                                 Índice de la <span className="text-bible-gold">Biblioteca</span>
                               </motion.h2>
                               <p className="text-stone-400 font-extra-bold uppercase tracking-[0.3em] text-[10px]">Selecciona un pergamino para estudiar</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                               {BIBLE_BOOKS.map((book, idx) => (
                                  <motion.button
                                    key={book.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.01 }}
                                    onClick={() => handleSelectBook(book.name)}
                                    className="group flex items-center justify-between p-6 bg-white border border-stone-100 rounded-2xl hover:border-bible-gold/30 hover:shadow-lg transition-all text-left relative overflow-hidden active:scale-95 shadow-soft"
                                  >
                                    <div className="flex items-center gap-4 relative z-10">
                                      <span className="text-2xl font-display font-bold text-bible-gold/20 group-hover:text-bible-gold transition-colors">{idx + 1}</span>
                                      <div>
                                        <h4 className="font-display font-bold text-bible-ink group-hover:text-bible-leather transition-colors">{book.name}</h4>
                                        <p className="text-[10px] text-stone-400 font-extra-bold uppercase tracking-widest">{book.chapters} Capítulos</p>
                                      </div>
                                    </div>
                                    <ChevronRight size={16} className="text-stone-300 group-hover:text-bible-gold transition-colors relative z-10" />
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-bible-gold/50 transition-all"></div>
                                  </motion.button>
                               ))}
                            </div>
                         </div>
                      ) : (
                         <div className="text-center py-12 px-4">
                            <motion.span 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-bible-accent text-[10px] font-extra-bold uppercase tracking-[0.8em] mb-4 block"
                            >
                              Selecciona Capítulo
                            </motion.span>
                            <motion.h2 
                              initial={{ scale: 0.9 }}
                              animate={{ scale: 1 }}
                              className="text-6xl md:text-8xl font-display font-bold text-bible-ink mb-16 tracking-tightest uppercase underline decoration-bible-gold/20 underline-offset-8"
                            >
                              {activeBookData?.name}
                            </motion.h2>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                               {Array.from({ length: activeBookData?.chapters || 0 }, (_, i) => i + 1).map((chap, idx) => (
                                  <motion.button 
                                    key={chap} 
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.01 }}
                                    onClick={() => handleSelectChapter(chap)} 
                                    className="aspect-square flex items-center justify-center text-xl font-display font-bold rounded-2xl bg-white border border-white/50 text-bible-ink shadow-soft hover:bg-bible-leather hover:text-white hover:scale-110 active:scale-90 transition-all"
                                  >
                                    {chap}
                                  </motion.button>
                               ))}
                            </div>
                         </div>
                      )}
                   </div>
                )}

                {loadingState === LoadingState.LOADING && ( 
                  <div className="space-y-10 pt-20 px-4">
                    <div className="h-20 bg-white/50 blur-sm rounded-[3rem] w-1/2 mx-auto animate-pulse"></div>
                    <div className="space-y-6 mt-20">
                      <div className="h-4 bg-stone-200 rounded-full w-full"></div>
                      <div className="h-4 bg-stone-200 rounded-full w-5/6"></div>
                      <div className="h-4 bg-stone-200 rounded-full w-4/6"></div>
                    </div>
                  </div>
                )}

                {loadingState === LoadingState.SUCCESS && data && (
                  <div className="pb-40 relative">
                    {/* Introducción Contextual del Libro (Visible prominentemente en el Capítulo 1) */}
                    {currentChapter === 1 ? (
                       <motion.div 
                         initial={{ opacity: 0, y: 30 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="mb-16 p-8 md:p-12 bg-white/60 border border-white rounded-[3.5rem] shadow-glass backdrop-blur-xl relative overflow-hidden"
                       >
                          <div className="absolute top-0 right-0 p-8 text-bible-gold/5 opacity-50">
                             <Sparkles size={160} strokeWidth={1} />
                          </div>
                          
                          <div className="relative z-10">
                             <div className="flex flex-wrap items-center gap-3 mb-8">
                                <div className="px-4 py-1.5 bg-bible-gold/10 text-bible-accent rounded-full text-[10px] font-extra-bold uppercase tracking-widest border border-bible-gold/10">
                                   {data.metadata.category_group}
                                </div>
                                <div className="px-4 py-1.5 bg-stone-100 text-stone-500 rounded-full text-[10px] font-extra-bold uppercase tracking-widest border border-stone-200/30">
                                   Escriba: {data.metadata.author}
                                </div>
                             </div>
                             
                             <h2 className="text-4xl md:text-7xl font-display font-bold text-bible-ink mb-2 tracking-tightest">
                                {data.metadata.book_name}
                             </h2>
                             <p className="text-stone-400 font-extra-bold uppercase tracking-[0.4em] text-[10px] mb-12">Introducción y Contexto de la Biblioteca ABBA</p>
                             
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                                <div className="space-y-8">
                                   <div className="p-6 bg-white/50 rounded-2xl border border-white shadow-soft">
                                      <h4 className="text-[10px] font-black text-bible-accent uppercase tracking-widest mb-3 flex items-center gap-2">
                                         <div className="w-1.5 h-1.5 rounded-full bg-bible-gold"></div>
                                         Propósito Divino
                                      </h4>
                                      <p className="text-stone-600 font-medium text-sm leading-relaxed">{data.metadata.purpose}</p>
                                   </div>
                                   <div className="p-6 bg-white/50 rounded-2xl border border-white shadow-soft">
                                      <h4 className="text-[10px] font-black text-bible-accent uppercase tracking-widest mb-3 flex items-center gap-2">
                                         <div className="w-1.5 h-1.5 rounded-full bg-bible-gold"></div>
                                         Audiencia y Contexto
                                      </h4>
                                      <p className="text-stone-600 font-medium text-sm leading-relaxed">{data.metadata.historical_setting}</p>
                                   </div>
                                </div>
                                <div className="space-y-8">
                                   <div className="p-10 bg-bible-leather text-white rounded-3xl shadow-2xl relative group hover:-translate-y-1 transition-all">
                                      <h4 className="text-[10px] font-black text-bible-gold uppercase tracking-[0.3em] mb-4">Análisis Teológico</h4>
                                      <p className="font-display font-medium text-lg leading-relaxed italic opacity-90">
                                         "{data.metadata.detailed_explanation}"
                                      </p>
                                      <div className="absolute bottom-6 right-8 text-white/10 group-hover:scale-110 transition-transform">
                                         <BookOpen size={48} />
                                      </div>
                                   </div>
                                   <div className="flex gap-4">
                                      <div className="flex-1 p-5 bg-stone-50 rounded-2xl border border-stone-100">
                                         <h4 className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1 text-center">Época</h4>
                                         <p className="text-bible-ink font-bold text-center text-xs">{data.metadata.estimated_date}</p>
                                      </div>
                                      <div className="flex-1 p-5 bg-stone-50 rounded-2xl border border-stone-100">
                                         <h4 className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1 text-center">Orden</h4>
                                         <p className="text-bible-ink font-bold text-center text-xs">{data.metadata.chronological_order}</p>
                                      </div>
                                   </div>
                                </div>
                             </div>

                             <div className="h-px w-full bg-gradient-to-r from-transparent via-bible-gold/20 to-transparent"></div>
                          </div>
                       </motion.div>
                    ) : (
                      <div className="text-center mb-16 px-4">
                        <motion.span 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-bible-accent uppercase tracking-[0.5em] text-[10px] font-extra-bold mb-6 block"
                        >
                          Capítulo {data.metadata.chapter_number}
                        </motion.span>
                        <motion.h1 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-6xl lg:text-8xl font-display font-bold text-bible-ink leading-none mb-4"
                        >
                          {data.metadata.book_name}
                        </motion.h1>
                      </div>
                    )}

                    <div className="sticky top-24 z-30 mb-20">
                      <div className="max-w-2xl mx-auto glass-card p-2 rounded-full shadow-glass border-white/40 flex items-center gap-4 pr-6">
                        <div className="flex-1">
                          <TextAudioPlayer 
                            text={data.verses.map(v => v.text).join(' ')} 
                            title="Escuchar Revelación" 
                            className="bg-transparent border-none" 
                            showText={false} 
                            onBoundary={handleAudioProgress} 
                          />
                        </div>
                        <div className="flex gap-1.5 p-1 bg-stone-100/50 rounded-full border border-stone-200/20">
                           <button onClick={() => setFontSize(s => Math.max(14, s - 2))} className="w-8 h-8 flex items-center justify-center bg-white rounded-full hover:bg-stone-200 text-xs font-serif transition-colors shadow-sm">A-</button>
                           <button onClick={() => setFontSize(s => Math.min(32, s + 2))} className="w-8 h-8 flex items-center justify-center bg-white rounded-full hover:bg-stone-200 text-lg font-serif transition-colors shadow-sm">A+</button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-16 px-4">
                      {data.verses.map((verse) => {
                        const isAudioActive = audioActiveVerse === verse.number;
                        let localIndex = null;
                        if (isAudioActive) {
                          const offsetData = verseOffsets.find(v => v.verse === verse.number);
                          if (offsetData) localIndex = globalAudioCharIndex - offsetData.start;
                        }
                        return (
                          <motion.div 
                            id={`verse-${verse.number}`} 
                            key={verse.number} 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            className={`relative transition-all duration-500 rounded-[2.5rem] p-8 -mx-4 lg:-mx-8 ${isAudioActive ? 'bg-bible-gold/5 ring-2 ring-bible-gold/20 shadow-lg' : 'hover:bg-white/40 border-l-4 border-transparent hover:border-bible-gold/10'}`}
                          >
                            <div className="absolute -left-12 top-10 flex flex-col items-center gap-2 group cursor-pointer" onClick={() => {/* Mark favorite */}}>
                               <span className={`text-[11px] font-extra-bold transition-all ${isAudioActive ? 'text-bible-gold scale-125' : 'text-stone-300'}`}>{verse.number}</span>
                               <div className={`w-1 h-1 rounded-full transition-all ${isAudioActive ? 'bg-bible-gold h-4' : 'bg-stone-200 group-hover:h-2'}`}></div>
                            </div>
                            <HighlightableVerse text={verse.text} highlights={[]} fontSize={fontSize} lineHeight={lineHeight} activeCharIndex={localIndex} />
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="mt-40 pt-20 border-t border-stone-200/50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-20">
                         {hasPrev && (
                           <button onClick={handlePrevChapter} className="group flex items-center gap-5 p-6 bg-white shadow-soft rounded-[2.5rem] hover:shadow-glass hover:-translate-y-1 transition-all border border-transparent hover:border-bible-gold/20">
                              <div className="w-14 h-14 rounded-[1.2rem] bg-stone-50 flex items-center justify-center group-hover:bg-bible-ink group-hover:text-white transition-all text-bible-ink rotate-3 group-hover:rotate-0 shadow-inner">
                                <ArrowLeft size={24} />
                              </div>
                              <div className="text-left">
                                 <span className="block text-[10px] font-extra-bold text-bible-accent uppercase tracking-widest mb-1">Capítulo Anterior</span>
                                 <span className="block font-display font-bold text-bible-ink text-lg leading-tight">
                                   {currentChapter > 1 ? `${currentBook} ${currentChapter - 1}` : `${BIBLE_BOOKS[bookIndex - 1]?.name} ${BIBLE_BOOKS[bookIndex - 1]?.chapters}`}
                                 </span>
                              </div>
                           </button>
                         )}
                         {hasNext && (
                           <button onClick={handleNextChapter} className="group flex flex-row-reverse items-center justify-between gap-5 p-6 bg-white shadow-soft rounded-[2.5rem] hover:shadow-glass hover:-translate-y-1 transition-all border border-transparent hover:border-bible-gold/20 text-right">
                              <div className="w-14 h-14 rounded-[1.2rem] bg-stone-50 flex items-center justify-center group-hover:bg-bible-ink group-hover:text-white transition-all text-bible-ink -rotate-3 group-hover:rotate-0 shadow-inner">
                                <ChevronRight size={24} />
                              </div>
                              <div>
                                 <span className="block text-[10px] font-extra-bold text-bible-accent uppercase tracking-widest mb-1">Siguiente Capítulo</span>
                                 <span className="block font-display font-bold text-bible-ink text-lg leading-tight">
                                   {currentChapter < (BIBLE_BOOKS[bookIndex]?.chapters || 0) ? `${currentBook} ${currentChapter + 1}` : `${BIBLE_BOOKS[bookIndex + 1]?.name} 1`}
                                 </span>
                              </div>
                           </button>
                         )}
                      </div>
                      <ChapterExplanation explanation={data.metadata.detailed_explanation} />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {viewMode === 'plan' && ( 
              <motion.div key="plan" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <ReadingGoalSelector onNavigateToBible={(book, chapter) => {
                  setCurrentBook(book);
                  setCurrentChapter(chapter);
                  fetchChapter(book, chapter);
                  setViewMode('reader');
                }} />
              </motion.div>
            )}
            
            {viewMode === 'devotional' && devotional && (
              <motion.div key="devotional" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto pt-8 px-4">
                <div className="glass-card p-12 md:p-20 rounded-[4rem] shadow-glass relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 text-bible-gold/10 group-hover:text-bible-gold/20 transition-colors pointer-events-none">
                     <Flame size={120} strokeWidth={1} />
                   </div>
                   <div className="relative z-10 text-center">
                     <span className="text-[10px] font-extra-bold text-bible-accent uppercase tracking-[0.5em] mb-12 block">Palabra del Espíritu</span>
                     <h2 className="text-4xl lg:text-6xl font-serif text-bible-ink leading-tight mb-12 font-light italic">
                       "{devotional.verseText}"
                     </h2>
                     <button className="px-8 py-3 bg-bible-ink text-white rounded-full font-display font-bold text-xs uppercase tracking-widest hover:bg-bible-gold transition-colors shadow-lg">
                       {devotional.verseReference}
                     </button>
                   </div>
                </div>
              </motion.div>
            )}

            {viewMode === 'mood' && (
               <motion.div key="mood" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                 <MoodSelector onSelectMood={async (m) => { 
                   setSelectedMood(m); 
                   setLoadingMood(true); 
                   try { const r = await geminiService.getVersesByMood(m); setMoodResults(r); } finally { setLoadingMood(false); } 
                 }} />
               </motion.div>
            )}

            {viewMode === 'saved' && ( <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><SavedContent onNavigateToVerse={() => {}} onDeleteItem={() => {}} /></motion.div> )}
            {viewMode === 'study' && ( <motion.div key="study" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><StudyMode /></motion.div> )}
          </AnimatePresence>
        </main>
      </div>

      {isContextOpen && data && (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bible-ink/60 backdrop-blur-md z-[90] flex items-center justify-center p-4 lg:p-10" 
            onClick={() => setContextOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              className="w-full h-full max-w-6xl pointer-events-auto"
              onClick={e => e.stopPropagation()}
            >
              <ContextPanel metadata={data.metadata} isOpen={isContextOpen} onClose={() => setContextOpen(false)} isLoading={loadingState === LoadingState.LOADING} />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export default App;
