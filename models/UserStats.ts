import { UserStats as IUserStats } from '../types';

/**
 * Modelo orientado a objetos para la gestión del progreso y nivel del usuario.
 */
export class UserStatsModel implements IUserStats {
  public points: number;
  public streak: number;
  public completedDays: string[];
  public rank: string;
  public unlockedBadges: string[];
  public currentPlanId?: string;
  public xpToNextLevel: number;

  constructor(data?: Partial<IUserStats>) {
    this.points = data?.points ?? 0;
    this.streak = data?.streak ?? 1;
    this.completedDays = data?.completedDays ?? [new Date().toISOString().split('T')[0]];
    this.rank = data?.rank ?? this.calculateRank(this.points);
    this.unlockedBadges = data?.unlockedBadges ?? ['first_reading'];
    this.currentPlanId = data?.currentPlanId;
    this.xpToNextLevel = data?.xpToNextLevel ?? 100;
  }

  /**
   * Agrega puntos de experiencia y actualiza el rango y nivel.
   */
  public addXP(amount: number): void {
    this.points += amount;
    this.xpToNextLevel = Math.max(0, this.xpToNextLevel - amount);
    
    if (this.xpToNextLevel === 0) {
      this.xpToNextLevel = 100; // Siguiente nivel
    }
    
    this.rank = this.calculateRank(this.points);
  }

  /**
   * Calcula el rango teológico basado en los puntos acumulados.
   */
  public calculateRank(points: number): string {
    if (points >= 1000) return 'Doctor en Teología';
    if (points >= 500) return 'Erudito Bíblico';
    if (points >= 250) return 'Maestro de la Palabra';
    if (points >= 100) return 'Discipulo Avanzado';
    if (points >= 50) return 'Estudiante Ferviente';
    return 'Neófito Teológico';
  }

  /**
   * Registra el día de hoy en la racha si no está registrado.
   */
  public registerActiveDay(): void {
    const today = new Date().toISOString().split('T')[0];
    if (!this.completedDays.includes(today)) {
      this.completedDays.push(today);
      this.streak += 1;
    }
  }

  /**
   * Desbloquea una medalla dada si aún no la posee.
   */
  public unlockBadge(badgeId: string): boolean {
    if (!this.unlockedBadges.includes(badgeId)) {
      this.unlockedBadges.push(badgeId);
      return true;
    }
    return false;
  }

  /**
   * Convierte el modelo a un objeto plano serializable para Firestore o LocalStorage.
   */
  public toPlainObject(): IUserStats {
    return {
      points: this.points,
      streak: this.streak,
      completedDays: [...this.completedDays],
      rank: this.rank,
      unlockedBadges: [...this.unlockedBadges],
      currentPlanId: this.currentPlanId,
      xpToNextLevel: this.xpToNextLevel
    };
  }

  /**
   * Crea una instancia por defecto del modelo.
   */
  public static createDefault(): UserStatsModel {
    return new UserStatsModel();
  }
}
