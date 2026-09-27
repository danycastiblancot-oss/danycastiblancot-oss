
import React, { useState, useRef } from 'react';

interface ShareableImageProps {
  verseText: string;
  verseReference: string;
  onClose: () => void;
}

const gradients = [
  { name: 'Sunset', class: 'bg-gradient-to-br from-orange-400 to-pink-600' },
  { name: 'Ocean', class: 'bg-gradient-to-br from-blue-400 to-emerald-600' },
  { name: 'Midnight', class: 'bg-gradient-to-br from-slate-900 to-slate-700' },
  { name: 'Royal', class: 'bg-gradient-to-br from-purple-600 to-blue-600' },
  { name: 'Paper', class: 'bg-stone-100 border-4 border-double border-stone-300 text-stone-800' },
  { name: 'Gold', class: 'bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-700' },
];

export const ShareableImage: React.FC<ShareableImageProps> = ({ verseText, verseReference, onClose }) => {
  const [selectedGradient, setSelectedGradient] = useState(gradients[0]);
  const canvasRef = useRef<HTMLDivElement>(null);

  // In a real production app, we would use html2canvas here. 
  // Since we are in a strictly React environment without extra deps easily added,
  // we will simulate the experience or rely on the user screenshotting it, 
  // but I will add the logic structure for it.
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-stone-100 flex justify-between items-center">
          <h3 className="font-bold text-bible-ink">Crear Imagen</h3>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-800">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-stone-50">
          
          {/* Preview Area */}
          <div className="flex justify-center mb-6">
            <div 
              ref={canvasRef}
              className={`aspect-square w-full max-w-[320px] shadow-xl rounded-lg p-8 flex flex-col justify-center items-center text-center transition-all duration-500 ${selectedGradient.class}`}
            >
              <div className={`${selectedGradient.name === 'Paper' ? 'text-bible-ink' : 'text-white drop-shadow-md'}`}>
                <p className="font-display font-bold text-xl md:text-2xl mb-4 leading-relaxed">
                  "{verseText}"
                </p>
                <p className="font-sans text-sm tracking-widest uppercase font-bold opacity-90">
                  {verseReference}
                </p>
                <div className="mt-8 pt-4 border-t border-white/30 text-[10px] font-bold tracking-widest opacity-75">
                  ABBA BIBLIA
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Estilo de Fondo</label>
            <div className="grid grid-cols-6 gap-2">
              {gradients.map((g) => (
                <button
                  key={g.name}
                  onClick={() => setSelectedGradient(g)}
                  className={`w-full aspect-square rounded-full ${g.class} ${selectedGradient.name === g.name ? 'ring-2 ring-offset-2 ring-bible-gold' : ''}`}
                  title={g.name}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-stone-100 bg-white flex justify-between items-center gap-4">
          <p className="text-xs text-stone-400 italic">Toma una captura o...</p>
          <button 
             className="flex-1 bg-bible-leather text-white py-3 rounded-xl font-bold hover:bg-bible-ink transition-colors flex items-center justify-center gap-2"
             onClick={() => alert("¡Funcionalidad simulada! En la versión final, esto descargará la imagen a tu galería.")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 12.75l-3.375-3.375M12 12.75l3.375-3.375M12 12.75V3" />
            </svg>
            Descargar Imagen
          </button>
        </div>
      </div>
    </div>
  );
};
