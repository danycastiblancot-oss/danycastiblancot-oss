import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  BookOpen, 
  Languages, 
  FileText, 
  Network, 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  Search, 
  ArrowRight, 
  Compass, 
  Scroll, 
  HelpCircle,
  Share2,
  RefreshCw
} from 'lucide-react';
import { 
  geminiService, 
  getExegeticalDeepDive, 
  generateTheologicalDiagram, 
  generateSermonOutline, 
  askTheologyTutor 
} from '../services/geminiService';
import { 
  ExegeticalDeepDive, 
  TheologicalDiagram, 
  HomileticalOutline 
} from '../types';

interface AITheologyStudioProps {
  initialTopic?: string;
  onBack: () => void;
}

type StudioTab = 'exegesis' | 'homiletics' | 'diagram' | 'chat';

export const AITheologyStudio: React.FC<AITheologyStudioProps> = ({ 
  initialTopic = 'Juan 1:1-14', 
  onBack 
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('exegesis');
  
  // Estados para Exégesis Lingüística
  const [exegesisQuery, setExegesisQuery] = useState(initialTopic);
  const [exegesisData, setExegesisData] = useState<ExegeticalDeepDive | null>(null);
  const [loadingExegesis, setLoadingExegesis] = useState(false);

  // Estados para Bosquejo Homilético
  const [homileticsPassage, setHomileticsPassage] = useState('Romanos 8:28-39');
  const [homileticsTheme, setHomileticsTheme] = useState('La Seguridad Eterna en Cristo');
  const [homileticsData, setHomileticsData] = useState<HomileticalOutline | null>(null);
  const [loadingHomiletics, setLoadingHomiletics] = useState(false);
  const [copiedHomiletics, setCopiedHomiletics] = useState(false);

  // Estados para Diagrama Teológico
  const [diagramQuery, setDiagramQuery] = useState('El Orden de la Salvación (Ordo Salutis)');
  const [diagramData, setDiagramData] = useState<TheologicalDiagram | null>(null);
  const [loadingDiagram, setLoadingDiagram] = useState(false);

  // Estados para Tutor Conversacional
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([
    {
      role: 'ai',
      text: '¡La gracia y la paz del Señor sean contigo! Soy tu mentor teológico de la Academia ABBA. ¿Qué pasaje, doctrina o término en sus idiomas originales deseas profundizar hoy?'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  // Handlers
  const handleRunExegesis = async (queryToRun?: string) => {
    const q = queryToRun || exegesisQuery;
    if (!q.trim()) return;
    setLoadingExegesis(true);
    try {
      const result = await geminiService.getExegeticalDeepDive(q);
      setExegesisData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingExegesis(false);
    }
  };

  const handleRunHomiletics = async () => {
    if (!homileticsPassage.trim()) return;
    setLoadingHomiletics(true);
    try {
      const result = await geminiService.generateSermonOutline(homileticsPassage, homileticsTheme);
      setHomileticsData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHomiletics(false);
    }
  };

  const handleRunDiagram = async (topic?: string) => {
    const t = topic || diagramQuery;
    if (!t.trim()) return;
    setLoadingDiagram(true);
    try {
      const result = await geminiService.generateTheologicalDiagram(t);
      setDiagramData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDiagram(false);
    }
  };

  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || loadingChat) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoadingChat(true);

    try {
      const response = await geminiService.askTheologyTutor(userText, 'Teología Sistemática y Exégesis Bíblica');
      setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Ocurrió una dificultad al consultar los textos académicos. Por favor intenta formular tu pregunta nuevamente.' }]);
    } finally {
      setLoadingChat(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHomiletics(true);
    setTimeout(() => setCopiedHomiletics(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 pb-24">
      {/* Header */}
      <div className="text-center mb-8 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bible-gold/10 border border-bible-gold/20 text-bible-accent text-[11px] font-bold uppercase tracking-[0.25em] mb-4">
          <Sparkles size={15} className="text-bible-gold" />
          <span>Inteligencia Teológica Exegética</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-bible-ink tracking-tight mb-3">
          Estudio & Exégesis <span className="text-bible-gold">con IA</span>
        </h1>
        <p className="max-w-2xl mx-auto text-stone-500 text-sm md:text-base leading-relaxed">
          Herramientas profundas de análisis en lenguas originales (Hebreo / Griego), bosquejos homiléticos y diagramas conceptuales basados en la Sana Doctrina.
        </p>
      </div>

      {/* Selector de Pestañas del Studio */}
      <div className="flex flex-wrap items-center justify-center p-1.5 bg-stone-200/60 rounded-2xl max-w-2xl mx-auto mb-8 shadow-inner gap-1">
        <button
          onClick={() => setActiveTab('exegesis')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'exegesis'
              ? 'bg-white text-bible-ink shadow-sm'
              : 'text-stone-500 hover:text-bible-ink'
          }`}
        >
          <Languages size={15} />
          <span>Exégesis & Idiomas</span>
        </button>

        <button
          onClick={() => setActiveTab('homiletics')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'homiletics'
              ? 'bg-white text-bible-ink shadow-sm'
              : 'text-stone-500 hover:text-bible-ink'
          }`}
        >
          <FileText size={15} />
          <span>Bosquejos Homiléticos</span>
        </button>

        <button
          onClick={() => setActiveTab('diagram')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'diagram'
              ? 'bg-white text-bible-ink shadow-sm'
              : 'text-stone-500 hover:text-bible-ink'
          }`}
        >
          <Network size={15} />
          <span>Diagramas IA</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'chat'
              ? 'bg-white text-bible-ink shadow-sm'
              : 'text-stone-500 hover:text-bible-ink'
          }`}
        >
          <MessageSquare size={15} />
          <span>Tutor Conversacional</span>
        </button>
      </div>

      {/* Contenido según pestaña */}
      <AnimatePresence mode="wait">
        {/* PESTAÑA 1: EXÉGESIS & LENGUAS ORIGINALES */}
        {activeTab === 'exegesis' && (
          <motion.div
            key="exegesis"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Barra de Búsqueda Exegética */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-soft">
              <label className="block text-xs font-bold text-bible-ink uppercase tracking-wider mb-2">
                Ingresa pasaje bíblico o término teológico
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={exegesisQuery}
                    onChange={(e) => setExegesisQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRunExegesis()}
                    placeholder="Ej: Juan 1:1, Génesis 15:6, Romanos 8:28, Chesed, Logos, Justificación..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-sans focus:border-bible-gold focus:ring-2 focus:ring-bible-gold/10 outline-none"
                  />
                </div>
                <button
                  onClick={() => handleRunExegesis()}
                  disabled={loadingExegesis}
                  className="px-6 py-3 bg-bible-leather hover:bg-bible-ink text-white font-bold rounded-2xl text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loadingExegesis ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Analizando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Examinar Exégesis</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sugerencias Rápidas */}
              <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
                <span className="text-stone-400 font-bold uppercase text-[10px]">Temas populares:</span>
                {[
                  'Juan 1:1 Logos Divino', 
                  'Génesis 1:1 Bereshit', 
                  'Romanos 5:1 Dikaiosyne (Justicia)', 
                  'Éxodo 34:6 Chesed (Gracia)', 
                  'Isaías 53 El Siervo Sufriente'
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => {
                      setExegesisQuery(chip);
                      handleRunExegesis(chip);
                    }}
                    className="px-3 py-1 bg-stone-100 hover:bg-bible-gold/15 text-stone-600 hover:text-bible-accent rounded-full border border-stone-200 transition-colors text-xs"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Resultados de Exégesis */}
            {exegesisData && (
              <div className="space-y-6">
                {/* Contexto Histórico */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-soft">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-bible-gold/15 text-bible-accent rounded-2xl">
                      <Scroll size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-bible-accent">
                        Marco Hermenéutico
                      </span>
                      <h3 className="text-2xl font-display font-bold text-bible-ink">
                        {exegesisData.passage}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed font-serif">
                    {exegesisData.historicalContext}
                  </p>
                </div>

                {/* Palabras en Lenguas Originales */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-soft">
                  <h4 className="text-lg font-display font-bold text-bible-ink mb-4 flex items-center gap-2">
                    <Languages size={20} className="text-bible-gold" />
                    Análisis Léxico en Idiomas Originales (Hebreo / Griego)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exegesisData.originalLanguageInsights.map((word, idx) => (
                      <div 
                        key={idx}
                        className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 hover:border-bible-gold/40 transition-all hover:bg-white hover:shadow-sm"
                      >
                        <div className="flex items-baseline justify-between mb-2">
                          <span className="text-2xl font-serif font-bold text-bible-leather">
                            {word.originalWord}
                          </span>
                          <span className="text-[10px] bg-bible-gold/20 text-bible-accent font-extrabold px-2 py-0.5 rounded-full">
                            Strong {word.strongsNumber}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                          Transliteración: <span className="text-bible-ink font-semibold">{word.transliteration}</span>
                        </p>
                        <p className="text-xs text-stone-700 mb-2 font-medium">
                          <strong>Significado Léxico:</strong> {word.meaning}
                        </p>
                        <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-100/70 text-xs text-stone-800 leading-relaxed">
                          <strong>Peso Teológico:</strong> {word.theologicalContext}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conexión Cristocéntrica y Doctrinas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-amber-50/80 to-white rounded-3xl p-6 border border-bible-gold/30 shadow-soft">
                    <h4 className="text-base font-display font-bold text-bible-ink mb-3 flex items-center gap-2">
                      <Sparkles size={18} className="text-bible-gold" />
                      Conexión Cristocéntrica (Tipología)
                    </h4>
                    <p className="text-xs md:text-sm text-stone-700 leading-relaxed font-serif">
                      {exegesisData.christocentricConnection}
                    </p>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-soft">
                    <h4 className="text-base font-display font-bold text-bible-ink mb-3 flex items-center gap-2">
                      <BookOpen size={18} className="text-bible-leather" />
                      Doctrinas Teológicas Involucradas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {exegesisData.theologicalDoctrines.map((doc, i) => (
                        <span 
                          key={i}
                          className="px-3 py-1.5 bg-stone-100 text-bible-ink rounded-xl text-xs font-bold border border-stone-200"
                        >
                          • {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Aplicación Práctica */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-soft">
                  <h4 className="text-lg font-display font-bold text-bible-ink mb-4 flex items-center gap-2">
                    <Check size={20} className="text-emerald-600" />
                    Aplicación Exegética para la Vida Diaria
                  </h4>
                  <div className="space-y-3">
                    {exegesisData.practicalApplication.map((app, i) => (
                      <div key={i} className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-100 text-xs text-stone-700 leading-relaxed">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {i + 1}
                        </span>
                        <span>{app}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* PESTAÑA 2: BOSQUEJOS HOMILÉTICOS */}
        {activeTab === 'homiletics' && (
          <motion.div
            key="homiletics"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Formulario de Generación */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-soft">
              <h3 className="text-lg font-display font-bold text-bible-ink mb-4 flex items-center gap-2">
                <FileText size={20} className="text-bible-gold" />
                Generador de Bosquejos Homiléticos Expositivos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                    Texto Bíblico Principal
                  </label>
                  <input
                    type="text"
                    value={homileticsPassage}
                    onChange={(e) => setHomileticsPassage(e.target.value)}
                    placeholder="Ej: Romanos 8:28-39, Efesios 2:1-10, Salmo 23..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-2.5 px-4 text-sm font-sans focus:border-bible-gold focus:ring-2 focus:ring-bible-gold/10 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                    Énfasis Temático (Opcional)
                  </label>
                  <input
                    type="text"
                    value={homileticsTheme}
                    onChange={(e) => setHomileticsTheme(e.target.value)}
                    placeholder="Ej: La Seguridad Eterna, El Amor Ágape, La Gracia..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-2.5 px-4 text-sm font-sans focus:border-bible-gold focus:ring-2 focus:ring-bible-gold/10 outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleRunHomiletics}
                disabled={loadingHomiletics}
                className="w-full py-3.5 bg-bible-leather hover:bg-bible-ink text-white font-bold rounded-2xl text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingHomiletics ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Construyendo Bosquejo Expositivo...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Generar Bosquejo de Predicación</span>
                  </>
                )}
              </button>
            </div>

            {/* Resultado del Bosquejo */}
            {homileticsData && (
              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-stone-200 shadow-soft relative">
                <button
                  onClick={() => {
                    const textToCopy = `BOSQUEJO HOMILÉTICO: ${homileticsData.title}
Texto: ${homileticsData.mainText}
Proposición: ${homileticsData.centralProposition}

I. INTRODUCCIÓN:
${homileticsData.introduction}

PUNTOS EXPOSITIVOS:
${homileticsData.points.map(p => `${p.romanNumeral}. ${p.title} (${p.biblicalSupport})\n${p.explanation}\nIlustración: ${p.illustration}`).join('\n\n')}

CONCLUSIÓN:
${homileticsData.conclusion}

ORACIÓN:
${homileticsData.closingPrayer}`;
                    copyToClipboard(textToCopy);
                  }}
                  className="absolute top-6 right-6 p-2.5 bg-stone-100 hover:bg-bible-gold/20 rounded-2xl text-stone-600 hover:text-bible-accent transition-colors flex items-center gap-1.5 text-xs font-bold"
                  title="Copiar bosquejo completo"
                >
                  {copiedHomiletics ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  <span>{copiedHomiletics ? '¡Copiado!' : 'Copiar'}</span>
                </button>

                <div className="max-w-2xl mb-8">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-bible-accent">
                    Bosquejo Expositivo • {homileticsData.mainText}
                  </span>
                  <h3 className="text-3xl font-display font-bold text-bible-ink mt-1 mb-2">
                    {homileticsData.title}
                  </h3>
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/60 text-xs text-stone-800">
                    <strong className="text-bible-leather">Proposición Central:</strong> {homileticsData.centralProposition}
                  </div>
                </div>

                {/* Introducción */}
                <div className="mb-8 p-5 bg-stone-50 rounded-2xl border border-stone-100">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                    Introducción Expositiva
                  </h4>
                  <p className="text-xs md:text-sm text-stone-700 leading-relaxed font-serif">
                    {homileticsData.introduction}
                  </p>
                </div>

                {/* Puntos Homiléticos */}
                <div className="space-y-6 mb-8">
                  <h4 className="text-sm font-bold text-bible-ink uppercase tracking-wider">
                    Cuerpo del Mensaje (Puntos Principales)
                  </h4>
                  {homileticsData.points.map((pt, idx) => (
                    <div key={idx} className="p-6 rounded-3xl bg-stone-50 border border-stone-200">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="text-base font-display font-bold text-bible-ink">
                          {pt.romanNumeral}. {pt.title}
                        </span>
                        <span className="text-xs bg-bible-leather text-white font-bold px-2.5 py-0.5 rounded-full">
                          {pt.biblicalSupport}
                        </span>
                      </div>
                      <p className="text-xs text-stone-700 leading-relaxed font-serif mb-3">
                        {pt.explanation}
                      </p>
                      <div className="p-3 bg-white rounded-2xl border border-stone-200 text-xs text-stone-600">
                        <strong className="text-bible-accent block text-[11px] uppercase mb-0.5">Ilustración / Ejemplo Práctico:</strong>
                        {pt.illustration}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Conclusión & Oración */}
                <div className="p-6 bg-stone-900 text-white rounded-3xl">
                  <h4 className="text-xs font-bold text-bible-gold uppercase tracking-wider mb-2">
                    Conclusión Pastoral & Desafío
                  </h4>
                  <p className="text-xs md:text-sm text-stone-300 leading-relaxed mb-4 font-serif">
                    {homileticsData.conclusion}
                  </p>
                  <div className="p-4 bg-stone-800/80 rounded-2xl border border-stone-700 text-xs text-amber-200 italic">
                    <strong className="not-italic text-bible-gold block text-[10px] uppercase mb-1">Oración Final:</strong>
                    "{homileticsData.closingPrayer}"
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* PESTAÑA 3: DIAGRAMAS CONCEPTUALES */}
        {activeTab === 'diagram' && (
          <motion.div
            key="diagram"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-soft">
              <label className="block text-xs font-bold text-bible-ink uppercase tracking-wider mb-2">
                Concepto o Estructura Teológica a Diagramar
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={diagramQuery}
                  onChange={(e) => setDiagramQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunDiagram()}
                  placeholder="Ej: El Orden de la Salvación, Los Nombres de Dios, Las 7 Fiestas de Israel..."
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-2xl py-3 px-4 text-sm font-sans focus:border-bible-gold focus:ring-2 focus:ring-bible-gold/10 outline-none"
                />
                <button
                  onClick={() => handleRunDiagram()}
                  disabled={loadingDiagram}
                  className="px-6 py-3 bg-bible-leather hover:bg-bible-ink text-white font-bold rounded-2xl text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loadingDiagram ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Generando Estructura...</span>
                    </>
                  ) : (
                    <>
                      <Network size={16} />
                      <span>Crear Diagrama</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sugerencias Rápidas */}
              <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
                <span className="text-stone-400 font-bold uppercase text-[10px]">Plantillas:</span>
                {[
                  'Ordo Salutis (Orden de Salvación)', 
                  'Los Nombres Redentores de Dios', 
                  'Las 7 Palabras en la Cruz', 
                  'La Armadura de Dios Efesios 6', 
                  'Primer Adán vs Postrer Adán'
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setDiagramQuery(item);
                      handleRunDiagram(item);
                    }}
                    className="px-3 py-1 bg-stone-100 hover:bg-bible-gold/15 text-stone-600 hover:text-bible-accent rounded-full border border-stone-200 transition-colors text-xs"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Diagrama Renderizado */}
            {diagramData && (
              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-stone-200 shadow-soft">
                <div className="mb-6">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-bible-accent">
                    Infografía Conceptual Teológica
                  </span>
                  <h3 className="text-2xl font-display font-bold text-bible-ink">
                    {diagramData.title}
                  </h3>
                  <p className="text-xs md:text-sm text-stone-500 mt-1 font-serif">
                    {diagramData.description}
                  </p>
                </div>

                {/* Nodos del Diagrama en Grid Conectado */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {diagramData.nodes.map((node, idx) => (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-5 rounded-3xl bg-stone-50 border border-stone-200 hover:border-bible-gold hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-bible-accent bg-bible-gold/10 px-2 py-0.5 rounded-md">
                            {node.category}
                          </span>
                          <span className="text-xs bg-stone-200 text-stone-700 font-bold px-2 py-0.5 rounded-full">
                            {node.scriptureReference}
                          </span>
                        </div>
                        <h4 className="text-base font-display font-bold text-bible-ink mb-1">
                          {node.label}
                        </h4>
                        <p className="text-xs text-stone-600 leading-relaxed">
                          {node.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Relaciones & Conexiones Lógicas */}
                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/60 mb-6">
                  <h4 className="text-xs font-bold text-bible-leather uppercase tracking-wider mb-2">
                    Conexiones y Flujo Doctrinal
                  </h4>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {diagramData.connections.map((c, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-xl border border-amber-200 shadow-xs">
                        <strong className="text-bible-ink">{c.fromId}</strong>
                        <ArrowRight size={12} className="text-bible-gold" />
                        <span className="italic text-stone-500">[{c.relationshipLabel}]</span>
                        <ArrowRight size={12} className="text-bible-gold" />
                        <strong className="text-bible-ink">{c.toId}</strong>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Conclusión Teológica */}
                <div className="p-4 bg-stone-100 rounded-2xl text-xs text-stone-700 leading-relaxed font-serif">
                  <strong className="text-bible-ink block text-xs uppercase not-serif font-bold mb-1">
                    Conclusión Hermenéutica:
                  </strong>
                  {diagramData.summaryConclusion}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* PESTAÑA 4: TUTOR CONVERSACIONAL */}
        {activeTab === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-[2.5rem] border border-stone-200 shadow-soft overflow-hidden flex flex-col h-[600px]"
          >
            {/* Cabecera del Chat */}
            <div className="p-5 bg-bible-leather text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-bible-gold rounded-2xl flex items-center justify-center text-bible-ink font-bold shadow-md">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base">Cátedra Teológica AI</h3>
                  <p className="text-[10px] text-stone-300 uppercase tracking-widest">
                    Consultas en Vivo de Sana Doctrina
                  </p>
                </div>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-stone-50/50">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-3xl p-4 text-xs md:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-bible-leather text-white rounded-br-none shadow-md'
                        : 'bg-white text-stone-800 rounded-bl-none border border-stone-200 shadow-sm font-serif'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loadingChat && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-3xl p-4 border border-stone-200 text-xs text-stone-500 flex items-center gap-2">
                    <RefreshCw size={14} className="animate-spin text-bible-gold" />
                    <span>Consultando fuentes patrísticas y exegéticas...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chips Rápidos de Preguntas */}
            <div className="px-4 py-2 bg-stone-100/70 border-t border-stone-200 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-stone-400 font-bold uppercase shrink-0">Sugerencias:</span>
              {[
                '¿Por qué Jesús es el Sumo Sacerdote según Melquisedec?',
                '¿Qué significa la palabra "Logos" en Juan 1?',
                'Explica la diferencia entre Justificación y Santificación'
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setChatInput(q);
                  }}
                  className="px-3 py-1 bg-white hover:bg-bible-gold/20 text-stone-600 hover:text-bible-ink rounded-full border border-stone-200 transition-colors whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input del Chat */}
            <form onSubmit={handleSendChat} className="p-4 bg-white border-t border-stone-200 flex items-center gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Escribe tu consulta bíblica o teológica..."
                className="flex-1 bg-stone-50 border border-stone-200 rounded-2xl py-3 px-4 text-sm font-sans focus:border-bible-gold focus:ring-2 focus:ring-bible-gold/10 outline-none"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || loadingChat}
                className="p-3 bg-bible-leather text-white rounded-2xl hover:bg-bible-ink disabled:opacity-40 transition-colors shadow-md active:scale-95"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
