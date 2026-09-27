
import React, { useState } from 'react';
import { StudyLesson } from '../types';
import { geminiService } from '../services/geminiService';
import { TextAudioPlayer } from './TextAudioPlayer';
import { TheologyTutor } from './TheologyTutor';

const studyModules = [
  {
    title: "Fundamentos (Discipulado)",
    topics: ["La Salvación", "La Fe", "El Arrepentimiento", "La Oración", "La Biblia"]
  },
  {
    title: "Teología Sistemática (Doctrina)",
    topics: ["La Trinidad", "Atributos de Dios", "Divinidad de Cristo", "El Espíritu Santo", "Los Ángeles"]
  },
  {
    title: "Vida Cristiana",
    topics: ["El Perdón", "El Sufrimiento", "Mayordomía", "Santificación", "Evangelismo"]
  }
];

export const StudyMode: React.FC = () => {
  const [customTopic, setCustomTopic] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState<StudyLesson | null>(null);
  const [viewState, setViewState] = useState<'selection' | 'lesson' | 'quiz' | 'results'>('selection');
  
  // Chat Tutor State
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  
  // Quiz State
  const [answers, setAnswers] = useState<Record<number, number>>({}); // questionId -> optionIndex
  const [score, setScore] = useState(0);

  const loadLesson = async (topic: string) => {
    setSelectedTopic(topic);
    setLoading(true);
    setViewState('lesson');
    try {
      const data = await geminiService.getStudyLesson(topic);
      setLesson(data);
    } catch (error) {
      console.error(error);
      // Fallback or error state could go here
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTopic.trim()) {
      loadLesson(customTopic);
    }
  };

  const startQuiz = () => {
    setViewState('quiz');
    setAnswers({});
    setScore(0);
  };

  const submitQuiz = () => {
    if (!lesson) return;
    let correctCount = 0;
    lesson.quiz.forEach(q => {
      if (answers[q.id] === q.correctAnswerIndex) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setViewState('results');
  };

  const resetStudy = () => {
    setViewState('selection');
    setLesson(null);
    setSelectedTopic(null);
    setAnswers({});
    setIsTutorOpen(false);
    setCustomTopic('');
  };

  if (viewState === 'selection') {
    return (
      <div className="max-w-4xl mx-auto pt-8 animate-fade-in pb-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-bible-ink mb-3">Plan de Estudios Bíblicos</h1>
          <p className="text-stone-500">Crea un estudio sobre cualquier tema o elige uno de nuestro currículo.</p>
        </div>

        {/* Custom Topic Generator Section */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-bible-gold/20 mb-12 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-bible-leather via-bible-gold to-bible-leather"></div>
           
           <h2 className="text-xl font-bold text-bible-ink mb-4 flex items-center justify-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-bible-gold">
               <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
             </svg>
             Estudios Personalizados
           </h2>
           <p className="text-stone-500 text-sm mb-6 max-w-md mx-auto">
             Escribe cualquier tema teológico que te interese (ej. La Gracia, El Pacto, Apocalipsis) y generaremos una lección basada en la Sana Doctrina.
           </p>
           
           <form onSubmit={handleCustomSearch} className="max-w-lg mx-auto space-y-4">
              <input 
                type="text" 
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Introducir tema teológico..."
                className="w-full px-6 py-4 rounded-xl border border-stone-200 focus:border-bible-gold focus:ring-0 outline-none text-lg shadow-sm transition-all"
              />
              <button 
                type="submit"
                disabled={!customTopic.trim()}
                className="w-full bg-bible-leather text-white py-4 rounded-xl font-bold hover:bg-bible-ink disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                Generar Estudio
              </button>
           </form>
        </div>

        <div className="flex items-center gap-4 mb-8">
           <div className="h-px bg-stone-200 flex-1"></div>
           <span className="text-stone-400 text-xs font-bold uppercase tracking-widest">O explora nuestro currículo</span>
           <div className="h-px bg-stone-200 flex-1"></div>
        </div>

        <div className="space-y-10">
          {studyModules.map((module, mIdx) => (
            <div key={mIdx}>
               <h3 className="text-xl font-bold text-bible-leather mb-4 border-b border-stone-200 pb-2">{module.title}</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {module.topics.map((topic, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadLesson(topic)}
                    className="p-6 bg-white border border-stone-200 rounded-xl hover:border-bible-gold hover:shadow-lg transition-all group text-left"
                  >
                    <h3 className="font-display font-bold text-lg text-bible-ink group-hover:text-bible-leather mb-1">{topic}</h3>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">Comenzar Clase &rarr;</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto pt-20 text-center animate-pulse px-4">
        <div className="w-16 h-16 bg-bible-gold/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-bible-gold animate-spin">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.499 5.258 50.55 50.55 0 00-2.658.813m-15.482 0A50.55 50.55 0 0112 13.489a50.55 50.55 0 016.744-2.9m0 0A50.55 50.55 0 0112 13.489a50.55 50.55 0 01-6.744-2.9" />
            </svg>
        </div>
        <h2 className="text-xl font-bold text-bible-ink">Preparando tu estudio sobre: <br/><span className="text-bible-accent">"{selectedTopic}"</span></h2>
        <p className="text-stone-500 mt-2">Consultando fuentes teológicas y escrituras...</p>
      </div>
    );
  }

  if (viewState === 'lesson' && lesson) {
    return (
      <div className="max-w-3xl mx-auto pt-8 pb-20 animate-fade-in relative px-4 md:px-0">
        <button onClick={resetStudy} className="mb-6 text-stone-500 hover:text-bible-ink flex items-center gap-2 text-sm font-bold">
           &larr; Volver a Temas
        </button>

        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-stone-100">
          <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
            <div>
               <span className="inline-block px-3 py-1 bg-bible-gold/10 text-bible-gold rounded-full text-xs font-bold uppercase tracking-widest mb-2">Lección Teológica</span>
               <h1 className="text-2xl md:text-3xl font-display font-bold text-bible-ink leading-tight">{lesson.title}</h1>
            </div>
            
            {/* Ask Tutor Button - Desktop */}
            <button 
              onClick={() => setIsTutorOpen(true)}
              className="hidden lg:flex items-center gap-2 px-4 py-2 bg-bible-ink text-white rounded-full text-xs font-bold hover:bg-stone-800 transition-colors shadow-md whitespace-nowrap"
            >
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-bible-gold">
                  <path d="M11.25 4.533A9.707 9.707 0 006 3.75c-2.389 0-4.575.683-6.406 1.858a.75.75 0 01-.437-.695V3.75a.75.75 0 01.75-.75h14.25a.75.75 0 01.75.75v.916c0 .124-.034.24-.094.34a9.712 9.712 0 00-3.563-.467z" />
                  <path fillRule="evenodd" d="M2.25 7.5a.75.75 0 01.75-.75h18a.75.75 0 01.75.75v.784a9.757 9.757 0 01-9.75 9.75A9.757 9.757 0 012.25 8.284V7.5zM9.994 17.585a.75.75 0 01.728.568A11.258 11.258 0 0012 21a11.258 11.258 0 001.278-2.847.75.75 0 011.456.368A12.76 12.76 0 0112 22.5c-1.25 0-2.436-.217-3.55-.615a.75.75 0 01.544-1.299z" clipRule="evenodd" />
               </svg>
               Resolver Dudas
            </button>
          </div>
          
          <div className="prose prose-stone prose-lg max-w-none mb-8">
            <TextAudioPlayer text={lesson.content} title="Escuchar Clase" className="mb-6" />
            <div className="whitespace-pre-wrap font-serif text-stone-700 leading-relaxed text-base md:text-lg">
              {lesson.content}
            </div>
          </div>
          
          {/* Mobile Tutor Button - Inline */}
          <button 
             onClick={() => setIsTutorOpen(true)}
             className="w-full lg:hidden mb-8 flex items-center justify-center gap-2 px-4 py-3 bg-bible-ink text-white rounded-lg text-sm font-bold hover:bg-stone-800 transition-colors shadow-md"
          >
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-bible-gold">
                <path d="M11.25 4.533A9.707 9.707 0 006 3.75c-2.389 0-4.575.683-6.406 1.858a.75.75 0 01-.437-.695V3.75a.75.75 0 01.75-.75h14.25a.75.75 0 01.75.75v.916c0 .124-.034.24-.094.34a9.712 9.712 0 00-3.563-.467z" />
                <path fillRule="evenodd" d="M2.25 7.5a.75.75 0 01.75-.75h18a.75.75 0 01.75.75v.784a9.757 9.757 0 01-9.75 9.75A9.757 9.757 0 012.25 8.284V7.5zM9.994 17.585a.75.75 0 01.728.568A11.258 11.258 0 0012 21a11.258 11.258 0 001.278-2.847.75.75 0 011.456.368A12.76 12.76 0 0112 22.5c-1.25 0-2.436-.217-3.55-.615a.75.75 0 01.544-1.299z" clipRule="evenodd" />
             </svg>
             Tengo una duda sobre este tema
          </button>

          <div className="bg-stone-50 p-6 rounded-lg mb-8 border-l-4 border-bible-leather">
            <h3 className="text-sm font-bold text-bible-ink uppercase tracking-wider mb-2">Lecturas Clave</h3>
            <ul className="list-disc pl-5 space-y-1">
              {lesson.keyVerses.map((v, i) => (
                <li key={i} className="text-bible-accent font-serif italic">{v}</li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center">
            <button 
              onClick={startQuiz}
              className="px-8 py-3 bg-bible-leather text-white font-bold rounded-lg shadow-md hover:bg-bible-ink transition-transform transform hover:-translate-y-1"
            >
              Comenzar Quiz
            </button>
          </div>
        </div>

        {/* Theology Tutor Modal/Overlay */}
        <TheologyTutor 
          topic={lesson.topic}
          isOpen={isTutorOpen}
          onClose={() => setIsTutorOpen(false)}
        />
      </div>
    );
  }

  if (viewState === 'quiz' && lesson) {
    return (
      <div className="max-w-2xl mx-auto pt-8 pb-20 animate-fade-in px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-bible-ink">Evaluación de Conocimiento</h2>
          <p className="text-stone-500">Responde las siguientes preguntas sobre la lección.</p>
        </div>

        <div className="space-y-8">
          {lesson.quiz.map((q, index) => (
            <div key={q.id} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
              <h3 className="font-bold text-lg text-bible-ink mb-4 flex gap-3">
                <span className="bg-stone-100 text-stone-500 w-8 h-8 flex items-center justify-center rounded-full text-sm flex-shrink-0">{index + 1}</span>
                {q.question}
              </h3>
              <div className="space-y-3 pl-11">
                {q.options.map((opt, optIdx) => (
                  <label key={optIdx} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${answers[q.id] === optIdx ? 'border-bible-gold bg-bible-gold/5' : 'border-stone-200 hover:bg-stone-50'}`}>
                    <input 
                      type="radio" 
                      name={`question-${q.id}`} 
                      className="w-4 h-4 text-bible-gold focus:ring-bible-gold"
                      checked={answers[q.id] === optIdx}
                      onChange={() => setAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                    />
                    <span className="text-stone-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <button 
            onClick={submitQuiz}
            disabled={Object.keys(answers).length < lesson.quiz.length}
            className={`px-8 py-3 rounded-lg font-bold transition-all ${Object.keys(answers).length < lesson.quiz.length ? 'bg-stone-300 cursor-not-allowed text-stone-500' : 'bg-bible-gold text-white hover:bg-bible-accent shadow-lg'}`}
          >
            Ver Resultados
          </button>
        </div>
      </div>
    );
  }

  if (viewState === 'results' && lesson) {
    return (
      <div className="max-w-2xl mx-auto pt-8 animate-fade-in text-center px-4">
        <div className="bg-white p-8 rounded-xl shadow-xl border-t-8 border-bible-gold mb-8">
          <h2 className="text-2xl font-bold text-bible-ink mb-2">Resultados</h2>
          <div className="text-6xl font-display font-bold text-bible-gold mb-4">
            {score} / {lesson.quiz.length}
          </div>
          <p className="text-stone-600 mb-6">
            {score === lesson.quiz.length ? "¡Excelente! Has comprendido perfectamente la lección." : score > 0 ? "¡Buen trabajo! Sigue estudiando." : "Repasa la lección e inténtalo de nuevo."}
          </p>

          <div className="text-left space-y-6 mt-8 border-t border-stone-100 pt-8">
             {lesson.quiz.map((q, index) => (
                <div key={q.id} className="p-4 bg-stone-50 rounded-lg">
                   <p className="font-bold text-bible-ink mb-2">{index + 1}. {q.question}</p>
                   <div className="flex justify-between items-center text-sm">
                      <span className={answers[q.id] === q.correctAnswerIndex ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                        Tu respuesta: {q.options[answers[q.id]]}
                      </span>
                      {answers[q.id] !== q.correctAnswerIndex && (
                        <span className="text-stone-500">Correcta: {q.options[q.correctAnswerIndex]}</span>
                      )}
                   </div>
                   <p className="mt-2 text-xs text-stone-500 italic bg-white p-2 rounded border border-stone-200">
                     💡 {q.explanation}
                   </p>
                </div>
             ))}
          </div>

          <div className="mt-8 flex gap-4 justify-center">
             <button onClick={() => setViewState('lesson')} className="px-6 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-bold">Repasar Lección</button>
             <button onClick={resetStudy} className="px-6 py-2 bg-bible-leather text-white rounded-lg font-bold hover:bg-bible-ink">Nuevo Tema</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
