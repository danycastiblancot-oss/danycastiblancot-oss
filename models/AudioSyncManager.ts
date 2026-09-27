import { Verse } from '../types';

export interface VerseOffset {
  verse: number;
  start: number;
  end: number;
}

/**
 * Clase encargada de gestionar el cálculo de posiciones y sincronización de audio con versículos.
 */
export class AudioSyncManager {
  private offsets: VerseOffset[] = [];

  constructor(verses: Verse[] = []) {
    if (verses.length > 0) {
      this.calculateOffsets(verses);
    }
  }

  /**
   * Recalcula los desplazamientos de caracteres para una lista de versículos.
   */
  public calculateOffsets(verses: Verse[]): VerseOffset[] {
    let currentOffset = 0;
    this.offsets = verses.map(v => {
      const start = currentOffset;
      const length = v.text.length;
      currentOffset += length + 1; // espacio adicional
      return { verse: v.number, start, end: start + length };
    });
    return this.offsets;
  }

  /**
   * Encuentra el número de versículo correspondiente a un índice de carácter en el audio.
   */
  public findActiveVerse(charIndex: number): number | null {
    if (this.offsets.length === 0) return null;
    const match = this.offsets.find(v => charIndex >= v.start && charIndex <= v.end);
    return match ? match.verse : null;
  }

  /**
   * Obtiene todos los desplazamientos calculados.
   */
  public getOffsets(): VerseOffset[] {
    return [...this.offsets];
  }
}
