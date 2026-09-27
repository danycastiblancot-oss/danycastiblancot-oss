import React, { useMemo } from 'react';
import { Highlight } from '../types';

interface HighlightableVerseProps {
  text: string;
  highlights: Highlight[];
  fontSize: number;
  lineHeight: number;
  activeCharIndex?: number | null; 
}

export const HighlightableVerse: React.FC<HighlightableVerseProps> = ({ 
  text, 
  highlights, 
  fontSize, 
  lineHeight,
  activeCharIndex
}) => {
  
  const getUserHighlightClass = (colorName: string) => {
    switch (colorName) {
      case 'yellow': return 'bg-yellow-200/50';
      case 'green': return 'bg-green-200/50';
      case 'blue': return 'bg-blue-200/50';
      case 'pink': return 'bg-pink-200/50';
      default: return 'bg-yellow-200/50';
    }
  };

  const wordSegments = useMemo(() => {
    // Dividir por espacios preservándolos
    const parts = text.split(/(\s+)/);
    let runningIndex = 0;
    
    return parts.map((part) => {
      const start = runningIndex;
      const end = runningIndex + part.length;
      runningIndex = end;

      const userHl = highlights?.find(h => start >= h.start && end <= h.end);
      
      // Determinar si esta palabra es la que se está leyendo
      const isKaraokeActive = activeCharIndex !== null && 
                              activeCharIndex !== undefined && 
                              activeCharIndex >= start && 
                              activeCharIndex < end;

      return {
        text: part,
        userColor: userHl ? userHl.color : null,
        isKaraoke: isKaraokeActive && !/^\s+$/.test(part)
      };
    });
  }, [text, highlights, activeCharIndex]);

  return (
    <p 
      className="font-serif text-bible-ink mb-2 transition-all duration-300 relative selectable-text"
      style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
    >
      {wordSegments.map((seg, i) => (
        <span 
          key={i} 
          className={`
            rounded-sm px-0.5 box-decoration-clone transition-all duration-200
            ${seg.isKaraoke ? 'bg-bible-gold text-white shadow-sm font-bold scale-110 inline-block relative z-10' : ''}
            ${!seg.isKaraoke && seg.userColor ? getUserHighlightClass(seg.userColor) : ''}
          `}
        >
          {seg.text}
        </span>
      ))}
    </p>
  );
};