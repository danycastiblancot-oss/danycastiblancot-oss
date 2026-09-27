
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, Send, Sparkles, X, BookOpen, ScrollText } from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

interface TheologyTutorProps {
  topic: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TheologyTutor: React.FC<TheologyTutorProps> = ({ topic, isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: `Bienvenido a la Academia ABBA. Estoy aquí para profundizar contigo en "${topic}". ¿Tienes alguna duda teológica o histórica sobre este pasaje?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const answer = await geminiService.askTheologyTutor(userMsg, topic);
      setMessages(prev => [...prev, { role: 'ai', text: answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Lo siento, tuve un problema conectando con la biblioteca teológica. Por favor, reintenta." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-bible-ink/40 backdrop-blur-sm" 
            onClick={onClose}
          />

          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-lg bg-white h-full shadow-glass flex flex-col border-l border-white/20"
          >
            <div className="p-8 bg-bible-leather text-white flex justify-between items-start shadow-xl z-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <GraduationCap size={120} />
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 bg-bible-gold rounded-2xl flex items-center justify-center text-bible-ink shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                  <GraduationCap size={28} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl leading-tight">Academia ABBA</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-bible-gold rounded-full animate-pulse"></span>
                    <p className="text-[10px] font-extra-bold text-stone-300 uppercase tracking-[0.2em]">Tutor Teológico Activo</p>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all relative z-10 active:scale-90">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-stone-50/50">
              <div className="text-center mb-8">
                 <span className="bg-bible-gold/10 text-bible-gold text-[10px] font-extra-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-bible-gold/20">
                   Tema: {topic}
                 </span>
              </div>

              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[90%] p-6 rounded-[2rem] text-sm leading-relaxed shadow-soft transition-all ${
                      msg.role === 'user' 
                        ? 'bg-bible-leather text-white rounded-tr-none' 
                        : 'bg-white text-bible-ink border border-stone-100 rounded-tl-none'
                    }`}
                  >
                    {msg.role === 'ai' && (
                      <div className="flex items-center gap-2 mb-3 text-bible-gold">
                        <Sparkles size={14} />
                        <span className="text-[10px] font-extra-bold uppercase tracking-widest">Respuesta de la Academia</span>
                      </div>
                    )}
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              
              {loading && (
                 <div className="flex justify-start">
                   <div className="bg-white p-5 rounded-[1.5rem] rounded-tl-none border border-stone-100 shadow-soft flex gap-1.5 items-center">
                     <div className="w-2 h-2 bg-bible-gold rounded-full animate-bounce"></div>
                     <div className="w-2 h-2 bg-bible-gold rounded-full animate-bounce [animation-delay:0.2s]"></div>
                     <div className="w-2 h-2 bg-bible-gold rounded-full animate-bounce [animation-delay:0.4s]"></div>
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-6 bg-white border-t border-stone-100 backdrop-blur-md">
               <div className="relative flex items-center gap-3">
                 <ScrollText size={18} className="absolute left-5 text-stone-400" />
                 <input
                   type="text"
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   placeholder="Consulta teológica avanzada..."
                   className="w-full pl-12 pr-14 py-4 bg-stone-100/50 rounded-2xl border border-transparent focus:border-bible-gold/30 focus:ring-4 focus:ring-bible-gold/5 outline-none transition-all text-sm placeholder:text-stone-400"
                   disabled={loading}
                 />
                 <button 
                   type="submit" 
                   disabled={!input.trim() || loading}
                   className="absolute right-2 p-2.5 bg-bible-leather text-white rounded-xl hover:bg-bible-ink shadow-lg transition-all active:scale-90 disabled:opacity-50"
                 >
                    <Send size={18} />
                 </button>
               </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
