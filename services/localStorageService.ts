import { Highlight, UserStats } from '../types';
import { UserStatsModel } from '../models/UserStats';

/**
 * Servicio en POO para administrar el almacenamiento local (localStorage).
 */
export class LocalStorageService {
  private static instance: LocalStorageService;
  private readonly STATS_KEY = 'abba_bible_stats';

  private constructor() {}

  /**
   * Obtiene la instancia única del servicio (Patrón Singleton).
   */
  public static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  /**
   * Obtiene la clave para una nota guardada.
   */
  public getNoteKey(book: string, chapter: number, verse: number): string {
    return `note-${book}-${chapter}-${verse}`;
  }

  /**
   * Obtiene la clave para los resaltados de un versículo.
   */
  public getHighlightKey(book: string, chapter: number, verse: number): string {
    return `highlights-v2-${book}-${chapter}-${verse}`;
  }

  /**
   * Carga todas las notas de usuario guardadas localmente.
   */
  public loadUserNotes(): Record<string, string> {
    const loadedNotes: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('note-')) {
        loadedNotes[key] = localStorage.getItem(key) || '';
      }
    }
    return loadedNotes;
  }

  /**
   * Carga todos los resaltados guardados localmente.
   */
  public loadVerseHighlights(): Record<string, Highlight[]> {
    const loadedHighlights: Record<string, Highlight[]> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('highlights-v2-')) {
        try {
          loadedHighlights[key] = JSON.parse(localStorage.getItem(key) || '[]');
        } catch (e) {
          console.error('Error al parsear resaltado local:', e);
        }
      }
    }
    return loadedHighlights;
  }

  /**
   * Guarda una nota localmente.
   */
  public saveNote(key: string, content: string): void {
    if (content.trim()) {
      localStorage.setItem(key, content);
    } else {
      localStorage.removeItem(key);
    }
  }

  /**
   * Guarda los resaltados de un versículo.
   */
  public saveHighlights(key: string, highlights: Highlight[]): void {
    if (highlights.length > 0) {
      localStorage.setItem(key, JSON.stringify(highlights));
    } else {
      localStorage.removeItem(key);
    }
  }

  /**
   * Carga las estadísticas del usuario almacenadas localmente.
   */
  public loadUserStats(): UserStatsModel {
    const saved = localStorage.getItem(this.STATS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserStats;
        return new UserStatsModel(parsed);
      } catch (e) {
        console.error('Error al cargar estadisticas locales:', e);
      }
    }
    return UserStatsModel.createDefault();
  }

  /**
   * Guarda las estadísticas del usuario localmente.
   */
  public saveUserStats(stats: UserStats | UserStatsModel): void {
    const plain = stats instanceof UserStatsModel ? stats.toPlainObject() : stats;
    localStorage.setItem(this.STATS_KEY, JSON.stringify(plain));
  }
}

export const localStorageService = LocalStorageService.getInstance();
