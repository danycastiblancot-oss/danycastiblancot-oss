
import React, { useState, useEffect, useRef } from 'react';

interface ChapterExplanationProps {
  explanation: string;
}

export const ChapterExplanation: React.FC<ChapterExplanationProps> = ({ explanation }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Use a ref to keep the utterance alive and prevent garbage collection (Chrome bug)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Reset audio when explanation changes
    cancelSpeech();
    
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('es'));
      setVoices(available);
       // Default
      if (!selectedVoice && available.length > 0) {
        const preferred = available.find(v => v.name.includes('Google') || v.name.includes('Mexico')) || available[0];
        setSelectedVoice(preferred);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [explanation]);

  useEffect(() => {
    return () => cancelSpeech();
  }, []);

  const cancelSpeech = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    utteranceRef.current = null;
  };

  const toggleSpeed = () => {
    const newRate = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    setPlaybackRate(newRate);
    
    if (isPlaying) {
       cancelSpeech();
       setTimeout(() => handlePlay(), 50);
    }
  };

  const handlePlay = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(explanation);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.lang = 'es-ES';
    utterance.rate = playbackRate;
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (e) => {
      if (e.error === 'canceled' || e.error === 'interrupted') {
        setIsPlaying(false);
        setIsPaused(false);
        return;
      }
      console.error("Audio error:", e.error);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 mb-8 animate-fade-in relative overflow-visible">
      <div className="absolute top-0 left-0 w-1 h-full bg-bible-accent rounded-l-xl"></div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-display font-bold text-bible-ink flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-bible-gold">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.001 6.001 0 00-5.304-7.618 6.002 6.002 0 019.957 5.304c.42 2.15-1.65 4.314-4.653 2.314zm0 0l-7.05 4.633a1.125 1.125 0 01-1.373-1.634l-.75-7.5M12 18l7.05 4.633a1.125 1.125 0 001.373-1.634l-.75-7.5" />
            </svg>
            Contexto y Explicación
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-stone-400 uppercase tracking-wider font-bold">Audio Análisis</p>
            {isPlaying && !isPaused && (
               <span className="flex gap-0.5 items-end h-3">
                 <span className="w-0.5 bg-bible-gold animate-music-bar-1 h-2"></span>
                 <span className="w-0.5 bg-bible-gold animate-music-bar-2 h-3"></span>
                 <span className="w-0.5 bg-bible-gold animate-music-bar-3 h-1"></span>
               </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 bg-stone-50 p-2 rounded-full border border-stone-100 relative">
          
           {/* Settings */}
           <button 
             onClick={() => setShowSettings(!showSettings)}
             className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-stone-200 text-stone-700' : 'text-stone-400 hover:text-stone-600'}`}
             title="Configurar Voz"
          >
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
               <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.922-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
             </svg>
          </button>

          <button
            onClick={toggleSpeed}
            className="px-3 py-1.5 rounded-full bg-white shadow-sm text-stone-600 hover:text-bible-ink text-xs font-bold transition-all w-12 text-center"
          >
            {playbackRate}x
          </button>

          <button 
            onClick={handlePlay}
            className={`p-2.5 rounded-full transition-all flex items-center justify-center ${isPlaying ? 'bg-bible-leather text-white shadow-md' : 'bg-bible-gold text-white hover:bg-bible-accent'}`}
            title={isPlaying ? "Pausar" : "Escuchar"}
          >
            {isPlaying && !isPaused ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          {(isPlaying || isPaused) && (
            <button 
              onClick={cancelSpeech}
              className="p-2.5 rounded-full bg-white text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
              </svg>
            </button>
          )}

          {/* Voice Selection Dropdown */}
          {showSettings && (
             <div className="absolute top-full right-0 mt-2 bg-white border border-stone-200 rounded-lg shadow-xl z-20 w-48 p-2 animate-fade-in">
                <label className="block text-xs font-bold text-stone-400 uppercase mb-2 px-1">Voz</label>
                <div className="max-h-40 overflow-y-auto space-y-1">
                   {voices.length > 0 ? voices.map((voice) => (
                     <button
                       key={voice.name}
                       onClick={() => {
                         setSelectedVoice(voice);
                         setShowSettings(false);
                         if(isPlaying) {
                           cancelSpeech();
                           setTimeout(handlePlay, 100);
                         }
                       }}
                       className={`w-full text-left px-2 py-1.5 text-xs rounded truncate ${selectedVoice?.name === voice.name ? 'bg-bible-gold/10 text-bible-gold font-bold' : 'text-stone-600 hover:bg-stone-50'}`}
                     >
                       {voice.name.replace('Microsoft', '').replace('Google', '').trim()}
                     </button>
                   )) : (
                     <div className="text-xs text-stone-400 px-2">Cargando voces...</div>
                   )}
                </div>
             </div>
           )}
        </div>
      </div>

      <style>{`
        @keyframes music-bar {
          0%, 100% { height: 20%; }
          50% { height: 100%; }
        }
        .animate-music-bar-1 { animation: music-bar 0.8s infinite ease-in-out; }
        .animate-music-bar-2 { animation: music-bar 0.8s infinite ease-in-out 0.2s; }
        .animate-music-bar-3 { animation: music-bar 0.8s infinite ease-in-out 0.4s; }
      `}</style>
      
      <div className="prose prose-stone prose-sm max-w-none">
        <p className="text-stone-700 leading-relaxed font-serif text-base text-justify whitespace-pre-wrap">
          {explanation}
        </p>
      </div>
    </div>
  );
};
