import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { GithubIcon as Github } from './GithubIcon';
import { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle, 
  loginWithGitHub, 
  loginAsGuest 
} from '../lib/firebase';

interface AuthGateProps {
  onSuccess?: () => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const formatAuthError = (err: any): string => {
    const code = err.code || err.message || '';
    if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
      return 'Correo o contraseña incorrectos. Verifica tus datos o regístrate si no tienes cuenta.';
    }
    if (code.includes('email-already-in-use')) {
      return 'Este correo electrónico ya está registrado. Por favor selecciona "Iniciar Sesión".';
    }
    if (code.includes('weak-password')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (code.includes('invalid-email')) {
      return 'El formato del correo electrónico no es válido.';
    }
    if (code.includes('popup-closed-by-user')) {
      return 'La ventana de autenticación fue cerrada.';
    }
    return err.message || 'Error en la autenticación. Por favor intenta de nuevo.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden. Por favor verifícalas.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        await registerWithEmail(email.trim(), password, displayName.trim() || undefined);
        setSuccessMsg('¡Cuenta creada exitosamente! Bienvenido a ABBA.');
      } else {
        await loginWithEmail(email.trim(), password);
        setSuccessMsg('¡Bienvenido de nuevo!');
      }
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGitHub = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGitHub();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginAsGuest();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fdfbf7] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Sacred Ambient */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-stone-300/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-stone-200/80 p-8 sm:p-10 relative z-10"
      >
        {/* Emblem & Branding */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-16 h-20 bg-bible-leather rounded-xl mx-auto mb-4 flex flex-col items-center justify-center shadow-lg border-r-4 border-bible-gold relative group"
          >
            <div className="absolute inset-y-2 left-2 w-0.5 bg-white/10" />
            <BookOpen size={30} className="text-bible-gold mb-1" />
            <span className="text-[7px] text-bible-gold font-bold tracking-widest uppercase">ABBA</span>
          </motion.div>

          <h1 className="text-3xl font-display font-bold text-bible-ink tracking-tight uppercase">
            ABBA
          </h1>
          <div className="flex items-center justify-center gap-3 my-2">
            <div className="h-px w-8 bg-bible-gold/30" />
            <span className="text-bible-accent font-bold uppercase tracking-[0.4em] text-[9px]">
              Academia Teológica
            </span>
            <div className="h-px w-8 bg-bible-gold/30" />
          </div>
          <p className="text-stone-500 text-xs mt-2 font-medium">
            Inicia sesión o crea tu cuenta para acceder a la biblioteca viva, tus notas y tu avance.
          </p>
        </div>

        {/* Tab Toggle: Iniciar Sesión vs Registro */}
        <div className="grid grid-cols-2 p-1 bg-stone-100/80 rounded-2xl border border-stone-200 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`py-2.5 rounded-xl font-bold text-xs transition-all ${
              mode === 'login'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Iniciar Sesión
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`py-2.5 rounded-xl font-bold text-xs transition-all ${
              mode === 'register'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start gap-2.5"
          >
            <AlertCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-start gap-2.5"
          >
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Nombre Completo
              </label>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Tu nombre o alias de estudio"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
                <User size={16} className="absolute left-3.5 top-3 text-stone-400" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <input 
                type="email"
                required
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
              <Mail size={16} className="absolute left-3.5 top-3 text-stone-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Contraseña {mode === 'register' && <span className="text-stone-400 font-normal">(mínimo 6 caracteres)</span>}
            </label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
              <Lock size={16} className="absolute left-3.5 top-3 text-stone-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-600 transition-colors"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
                <Lock size={16} className="absolute left-3.5 top-3 text-stone-400" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-98 mt-2"
          >
            {loading && <Loader2 size={16} className="animate-spin text-amber-400" />}
            <span>{mode === 'login' ? 'Iniciar Sesión' : 'Crear mi Cuenta'}</span>
            <ArrowRight size={14} className="text-amber-400" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-stone-200 w-full" />
          <span className="bg-white px-3 text-[10px] text-stone-400 uppercase font-bold tracking-wider whitespace-nowrap">
            o acceder con
          </span>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-stone-200 hover:bg-stone-50 text-stone-800 text-xs font-bold rounded-2xl transition-all shadow-xs active:scale-95"
          >
            <span className="font-black text-red-500 text-sm">G</span>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={handleGitHub}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-2xl transition-all shadow-xs active:scale-95"
          >
            <Github size={15} />
            <span>GitHub</span>
          </button>
        </div>

        {/* Guest access option */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleGuest}
            disabled={loading}
            className="text-xs text-stone-400 hover:text-amber-800 transition-colors underline"
          >
            Explorar en modo invitado (sin registro)
          </button>
        </div>

        {/* Bottom Mode Switch Link */}
        <div className="text-center mt-6 pt-4 border-t border-stone-100 text-xs text-stone-500">
          {mode === 'login' ? (
            <p>
              ¿Aún no tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-amber-700 hover:underline font-bold"
              >
                Regístrate aquí
              </button>
            </p>
          ) : (
            <p>
              ¿Ya tienes una cuenta registrada?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-amber-700 hover:underline font-bold"
              >
                Inicia sesión aquí
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};
