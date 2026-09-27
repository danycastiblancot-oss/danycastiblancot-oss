import { BIBLE_BOOKS, CATEGORY_LABELS, VERSE_COUNTS } from '../constants';
import { BibleBook as IBibleBook } from '../types';

/**
 * Clase que representa un Libro de la Biblia con su lógica de dominio.
 */
export class BibleBookModel implements IBibleBook {
  public name: string;
  public chapters: number;
  public category: 'law' | 'history' | 'poetry' | 'prophets_major' | 'prophets_minor' | 'gospels' | 'church_history' | 'letters' | 'prophecy';

  constructor(data: IBibleBook) {
    this.name = data.name;
    this.chapters = data.chapters;
    this.category = data.category;
  }

  /**
   * Obtiene la etiqueta legible de la categoría del libro.
   */
  public getCategoryLabel(): string {
    return CATEGORY_LABELS[this.category] || this.category;
  }

  /**
   * Determina si el libro pertenece al Nuevo Testamento.
   */
  public isNewTestament(): boolean {
    const ntCategories = ['gospels', 'church_history', 'letters', 'prophecy'];
    return ntCategories.includes(this.category);
  }

  /**
   * Determina si el libro pertenece al Antiguo Testamento.
   */
  public isOldTestament(): boolean {
    return !this.isNewTestament();
  }

  /**
   * Obtiene el número aproximado de versículos para un capítulo dado.
   */
  public getVerseCountForChapter(chapterNumber: number): number {
    const counts = VERSE_COUNTS[this.name];
    if (counts && chapterNumber > 0 && chapterNumber <= counts.length) {
      return counts[chapterNumber - 1];
    }
    return 30; // Valor por defecto estimado
  }

  /**
   * Valida si un número de capítulo es válido para este libro.
   */
  public isValidChapter(chapterNumber: number): boolean {
    return chapterNumber >= 1 && chapterNumber <= this.chapters;
  }

  /**
   * Busca todos los libros por su categoría.
   */
  public static getBooksByCategory(category: string): BibleBookModel[] {
    return BIBLE_BOOKS
      .filter(b => b.category === category)
      .map(b => new BibleBookModel(b));
  }

  /**
   * Obtiene todos los libros instanciados como modelos.
   */
  public static getAllBooks(): BibleBookModel[] {
    return BIBLE_BOOKS.map(b => new BibleBookModel(b));
  }

  /**
   * Busca un libro por su nombre exacto.
   */
  public static findByName(name: string): BibleBookModel | null {
    const found = BIBLE_BOOKS.find(b => b.name.toLowerCase() === name.toLowerCase());
    return found ? new BibleBookModel(found) : null;
  }
}
