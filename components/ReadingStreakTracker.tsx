import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Sparkles, 
  Award, 
  Calendar, 
  Zap, 
  CheckCircle2, 
  ChevronRight, 
  X, 
  Trophy,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { UserStats } from '../types';
import { UserStatsModel } from '../models/UserStats';

interface ReadingStreakTrackerProps {
  userStats: UserStats | null;
  onNavigateToReading?: () => void;
  onClose?: () => void;
  onUpdateStats?: (newStats: UserStatsModel) => void;
}

interface DayArcData {
  dayIndex: number;
  dateStr: string;
  dayOfMonth: number;
  dayName: string;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  isActive: boolean;
  xpEarned: number;
}

export const ReadingStreakTracker: React.FC<ReadingStreakTrackerProps> = ({
  userStats,
  onNavigateToReading,
  onClose,
  onUpdateStats
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedDay, setSelectedDay] = useState<DayArcData | null>(null);
  const [viewTimeframe, setViewTimeframe] = useState<'month' | '30days'>('month');
  const [hoveredDay, setHoveredDay] = useState<DayArcData | null>(null);

  // Generación de datos diarios para el calendario circular
  const daysData = useMemo<DayArcData[]>(() => {
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];
    const completedSet = new Set(userStats?.completedDays || []);
    const result: DayArcData[] = [];

    const spanishDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    if (viewTimeframe === 'month') {
      const year = today.getFullYear();
      const month = today.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
        const d = new Date(year, month, dayNum);
        const iso = d.toISOString().split('T')[0];
        const isToday = iso === todayISO;
        const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const isFuture = d > today;
        const isActive = completedSet.has(iso);

        result.push({
          dayIndex: dayNum - 1,
          dateStr: iso,
          dayOfMonth: dayNum,
          dayName: spanishDays[d.getDay()],
          isToday,
          isPast,
          isFuture,
          isActive,
          xpEarned: isActive ? 10 : 0
        });
      }
    } else {
      // Últimos 30 días
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const iso = d.toISOString().split('T')[0];
        const isToday = iso === todayISO;
        const isPast = i > 0;
        const isFuture = false;
        const isActive = completedSet.has(iso);

        result.push({
          dayIndex: 29 - i,
          dateStr: iso,
          dayOfMonth: d.getDate(),
          dayName: spanishDays[d.getDay()],
          isToday,
          isPast,
          isFuture,
          isActive,
          xpEarned: isActive ? 10 : 0
        });
      }
    }

    return result;
  }, [userStats, viewTimeframe]);

  // Selección por defecto del día actual
  useEffect(() => {
    const todayData = daysData.find(d => d.isToday) || daysData[daysData.length - 1];
    if (todayData) setSelectedDay(todayData);
  }, [daysData]);

  // Renderizado con D3
  useEffect(() => {
    if (!svgRef.current || daysData.length === 0) return;

    const width = 360;
    const height = 360;
    const outerRadius = 160;
    const innerRadius = 115;
    const cornerRadius = 4;
    const padAngle = 0.035;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Filtros SVG para brillo sacro (Glow effect)
    const defs = svg.append('defs');

    // Gradiente dorado para días activos
    const goldGradient = defs.append('linearGradient')
      .attr('id', 'streakGoldGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    goldGradient.append('stop').attr('offset', '0%').attr('stop-color', '#F59E0B');
    goldGradient.append('stop').attr('offset', '100%').attr('stop-color', '#D97706');

    // Gradiente esmeralda para el día de hoy
    const todayGradient = defs.append('linearGradient')
      .attr('id', 'todayGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    todayGradient.append('stop').attr('offset', '0%').attr('stop-color', '#10B981');
    todayGradient.append('stop').attr('offset', '100%').attr('stop-color', '#059669');

    // Filtro de resplandor
    const glowFilter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Pista de fondo circular
    const backgroundArc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(0)
      .endAngle(2 * Math.PI);

    g.append('path')
      .attr('d', backgroundArc as any)
      .attr('fill', '#F5F5F4')
      .attr('opacity', 0.6);

    // Escala de ángulo para cada sector
    const totalDays = daysData.length;
    const angleStep = (2 * Math.PI) / totalDays;

    // Generador de arcos D3
    const arcGenerator = d3.arc<DayArcData>()
      .innerRadius(d => (hoveredDay?.dayIndex === d.dayIndex || selectedDay?.dayIndex === d.dayIndex) ? innerRadius - 4 : innerRadius)
      .outerRadius(d => (hoveredDay?.dayIndex === d.dayIndex || selectedDay?.dayIndex === d.dayIndex) ? outerRadius + 6 : outerRadius)
      .startAngle((_, i) => i * angleStep)
      .endAngle((_, i) => (i + 1) * angleStep)
      .padAngle(padAngle)
      .cornerRadius(cornerRadius);

    // Renderizado de cada arco de día
    const daySlices = g.selectAll('.day-slice')
      .data(daysData)
      .enter()
      .append('g')
      .attr('class', 'day-slice')
      .style('cursor', 'pointer');

    // Trayectoria del arco con transición
    daySlices.append('path')
      .attr('d', arcGenerator as any)
      .attr('fill', d => {
        if (d.isActive) return 'url(#streakGoldGrad)';
        if (d.isToday) return '#E5E7EB';
        if (d.isFuture) return '#F9FAFB';
        return '#E7E5E4';
      })
      .attr('stroke', d => {
        if (d.isToday) return '#D97706';
        if (d.isActive) return '#B45309';
        return '#E5E7EB';
      })
      .attr('stroke-width', d => d.isToday ? 2.5 : 1)
      .style('filter', d => (d.isActive && d.isToday) ? 'url(#glow)' : 'none')
      .on('mouseenter', (event, d) => {
        setHoveredDay(d);
        d3.select(event.currentTarget)
          .transition()
          .duration(150)
          .attr('transform', 'scale(1.03)');
      })
      .on('mouseleave', (event) => {
        setHoveredDay(null);
        d3.select(event.currentTarget)
          .transition()
          .duration(150)
          .attr('transform', 'scale(1)');
      })
      .on('click', (_, d) => {
        setSelectedDay(d);
      });

    // Etiquetas de número del día en cada sector
    daySlices.append('text')
      .attr('transform', (d, i) => {
        const centroid = arcGenerator.centroid(d as any);
        return `translate(${centroid[0]}, ${centroid[1]})`;
      })
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', totalDays > 30 ? '9px' : '10px')
      .attr('font-weight', d => (d.isActive || d.isToday) ? '800' : '600')
      .attr('fill', d => {
        if (d.isActive) return '#FFFFFF';
        if (d.isToday) return '#D97706';
        if (d.isFuture) return '#9CA3AF';
        return '#57534E';
      })
      .attr('pointer-events', 'none')
      .text(d => d.dayOfMonth);

    // Anillo exterior decorativo con puntos cardinales
    const outerRingRadius = outerRadius + 14;
    g.append('circle')
      .attr('r', outerRingRadius)
      .attr('fill', 'none')
      .attr('stroke', '#E7E5E4')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2, 4');

  }, [daysData, hoveredDay, selectedDay]);

  // Cálculos de Gamificación
  const activeDaysCount = useMemo(() => {
    return daysData.filter(d => d.isActive).length;
  }, [daysData]);

  const monthConsistencyPercent = useMemo(() => {
    return daysData.length > 0 ? Math.round((activeDaysCount / daysData.length) * 100) : 0;
  }, [activeDaysCount, daysData.length]);

  // Hitos de racha
  const streakMilestones = [
    { target: 3, name: 'Semilla Fiel', xpBonus: 20 },
    { target: 7, name: 'Lámpara Encendida', xpBonus: 50 },
    { target: 14, name: 'Columna de Fuego', xpBonus: 100 },
    { target: 30, name: 'Guardián del Pacto', xpBonus: 250 },
    { target: 100, name: 'Erudito Inquebrantable', xpBonus: 1000 }
  ];

  const currentStreak = userStats?.streak || 1;
  const nextMilestone = streakMilestones.find(m => m.target > currentStreak) || streakMilestones[streakMilestones.length - 1];
  const progressToNext = Math.min(100, Math.round((currentStreak / nextMilestone.target) * 100));

  // Función para registrar la lectura de hoy manualmente
  const handleCheckInToday = () => {
    if (!userStats) return;
    const model = new UserStatsModel(userStats);
    model.registerActiveDay();
    model.addXP(20); // Bono de constancia diaria
    if (onUpdateStats) {
      onUpdateStats(model);
    }
  };

  const displayedDay = hoveredDay || selectedDay;

  return (
    <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-stone-200/80 shadow-soft max-w-4xl mx-auto">
      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-orange-100 rounded-xl text-orange-600">
              <Flame size={18} className="fill-orange-500" />
            </span>
            <span className="text-[11px] font-extrabold text-bible-accent uppercase tracking-widest">
              Gamificación de Hábitos Espirituales
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-bible-ink">
            Calendario Circular de <span className="text-bible-gold">Racha</span>
          </h2>
        </div>

        {/* Selector de Rango */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-stone-100 rounded-xl text-xs font-bold text-stone-500">
            <button
              onClick={() => setViewTimeframe('month')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewTimeframe === 'month' ? 'bg-white text-bible-ink shadow-sm' : 'hover:text-bible-ink'
              }`}
            >
              Mes Actual
            </button>
            <button
              onClick={() => setViewTimeframe('30days')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewTimeframe === '30days' ? 'bg-white text-bible-ink shadow-sm' : 'hover:text-bible-ink'
              }`}
            >
              Últimos 30 Días
            </button>
          </div>

          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 hover:bg-stone-100 rounded-xl text-stone-400 hover:text-bible-ink transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Grid Principal: Rueda Circular D3 + Panel de Gamificación */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Lado Izquierdo: SVG Circular D3 con Centro Dinámico */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
          <div className="relative w-[340px] h-[340px] sm:w-[360px] sm:h-[360px] flex items-center justify-center">
            {/* SVG gestionado por D3 */}
            <svg 
              ref={svgRef} 
              viewBox="0 0 360 360" 
              className="w-full h-full select-none"
            />

            {/* Centro de la Rueda Circular: Fuego y Racha */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="w-24 h-24 rounded-full bg-gradient-to-b from-amber-50 to-orange-50 border border-amber-200/80 flex flex-col items-center justify-center shadow-inner relative">
                <Flame size={28} className="text-orange-500 fill-orange-500 animate-pulse mb-0.5" />
                <span className="text-3xl font-display font-black text-bible-ink leading-none">
                  {currentStreak}
                </span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-700 mt-0.5">
                  Días de Racha
                </span>
              </div>
            </div>
          </div>

          {/* Leyenda interactiva */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-stone-500 mt-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
              <span>Lectura Cumplida</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-stone-200 border border-stone-300" />
              <span>Sin Registro</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-amber-600 bg-stone-100" />
              <span>Hoy</span>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Estadísticas, Hito y Detalle del Día */}
        <div className="lg:col-span-5 space-y-4">
          {/* Tarjeta del Día Seleccionado / Hover */}
          <div className="p-5 rounded-3xl bg-stone-50 border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-bible-accent uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} /> Detalle del Día
              </span>
              {displayedDay?.isActive ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={12} /> Consagrado
                </span>
              ) : (
                <span className="text-[10px] bg-stone-200 text-stone-600 font-bold px-2 py-0.5 rounded-full">
                  Sin Lectura
                </span>
              )}
            </div>

            <h4 className="text-xl font-display font-bold text-bible-ink">
              {displayedDay ? `${displayedDay.dayName}, ${displayedDay.dayOfMonth}` : 'Selecciona un día'}
            </h4>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Fecha: {displayedDay?.dateStr}
            </p>

            <div className="mt-3 p-3 bg-white rounded-2xl border border-stone-100 text-xs">
              <div className="flex items-center justify-between text-stone-600 mb-1">
                <span>Puntos de Experiencia (XP):</span>
                <strong className="text-bible-ink">+{displayedDay?.xpEarned || 0} XP</strong>
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span>Estado de meditación:</span>
                <span className="font-semibold text-bible-accent">
                  {displayedDay?.isActive ? 'Capítulo Exegético Completado' : 'Pendiente de estudio'}
                </span>
              </div>
            </div>
          </div>

          {/* Tarjeta de Próximo Hito de Racha */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50/80 to-white border border-bible-gold/30 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-bible-leather uppercase tracking-wider flex items-center gap-1.5">
                <Trophy size={14} className="text-bible-gold" /> Próxima Conquista
              </span>
              <span className="text-[10px] bg-bible-gold/20 text-bible-accent font-extrabold px-2 py-0.5 rounded-full">
                +{nextMilestone.xpBonus} XP Bono
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-1">
              <span className="font-display font-bold text-base text-bible-ink">
                {nextMilestone.name}
              </span>
              <span className="text-xs font-bold text-stone-500">
                {currentStreak} / {nextMilestone.target} Días
              </span>
            </div>

            <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden mb-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500" 
                style={{ width: `${progressToNext}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500 leading-snug">
              Te faltan <strong>{Math.max(0, nextMilestone.target - currentStreak)} días</strong> para desbloquear esta insignia teológica.
            </p>
          </div>

          {/* Resumen de Eficacia Mensual */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Consistencia
              </span>
              <span className="text-xl font-display font-bold text-bible-ink">
                {monthConsistencyPercent}%
              </span>
              <span className="text-[10px] text-stone-500 block mt-0.5">
                {activeDaysCount} de {daysData.length} días
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Multiplicador
              </span>
              <span className="text-xl font-display font-bold text-bible-accent flex items-center gap-1">
                <Zap size={16} className="text-amber-500" /> x1.5
              </span>
              <span className="text-[10px] text-stone-500 block mt-0.5">
                Bono activo
              </span>
            </div>
          </div>

          {/* Botón de Acción Rápida */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleCheckInToday}
              className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles size={16} />
              <span>Consagrar Día de Hoy (+20 XP)</span>
            </button>

            {onNavigateToReading && (
              <button
                onClick={onNavigateToReading}
                className="py-3 px-4 bg-bible-leather hover:bg-bible-ink text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <BookOpen size={16} />
                <span>Leer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
