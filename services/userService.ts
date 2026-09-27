import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { UserStats, SavedNote } from '../types';
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
  }
}

/**
 * Servicio en Programación Orientada a Objetos (POO) para operaciones de usuario en Firestore.
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
   * Manejador centralizado de errores de Firestore para diagnóstico.
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
   * Guarda el progreso de lectura del usuario para un capítulo.
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
   * Obtiene la lista de progresos de lectura registrados.
   */
  public async getReadingProgress(userId: string): Promise<any[]> {
    const path = `progress/${userId}/completed`;
    try {
      const q = query(collection(db, 'progress', userId, 'completed'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      this.handleFirestoreError(error, OperationType.LIST, path);
    }
  }

  /**
   * Guarda una nota personalizada del usuario en Firestore.
   */
  public async saveNote(userId: string, note: Partial<SavedNote>): Promise<void> {
    const noteId = note.id || `${userId}-${Date.now()}`;
    const path = `notes/${userId}/userNotes/${noteId}`;
    try {
      await setDoc(doc(db, 'notes', userId, 'userNotes', noteId), {
        ...note,
        userId,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      this.handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}

// Instancia singleton del servicio
export const userService = UserService.getInstance();

// Funciones delegadas para retrocompatibilidad
export const getUserStats = (userId: string) => userService.getUserStats(userId);
export const saveUserStats = (userId: string, stats: UserStats | UserStatsModel) => userService.saveUserStats(userId, stats);
export const saveReadingProgress = (userId: string, book: string, chapter: number) => userService.saveReadingProgress(userId, book, chapter);
export const getReadingProgress = (userId: string) => userService.getReadingProgress(userId);
export const saveNote = (userId: string, note: Partial<SavedNote>) => userService.saveNote(userId, note);
