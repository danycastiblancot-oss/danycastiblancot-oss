import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  collection, 
  query, 
  getDocs,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { UserStats, SavedNote, ReadingProgress } from '../types';
import { UserStatsModel } from '../models/UserStats';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Servicio en Programación Orientada a Objetos (POO) para operaciones de usuario en Firestore y GitHub.
 */
export class UserService {
  private static instance: UserService;

  private constructor() {}

  /**
   * Obtiene la instancia única del servicio de usuario (Singleton).
   */
  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Manejador centralizado de errores de Firestore para diagnóstico y resiliencia.
   */
  private handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }

  // -------------------------------------------------------------
  // USER STATS & PROGRESS (READ / WRITE / UPDATE)
  // -------------------------------------------------------------

  /**
   * Obtiene las estadísticas del usuario convirtiéndolas en un modelo UserStatsModel.
   */
  public async getUserStats(userId: string): Promise<UserStatsModel | null> {
    const path = `users/${userId}`;
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const rawData = userDoc.data() as UserStats;
        return new UserStatsModel(rawData);
      }
      return null;
    } catch (error) {
      this.handleFirestoreError(error, OperationType.GET, path);
    }
  }

  /**
   * Guarda o fusiona las estadísticas del usuario en Firestore.
   */
  public async saveUserStats(userId: string, stats: UserStats | UserStatsModel): Promise<void> {
    const path = `users/${userId}`;
    const plainStats = stats instanceof UserStatsModel ? stats.toPlainObject() : stats;
    try {
      await setDoc(doc(db, 'users', userId), plainStats, { merge: true });
    } catch (error) {
      this.handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Guarda el progreso de lectura del usuario para un capítulo específico.
   */
  public async saveReadingProgress(userId: string, book: string, chapter: number): Promise<void> {
    const progressId = `${userId}-${book}-${chapter}`;
    const path = `progress/${userId}/completed/${progressId}`;
    try {
      await setDoc(doc(db, 'progress', userId, 'completed', progressId), {
        userId,
        book,
        chapter,
        completedAt: serverTimestamp()
      });
    } catch (error) {
      this.handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Elimina el progreso de lectura si el usuario desmarca un capítulo.
   */
  public async removeReadingProgress(userId: string, book: string, chapter: number): Promise<void> {
    const progressId = `${userId}-${book}-${chapter}`;
    const path = `progress/${userId}/completed/${progressId}`;
    try {
      await deleteDoc(doc(db, 'progress', userId, 'completed', progressId));
    } catch (error) {
      this.handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  /**
   * Obtiene la lista de capítulos leídos registrados para el usuario.
   */
  public async getReadingProgress(userId: string): Promise<ReadingProgress[]> {
    const path = `progress/${userId}/completed`;
    try {
      const q = query(collection(db, 'progress', userId, 'completed'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(docSnapshot => docSnapshot.data() as ReadingProgress);
    } catch (error) {
      this.handleFirestoreError(error, OperationType.LIST, path);
    }
  }

  // -------------------------------------------------------------
  // NOTES & STUDY JOURNAL CRUD (CREATE, READ, UPDATE, DELETE)
  // -------------------------------------------------------------

  /**
   * CREATE: Crea una nueva nota o apunte devocional en Firestore.
   */
  public async createNote(userId: string, note: Omit<SavedNote, 'id' | 'createdAt'>): Promise<SavedNote> {
    const noteId = `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const path = `notes/${userId}/userNotes/${noteId}`;
    try {
      const noteData = {
        id: noteId,
        userId,
        reference: note.reference,
        title: note.title || `Reflexión: ${note.reference}`,
        content: note.content,
        text: note.text || '',
        category: note.category || 'estudio',
        color: note.color || 'amber',
        tags: note.tags || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(doc(db, 'notes', userId, 'userNotes', noteId), noteData);
      return {
        ...noteData,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      this.handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  /**
   * READ: Obtiene todas las notas del usuario desde Firestore.
   */
  public async getNotes(userId: string): Promise<SavedNote[]> {
    const path = `notes/${userId}/userNotes`;
    try {
      const q = query(collection(db, 'notes', userId, 'userNotes'));
      const snapshot = await getDocs(q);
      const notes: SavedNote[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        notes.push({
          id: docSnap.id,
          userId: data.userId,
          reference: data.reference,
          title: data.title || `Nota sobre ${data.reference}`,
          content: data.content || '',
          text: data.text || '',
          category: data.category || 'estudio',
          color: data.color || 'amber',
          tags: data.tags || [],
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt || undefined)
        });
      });
      // Ordenar por fecha descendente
      return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      this.handleFirestoreError(error, OperationType.LIST, path);
    }
  }

  /**
   * UPDATE: Actualiza el contenido, título, categoría o etiquetas de una nota existente.
   */
  public async updateNote(userId: string, noteId: string, updates: Partial<SavedNote>): Promise<void> {
    const path = `notes/${userId}/userNotes/${noteId}`;
    try {
      await setDoc(doc(db, 'notes', userId, 'userNotes', noteId), {
        ...updates,
        userId,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      this.handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  /**
   * DELETE: Elimina permanentemente una nota de Firestore.
   */
  public async deleteNote(userId: string, noteId: string): Promise<void> {
    const path = `notes/${userId}/userNotes/${noteId}`;
    try {
      await deleteDoc(doc(db, 'notes', userId, 'userNotes', noteId));
    } catch (error) {
      this.handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  /**
   * Método de compatibilidad para guardar nota.
   */
  public async saveNote(userId: string, note: Partial<SavedNote>): Promise<void> {
    if (note.id) {
      await this.updateNote(userId, note.id, note);
    } else {
      await this.createNote(userId, {
        userId,
        reference: note.reference || 'General',
        content: note.content || '',
        title: note.title,
        text: note.text,
        category: note.category,
        color: note.color,
        tags: note.tags
      });
    }
  }

  // -------------------------------------------------------------
  // GITHUB INTEGRATION & BACKUP EXPORT
  // -------------------------------------------------------------

  /**
   * Genera un archivo Markdown completo estructurado con todas las notas,
   * estadísticas y progreso bíblico listo para sincronizar o commitear en GitHub.
   */
  public exportToGitHubMarkdown(notes: SavedNote[], progress: ReadingProgress[], userStats?: UserStats): string {
    const dateStr = new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    let md = `# 📖 Bitácora Bíblica & Progreso de Estudio\n\n`;
    md += `> Respaldo automatizado generado el ${dateStr} sincronizado con GitHub.\n\n`;
    
    if (userStats) {
      md += `## 📊 Resumen del Estudiante Bíblico\n`;
      md += `- **Rango Espiritual:** ${userStats.rank}\n`;
      md += `- **Puntos de Experiencia (XP):** ${userStats.points} XP\n`;
      md += `- **Racha Activa de Lectura:** ${userStats.streak} días consecutivos\n`;
      md += `- **Capítulos Registrados:** ${progress.length} leídos\n\n`;
    }

    md += `## 📝 Cuaderno de Notas & Reflexiones Exegéticas (${notes.length} notas)\n\n`;
    
    if (notes.length === 0) {
      md += `*No hay notas registradas aún.*\n\n`;
    } else {
      notes.forEach((note, idx) => {
        md += `### ${idx + 1}. ${note.title || note.reference}\n`;
        md += `- **Referencia:** \`${note.reference}\`\n`;
        md += `- **Categoría:** ${note.category?.toUpperCase() || 'ESTUDIO'}\n`;
        if (note.tags && note.tags.length > 0) {
          md += `- **Etiquetas:** ${note.tags.map(t => `\`#${t}\``).join(' ')}\n`;
        }
        md += `- **Fecha:** ${new Date(note.createdAt).toLocaleString('es-ES')}\n\n`;
        md += `#### Contenido / Reflexión:\n`;
        md += `${note.content}\n\n`;
        if (note.text) {
          md += `> *Pasaje:* "${note.text}"\n\n`;
        }
        md += `---\n\n`;
      });
    }

    md += `## 📜 Progreso Canónico Registrado\n`;
    if (progress.length === 0) {
      md += `*No hay capítulos marcados como leídos aún.*\n`;
    } else {
      md += `| Libro | Capítulo | Estado |\n`;
      md += `| :--- | :--- | :--- |\n`;
      progress.forEach(p => {
        md += `| **${p.book}** | Capítulo ${p.chapter} | ✅ Completado |\n`;
      });
    }

    return md;
  }

  /**
   * Sincroniza un Gist de GitHub (privado o público) usando un Personal Access Token.
   */
  public async syncToGitHubGist(
    token: string, 
    description: string, 
    files: Record<string, { content: string }>
  ): Promise<{ id: string; html_url: string }> {
    const res = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token.trim()}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description,
        public: false,
        files
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `Error al sincronizar con GitHub: ${res.status}`);
    }

    const data = await res.json();
    return {
      id: data.id,
      html_url: data.html_url
    };
  }

  /**
   * Obtiene la información del perfil del usuario de GitHub mediante su token.
   */
  public async getGitHubUserInfo(token: string): Promise<{ login: string; name: string; avatar_url: string; html_url: string }> {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token.trim()}`,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!res.ok) {
      throw new Error(`Token de GitHub inválido o expirado (${res.status})`);
    }

    return await res.json();
  }
}

// Instancia singleton del servicio POO
export const userService = UserService.getInstance();

// Funciones delegadas para retrocompatibilidad
export const getUserStats = (userId: string) => userService.getUserStats(userId);
export const saveUserStats = (userId: string, stats: UserStats | UserStatsModel) => userService.saveUserStats(userId, stats);
export const saveReadingProgress = (userId: string, book: string, chapter: number) => userService.saveReadingProgress(userId, book, chapter);
export const removeReadingProgress = (userId: string, book: string, chapter: number) => userService.removeReadingProgress(userId, book, chapter);
export const getReadingProgress = (userId: string) => userService.getReadingProgress(userId);
export const saveNote = (userId: string, note: Partial<SavedNote>) => userService.saveNote(userId, note);
export const createNote = (userId: string, note: Omit<SavedNote, 'id' | 'createdAt'>) => userService.createNote(userId, note);
export const getNotes = (userId: string) => userService.getNotes(userId);
export const updateNote = (userId: string, noteId: string, updates: Partial<SavedNote>) => userService.updateNote(userId, noteId, updates);
export const deleteNote = (userId: string, noteId: string) => userService.deleteNote(userId, noteId);
