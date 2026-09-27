
import React, { useState, useEffect } from 'react';
import { ReadingGoal, UserStats, Badge } from '../types';

const goals: ReadingGoal[] = [
  { id: '1y', label: '1 Año', days: 365, chaptersPerDay: 3.2, description: 'Ritmo pausado y reflexivo para una vida de estudio constante.' },
  { id: '6m', label: '6 Meses', days: 180, chaptersPerDay: 6.6, description: 'Un reto dinámico para quienes desean profundizar rápido.' },
  { id: '3m', label: '3 Meses', days: 90, chaptersPerDay: 13.2, description: 'Inmersión total. Ideal para temporadas de retiro espiritual.' },
];

const ALL_BADGES: Badge[] = [
  { id: 'first_day', name: 'Primer Paso', icon: '🌱', description: 'Completaste tu primera lectura del plan.' },
  { id: 'streak_3', name: 'Fidelidad', icon: '🔥', description: 'Mantuviste tu racha por 3 días.' },
  { id: 'rank_advanced', name: 'Lector Avanzado', icon: '📜', description: 'Subiste de rango por tu constancia.' },
  { id: 'theology_scholar', name: 'Erudito', icon: '🧠', description: 'Completaste 10 lecturas con análisis profundo.' },
];

const RANKS = ['Lector Principiante', 'Lector Avanzado', 'Lector Experto', 'Maestro de la Palabra'];

interface ReadingGoalSelectorProps {
  onNavigateToBible: (book: string, chapter: number) => void;
}

