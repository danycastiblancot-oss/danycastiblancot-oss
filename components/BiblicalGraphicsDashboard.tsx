import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  PieChart, 
  Sparkles, 
  Calendar, 
  Clock, 
  BookOpen, 
  Flame, 
  Shield, 
  Crown, 
  Scroll, 
  CheckCircle2, 
  ChevronRight, 
  Layers, 
  Compass, 
  Info,
  Star,
  Activity,
  Maximize2
} from 'lucide-react';
import { 
  biblicalGraphicsEngine, 
  CanonicalProgressStats, 
  CovenantTimelineItem, 
  TabernacleStation 
} from '../models/BiblicalGraphicsEngine';
import { UserStats } from '../types';
import { ReadingStreakTracker } from './ReadingStreakTracker';

interface BiblicalGraphicsDashboardProps {
  userStats: UserStats | null;
  onNavigateToBible: (book: string, chapter: number) => void;
  onBack: () => void;
}

type TabType = 'canonical' | 'covenants' | 'tabernacle' | 'heatmap';

export const BiblicalGraphicsDashboard: React.FC<BiblicalGraphicsDashboardProps> = ({
  userStats,
  onNavigateToBible,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('canonical');
  const [selectedCovenant, setSelectedCovenant] = useState<CovenantTimelineItem | null>(null);
  const [selectedStation, setSelectedStation] = useState<TabernacleStation | null>(null);

  // Cómputo de datos usando el motor POO BiblicalGraphicsEngine
  const stats: CanonicalProgressStats = biblicalGraphicsEngine.calculateCanonicalProgress(
    userStats?.completedDays || []
  );
  const covenants = biblicalGraphicsEngine.getCovenantTimelineData();
  const tabernacleStations = biblicalGraphicsEngine.getTabernacleBlueprint();
  const heatmapDays = biblicalGraphicsEngine.generateActivityHeatmap(userStats?.completedDays || [], 28);
  const allBooks = biblicalGraphicsEngine.getBooks();

  // Helper para iconos de los pactos
  const renderCovenantIcon = (name: string, color: string) => {
    switch (name) {
      case 'Sparkles': return <Sparkles size={20} style={{ color }} />;
      case 'Shield': return <Shield size={20} style={{ color }} />;
      case 'Star': return <Star size={20} style={{ color }} />;
      case 'Scroll': return <Scroll size={20} style={{ color }} />;
      case 'Crown': return <Crown size={20} style={{ color }} />;
      case 'Flame': return <Flame size={20} style={{ color }} />;
      default: return <BookOpen size={20} style={{ color }} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 pb-20">
      {/* Header con estilo de Manuscrito Clásico */}
      <div className="text-center mb-10 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bible-gold/10 border border-bible-gold/20 text-bible-accent text-[11px] font-bold uppercase tracking-[0.25em] mb-4">
          <BarChart3 size={15} className="text-bible-gold" />
          <span>Analítica & Cartografía Sagrada</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-bible-ink tracking-tight mb-3">
          Tablero de Gráficos <span className="text-bible-gold">Bíblicos</span>
        </h1>
        <p className="max-w-2xl mx-auto text-stone-500 text-sm md:text-base leading-relaxed">
          Visualiza el canon sagrado de 66 libros, la línea histórica de los pactos de la redención y la tipología de las Escrituras.
        </p>
      </div>

      {/* Tarjetas resumen de alto impacto visual */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-stone-200/60 shadow-soft">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Progreso Global</span>
            <PieChart size={18} className="text-amber-500" />
          </div>
          <div className="text-3xl font-display font-bold text-bible-ink">
            {stats.overallPercentage}%
          </div>
          <div className="text-xs text-stone-500 mt-1 flex items-center gap-1">
            <span className="font-semibold text-bible-accent">{stats.totalCompleted}</span> de 1,189 Capítulos
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-700" 
              style={{ width: `${Math.max(5, stats.overallPercentage)}%` }}
            />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-stone-200/60 shadow-soft">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Antiguo Testamento</span>
            <Scroll size={18} className="text-bible-leather" />
          </div>
          <div className="text-3xl font-display font-bold text-bible-ink">
            {stats.otPercentage}%
          </div>
          <div className="text-xs text-stone-500 mt-1">
            <span className="font-semibold">{stats.otCompleted}</span> de 929 capítulos (39 libros)
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-bible-leather h-2 rounded-full transition-all duration-700" 
              style={{ width: `${Math.max(5, stats.otPercentage)}%` }}
            />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-stone-200/60 shadow-soft">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Nuevo Testamento</span>
            <Crown size={18} className="text-emerald-600" />
          </div>
          <div className="text-3xl font-display font-bold text-bible-ink">
            {stats.ntPercentage}%
          </div>
          <div className="text-xs text-stone-500 mt-1">
            <span className="font-semibold">{stats.ntCompleted}</span> de 260 capítulos (27 libros)
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-emerald-600 h-2 rounded-full transition-all duration-700" 
              style={{ width: `${Math.max(5, stats.ntPercentage)}%` }}
            />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-stone-200/60 shadow-soft">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Racha & Nivel</span>
            <Flame size={18} className="text-orange-500" />
          </div>
          <div className="text-3xl font-display font-bold text-bible-ink flex items-center gap-1.5">
            {userStats?.streak || 1} <span className="text-sm font-sans font-medium text-stone-400">días</span>
          </div>
          <div className="text-xs text-stone-500 mt-1 truncate">
            {userStats?.rank || 'Estudiante Ferviente'}
          </div>
          <div className="text-[10px] text-orange-600 font-bold mt-3 flex items-center gap-1">
            <Activity size={12} /> {userStats?.points || 0} XP acumulados
          </div>
        </div>
      </div>

      {/* Selector de Pestañas de Gráficos */}
      <div className="flex items-center justify-center p-1.5 bg-stone-200/60 rounded-2xl max-w-xl mx-auto mb-8 shadow-inner">
        <button
          onClick={() => setActiveTab('canonical')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'canonical'
              ? 'bg-white text-bible-ink shadow-sm'
              : 'text-stone-500 hover:text-bible-ink'
          }`}
        >
          <Layers size={15} />
          <span>Canon & 66 Libros</span>
        </button>

        <button
          onClick={() => setActiveTab('covenants')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'covenants'
              ? 'bg-white text-bible-ink shadow-sm'
              : 'text-stone-500 hover:text-bible-ink'
          }`}
        >
          <Compass size={15} />
          <span>Línea de Pactos</span>
        </button>

        <button
          onClick={() => setActiveTab('tabernacle')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tabernacle'
              ? 'bg-white text-bible-ink shadow-sm'
              : 'text-stone-500 hover:text-bible-ink'
          }`}
        >
          <Sparkles size={15} />
          <span>Tabernáculo Sagrado</span>
        </button>

        <button
          onClick={() => setActiveTab('heatmap')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'heatmap'
              ? 'bg-white text-bible-ink shadow-sm'
              : 'text-stone-500 hover:text-bible-ink'
          }`}
        >
          <Flame size={15} className="text-orange-500" />
          <span>Racha Circular D3</span>
        </button>
      </div>

      {/* Contenido según Pestaña */}
      <AnimatePresence mode="wait">
        {/* PESTAÑA 1: CANON Y BIBLIOTECA */}
        {activeTab === 'canonical' && (
          <motion.div
            key="canonical"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Desglose por Género Literario */}
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-stone-200/60 shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-display font-bold text-bible-ink">
                    Desglose por Género Literario Bíblico
                  </h3>
                  <p className="text-xs text-stone-400 font-medium mt-0.5">
                    Proporción de lectura completada según los géneros inspirados
                  </p>
                </div>
                <span className="text-xs bg-amber-50 text-amber-700 font-bold px-3 py-1 rounded-full border border-amber-200">
                  9 Divisiones Canónicas
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.categories.map((cat) => (
                  <div 
                    key={cat.category}
                    className="p-4 rounded-2xl bg-stone-50/70 border border-stone-100 hover:border-bible-gold/40 transition-all hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-bible-ink flex items-center gap-1.5">
                        <span 
                          className="w-2.5 h-2.5 rounded-full inline-block" 
                          style={{ backgroundColor: cat.color }} 
                        />
                        {cat.label}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-stone-400 bg-stone-200/50 px-2 py-0.5 rounded-md">
                        {cat.testament}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs text-stone-500 mb-1.5">
                      <span>{cat.completedChapters} / {cat.totalChapters} cap.</span>
                      <span className="font-bold text-bible-ink">{cat.percentage}%</span>
                    </div>

                    <div className="w-full bg-stone-200/60 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.max(4, cat.percentage)}%`, 
                          backgroundColor: cat.color 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mosaico Visual de la Biblioteca Sagrada de 66 Pergaminos */}
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-stone-200/60 shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-display font-bold text-bible-ink">
                    Mosaico Gráfico de los 66 Libros
                  </h3>
                  <p className="text-xs text-stone-400 font-medium mt-0.5">
                    Toca cualquier libro para abrirlo directamente en el lector de estudio
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs text-stone-400">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Ley
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span> Historia
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span> Poesía
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span> Evangelios
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span> Epístolas
                  </div>
                </div>
              </div>

              {/* Grid canónico de libros */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                {allBooks.map((book) => {
                  const isNT = ['gospels', 'church_history', 'letters', 'prophecy'].includes(book.category);
                  return (
                    <button
                      key={book.name}
                      onClick={() => onNavigateToBible(book.name, 1)}
                      className="group relative p-3 rounded-2xl bg-stone-50 border border-stone-100 hover:border-bible-gold hover:bg-white hover:shadow-md transition-all text-left flex flex-col justify-between h-20 active:scale-95"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[9px] font-extrabold text-stone-400 uppercase tracking-wider">
                          {isNT ? 'NT' : 'AT'}
                        </span>
                        <span className="text-[10px] font-bold text-bible-accent">
                          {book.chapters}c
                        </span>
                      </div>
                      <div className="font-display font-bold text-xs text-bible-ink truncate group-hover:text-bible-gold transition-colors">
                        {book.name}
                      </div>
                      <div className="w-full h-1 bg-stone-200 rounded-full overflow-hidden mt-1">
                        <div 
                          className="h-full bg-bible-gold opacity-80 group-hover:opacity-100" 
                          style={{ width: '25%' }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* PESTAÑA 2: LÍNEA DE LOS PACTOS DE LA REDENCIÓN */}
        {activeTab === 'covenants' && (
          <motion.div
            key="covenants"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-stone-200/60 shadow-soft">
              <div className="mb-8">
                <h3 className="text-2xl font-display font-bold text-bible-ink">
                  La Teología de los Pactos Bíblicos
                </h3>
                <p className="text-sm text-stone-500 mt-1 max-w-3xl">
                  Dios no se relaciona con la humanidad al azar, sino a través de pactos solemnes progresivos que culminan gloriosamente en la sangre del Nuevo Pacto en Cristo.
                </p>
              </div>

              {/* Línea de tiempo visual SVG interactiva */}
              <div className="relative border-l-2 border-dashed border-bible-gold/40 ml-4 md:ml-8 pl-6 md:pl-10 space-y-8">
                {covenants.map((cov, index) => (
                  <motion.div
                    key={cov.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group cursor-pointer"
                    onClick={() => setSelectedCovenant(cov)}
                  >
                    {/* Nodo de la línea */}
                    <div 
                      className="absolute -left-[35px] md:-left-[51px] top-1.5 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-125"
                      style={{ backgroundColor: cov.color }}
                    >
                      {renderCovenantIcon(cov.iconName, '#ffffff')}
                    </div>

                    {/* Tarjeta del pacto */}
                    <div className="p-5 md:p-6 rounded-3xl bg-stone-50 border border-stone-100 hover:border-bible-gold/50 hover:bg-white hover:shadow-lg transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-bible-accent">
                          {cov.biblicalEra}
                        </span>
                        <span className="text-xs bg-stone-200/60 text-stone-600 font-bold px-2.5 py-0.5 rounded-full">
                          {cov.scripture}
                        </span>
                      </div>

                      <h4 className="text-xl font-display font-bold text-bible-ink group-hover:text-bible-gold transition-colors">
                        {cov.name}
                      </h4>
                      <p className="text-xs font-semibold text-stone-500 mt-1">
                        Mediador: <span className="text-bible-ink">{cov.mediator}</span> | Señal: <span className="text-bible-ink">{cov.sign}</span>
                      </p>

                      <div className="mt-3 p-3 bg-amber-50/60 rounded-2xl border border-amber-100/80 text-xs text-stone-700 leading-relaxed">
                        <strong className="text-bible-leather">Cumplimiento en Cristo:</strong> {cov.christologicalFulfillment}
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-bible-accent font-bold">
                        <span>Ver análisis exegético completo</span>
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Modal de Detalle de Pacto */}
            {selectedCovenant && (
              <div 
                className="fixed inset-0 z-50 bg-bible-ink/60 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setSelectedCovenant(null)}
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-glass border border-white/40"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="p-3 rounded-2xl text-white shadow-md"
                      style={{ backgroundColor: selectedCovenant.color }}
                    >
                      {renderCovenantIcon(selectedCovenant.iconName, '#ffffff')}
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-bible-accent">
                        {selectedCovenant.biblicalEra}
                      </span>
                      <h3 className="text-2xl font-display font-bold text-bible-ink">
                        {selectedCovenant.name}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm text-stone-600">
                    <div className="p-3 bg-stone-50 rounded-2xl">
                      <p className="font-bold text-bible-ink">Escrituras Clave:</p>
                      <p className="text-xs text-bible-accent font-semibold">{selectedCovenant.scripture}</p>
                    </div>

                    <div>
                      <p className="font-bold text-bible-ink text-xs uppercase tracking-wider mb-1">Promesa del Pacto:</p>
                      <p className="text-xs leading-relaxed">{selectedCovenant.promise}</p>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-2xl border border-bible-gold/30">
                      <p className="font-bold text-bible-leather text-xs uppercase tracking-wider mb-1">Tipología Cristológica:</p>
                      <p className="text-xs text-stone-800 leading-relaxed">{selectedCovenant.christologicalFulfillment}</p>
                    </div>

                    <div>
                      <p className="font-bold text-bible-ink text-xs uppercase tracking-wider mb-1">Trascendencia Teológica:</p>
                      <p className="text-xs leading-relaxed">{selectedCovenant.theologicalSignificance}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCovenant(null)}
                    className="mt-6 w-full py-3 bg-bible-leather text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-bible-ink transition-colors"
                  >
                    Entendido
                  </button>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {/* PESTAÑA 3: DIAGRAMA GRÁFICO DEL TABERNÁCULO */}
        {activeTab === 'tabernacle' && (
          <motion.div
            key="tabernacle"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-stone-200/60 shadow-soft">
              <div className="mb-6">
                <span className="text-[11px] font-extrabold text-bible-accent uppercase tracking-widest block mb-1">
                  Arquitectura Sagrada & Tipología Mesiánica
                </span>
                <h3 className="text-2xl font-display font-bold text-bible-ink">
                  El Tabernáculo de Moisés y la Sombra de Cristo
                </h3>
                <p className="text-xs md:text-sm text-stone-500 mt-1 max-w-3xl">
                  Conforme a Hebreos 8:5, el tabernáculo es "figura y sombra de las cosas celestiales". Cada objeto representa una faceta del ministerio y gloria de Jesucristo.
                </p>
              </div>

              {/* Visualización Gráfica Interactiva del Tabernáculo en SVG */}
              <div className="relative bg-gradient-to-b from-stone-900 to-stone-950 p-6 rounded-3xl overflow-hidden border border-stone-800 text-white shadow-2xl">
                <div className="flex items-center justify-between text-xs text-stone-400 mb-4">
                  <span className="flex items-center gap-1.5 text-bible-gold font-bold">
                    <Maximize2 size={14} /> Plano del Tabernáculo en el Desierto
                  </span>
                  <span>Toca un elemento numerado para ver su misterio</span>
                </div>

                {/* SVG Blueprint */}
                <div className="w-full max-w-xl mx-auto aspect-[3/4] relative border-2 border-stone-700/60 rounded-2xl bg-stone-900/80 p-4">
                  {/* Zona: Lugar Santísimo */}
                  <div className="absolute top-[8%] left-[20%] right-[20%] h-[18%] border-2 border-amber-500/70 bg-amber-950/30 rounded-xl flex items-center justify-center">
                    <span className="text-[10px] font-bold tracking-widest text-amber-300 uppercase">
                      Lugar Santísimo (Kódesh HaKodashím)
                    </span>
                  </div>

                  {/* Velo divisor */}
                  <div className="absolute top-[26%] left-[15%] right-[15%] h-[2px] bg-red-600/80 dashed shadow-sm flex items-center justify-center">
                    <span className="text-[8px] bg-red-900 text-white px-2 rounded-full uppercase tracking-widest">
                      El Velo Rasgado (Parójet)
                    </span>
                  </div>

                  {/* Zona: Lugar Santo */}
                  <div className="absolute top-[28%] left-[20%] right-[20%] h-[24%] border-2 border-blue-500/50 bg-blue-950/20 rounded-xl flex items-center justify-center">
                    <span className="text-[10px] font-bold tracking-widest text-blue-300 uppercase">
                      Lugar Santo (Kódesh)
                    </span>
                  </div>

                  {/* Zona: Atrio Exterior */}
                  <div className="absolute top-[54%] left-[10%] right-[10%] bottom-[4%] border-2 border-stone-600/50 bg-stone-800/20 rounded-xl flex flex-col justify-end items-center pb-2">
                    <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                      Atrio Exterior (Jatsér)
                    </span>
                  </div>

                  {/* Estaciones Interactivas del Tabernáculo */}
                  {tabernacleStations.map((station) => (
                    <button
                      key={station.id}
                      onClick={() => setSelectedStation(station)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full font-display font-bold text-xs flex items-center justify-center shadow-lg transition-all active:scale-90 ${
                        selectedStation?.id === station.id
                          ? 'ring-4 ring-white bg-bible-gold text-bible-ink scale-125 z-20 animate-pulse'
                          : 'bg-bible-leather hover:bg-bible-gold text-white hover:text-bible-ink z-10'
                      }`}
                      style={{ 
                        left: `${station.svgPosition.x}%`, 
                        top: `${station.svgPosition.y}%` 
                      }}
                      title={station.name}
                    >
                      {station.number}
                    </button>
                  ))}
                </div>
              </div>

              {/* Panel de Detalle del Objeto Sagrado Seleccionado */}
              <div className="mt-6 p-6 rounded-3xl bg-stone-50 border border-stone-200">
                {selectedStation ? (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-bible-accent uppercase tracking-widest">
                        Estación {selectedStation.number} • {selectedStation.zone}
                      </span>
                      <span className="text-xs bg-bible-leather text-white font-bold px-3 py-1 rounded-full">
                        {selectedStation.scripture}
                      </span>
                    </div>

                    <h4 className="text-2xl font-display font-bold text-bible-ink">
                      {selectedStation.name}
                    </h4>
                    <p className="text-xs font-serif italic text-stone-500 mb-4">
                      Nombre Hebreo: {selectedStation.hebrewName} | Materiales: {selectedStation.materials}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
                        <strong className="text-bible-leather block text-xs uppercase mb-1">Función Levítica Original:</strong>
                        <p className="text-stone-600 leading-relaxed">{selectedStation.priestlyFunction}</p>
                      </div>

                      <div className="p-4 bg-amber-50 rounded-2xl border border-bible-gold/30 shadow-sm">
                        <strong className="text-bible-accent block text-xs uppercase mb-1">Revelación en Jesucristo:</strong>
                        <p className="text-stone-800 leading-relaxed font-medium">{selectedStation.christologicalShadow}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-stone-400 text-xs">
                    <Info size={24} className="mx-auto mb-2 text-bible-gold" />
                    Selecciona uno de los números dorados en el plano superior para examinar su tipología mesiánica.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* PESTAÑA 4: CALENDARIO CIRCULAR D3 DE CONSISTENCIA Y RACHA */}
        {activeTab === 'heatmap' && (
          <motion.div
            key="heatmap"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <ReadingStreakTracker 
              userStats={userStats}
              onNavigateToReading={() => onNavigateToBible('Juan', 1)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