export const ReadingGoalSelector: React.FC<ReadingGoalSelectorProps> = ({ onNavigateToBible }) => {
  const [stats, setStats] = useState<UserStats>({
    points: 0,
    streak: 0,
    completedDays: [],
    rank: RANKS[0],
    unlockedBadges: [],
    xpToNextLevel: 100,
  });

  const [showBadgeReward, setShowBadgeReward] = useState<Badge | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('abba_bible_stats');
    if (saved) setStats(JSON.parse(saved));
  }, []);

  const saveStats = (newStats: UserStats) => {
    setStats(newStats);
    localStorage.setItem('abba_bible_stats', JSON.stringify(newStats));
  };

  const handleSelectGoal = (goalId: string) => {
    saveStats({ ...stats, currentPlanId: goalId });
  };

  const checkBadges = (currentStats: UserStats) => {
    let unlocked: Badge | null = null;
    const newBadges = [...currentStats.unlockedBadges];

    if (!newBadges.includes('first_day') && currentStats.completedDays.length >= 1) {
      newBadges.push('first_day');
      unlocked = ALL_BADGES.find(b => b.id === 'first_day')!;
    }

    if (!newBadges.includes('streak_3') && currentStats.streak >= 3) {
      newBadges.push('streak_3');
      unlocked = ALL_BADGES.find(b => b.id === 'streak_3')!;
    }

    return { newBadges, unlocked };
  };

  const completeToday = () => {
    const today = new Date().toISOString().split('T')[0];
    if (stats.completedDays.includes(today)) return;

    const newPoints = stats.points + 50;
    const newCompletedDays = [...stats.completedDays, today];
    
    // Rank logic
    let newRank = stats.rank;
    if (newPoints >= 500) newRank = RANKS[3];
    else if (newPoints >= 300) newRank = RANKS[2];
    else if (newPoints >= 150) newRank = RANKS[1];

    const { newBadges, unlocked } = checkBadges({ ...stats, points: newPoints, completedDays: newCompletedDays, streak: stats.streak + 1 });

    const updatedStats: UserStats = {
      ...stats,
      points: newPoints,
      completedDays: newCompletedDays,
      rank: newRank,
      unlockedBadges: newBadges,
      streak: stats.streak + 1,
      xpToNextLevel: 100 - (newPoints % 100)
    };

    saveStats(updatedStats);
    if (unlocked) {
      setShowBadgeReward(unlocked);
      setTimeout(() => setShowBadgeReward(null), 4000);
    }
  };

  const handleRestart = () => {
    if (confirm('¿Quieres cancelar tu plan actual? Tu progreso de insignias se mantendrá.')) {
      saveStats({ ...stats, currentPlanId: undefined });
    }
  };

  if (!stats.currentPlanId) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="text-center mb-8">
           <p className="text-stone-500 italic">"Bienaventurado el que lee, y los que oyen las palabras de esta profecía..."</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {goals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => handleSelectGoal(goal.id)}
              className="p-8 rounded-[2rem] bg-white border border-stone-200 text-left hover:border-bible-gold hover:shadow-xl transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 text-bible-gold"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
              </div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-display font-bold text-bible-ink">{goal.label}</h3>
                <span className="bg-bible-gold/10 text-bible-gold px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">{goal.days} días</span>
              </div>
              <p className="text-stone-500 text-sm mb-4 leading-relaxed max-w-md">{goal.description}</p>
              <span className="text-xs font-bold text-bible-accent uppercase tracking-widest">Seleccionar Reto &rarr;</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const isDoneToday = stats.completedDays.includes(today);
  const dayNumber = stats.completedDays.length + (isDoneToday ? 0 : 1);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20 px-4">
      {/* Badge Notification */}
      {showBadgeReward && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none p-4">
          <div className="bg-bible-ink text-white p-8 rounded-[3rem] shadow-2xl border-2 border-bible-gold flex flex-col items-center text-center animate-bounce shadow-gold-500/50">
            <span className="text-7xl mb-4">{showBadgeReward.icon}</span>
            <h4 className="text-bible-gold font-bold uppercase tracking-widest text-xs mb-2">¡Nueva Insignia!</h4>
            <p className="text-2xl font-display font-bold">{showBadgeReward.name}</p>
            <p className="text-sm text-stone-300 mt-2">{showBadgeReward.description}</p>
          </div>
        </div>
      )}

      {/* Profile & Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-stone-100 flex items-center gap-4">
          <div className="w-16 h-16 bg-bible-leather rounded-full flex items-center justify-center text-3xl shadow-inner border-2 border-bible-gold/30">📖</div>
          <div>
            <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest">Rango Actual</span>
            <span className="text-base font-bold text-bible-leather">{stats.rank}</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-stone-100 flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-3xl">🔥</div>
          <div>
            <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest">Racha</span>
            <span className="text-xl font-bold text-bible-ink">{stats.streak} Días</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-stone-100 flex items-center gap-4">
          <div className="w-16 h-16 bg-bible-gold/10 rounded-full flex items-center justify-center text-3xl">⭐</div>
          <div>
            <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest">Experiencia</span>
            <span className="text-xl font-bold text-bible-gold">{stats.points} XP</span>
          </div>
        </div>
      </div>

      {/* Main Journey Card */}
      <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-stone-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-64 h-64"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-[10px] font-bold text-bible-accent uppercase tracking-[0.4em] mb-2">Lectura del Día {dayNumber}</h2>
              <h3 className="text-4xl font-display font-bold text-bible-ink">Génesis 1-3</h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest block mb-1">Tu Plan</span>
              <span className="text-bible-leather font-bold">{goals.find(g => g.id === stats.currentPlanId)?.label}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <button 
              onClick={() => onNavigateToBible('Génesis', 1)}
              className="flex-1 py-5 bg-stone-100 text-bible-leather rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
              Comenzar Lectura
            </button>
            <button 
              onClick={completeToday}
              disabled={isDoneToday}
              className={`flex-1 py-5 rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg ${isDoneToday ? 'bg-green-100 text-green-600' : 'bg-bible-leather text-white hover:bg-bible-ink hover:scale-105'}`}
            >
              {isDoneToday ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  Día Completado
                </>
              ) : (
                'Marcar como Hecho'
              )}
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-stone-400 uppercase tracking-widest">
            <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full bg-bible-gold transition-all duration-1000" style={{ width: `${(stats.completedDays.length / (goals.find(g => g.id === stats.currentPlanId)?.days || 365)) * 100}%` }}></div>
            </div>
            <span>{stats.completedDays.length} / {goals.find(g => g.id === stats.currentPlanId)?.days} Días</span>
          </div>
        </div>
      </div>

      {/* Badges Gallery */}
      <div className="px-2">
        <h4 className="text-sm font-bold text-stone-400 uppercase tracking-[0.3em] mb-6">Tus Logros</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {ALL_BADGES.map((badge) => {
            const unlocked = stats.unlockedBadges.includes(badge.id);
            return (
              <div key={badge.id} className={`p-6 rounded-[2rem] text-center transition-all ${unlocked ? 'bg-white border border-bible-gold/20 shadow-sm' : 'bg-stone-100/50 opacity-40 grayscale'}`}>
                <span className="text-4xl mb-4 block">{badge.icon}</span>
                <span className="text-[10px] font-bold text-bible-ink uppercase tracking-tight block leading-tight">{badge.name}</span>
                <p className="text-[9px] text-stone-400 mt-2 line-clamp-2 leading-tight">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button onClick={handleRestart} className="text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-widest">Cancelar Plan Actual</button>
      </div>
    </div>
  );
};
