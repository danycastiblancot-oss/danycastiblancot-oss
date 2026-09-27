import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User as UserIcon, 
  Flame, 
  Award, 
  BookOpen, 
  FileText, 
  Database, 
  LogOut, 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  Loader2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  RefreshCw,
  FolderGit2,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { GithubIcon as Github } from './GithubIcon';
import { auth, loginWithGoogle, loginWithGitHub, loginWithEmail, registerWithEmail, loginAsGuest, logoutUser } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { userService } from '../services/userService';
import { UserStatsModel } from '../models/UserStats';
import { SavedNote, ReadingProgress } from '../types';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStatsModel | null;
  onStatsUpdated?: (stats: UserStatsModel) => void;
  onOpenNotesCrud?: () => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  userStats,
  onStatsUpdated,
  onOpenNotesCrud
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  
  // Auth Form State: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Tabs when logged in: 'profile' | 'github'
  const [loggedInTab, setLoggedInTab] = useState<'profile' | 'github'>('profile');

  // GitHub Integration State
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('biblia_github_pat') || '');
  const [githubUser, setGithubUser] = useState<{ login: string; name: string; avatar_url: string; html_url: string } | null>(null);
  const [syncingGist, setSyncingGist] = useState(false);
  const [gistUrl, setGistUrl] = useState<string | null>(null);
  const [copiedMd, setCopiedMd] = useState(false);
  const [githubMessage, setGithubMessage] = useState<string | null>(null);

  // Firestore Data State
  const [notesCount, setNotesCount] = useState<number>(0);
  const [progressCount, setProgressCount] = useState<number>(0);
  const [userNotes, setUserNotes] = useState<SavedNote[]>([]);
  const [userProgress, setUserProgress] = useState<ReadingProgress[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Listen to Auth State
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        loadUserData(user.uid);
        setAuthError(null);
      } else {
        setNotesCount(0);
        setProgressCount(0);
        setUserNotes([]);
        setUserProgress([]);
      }
    });
    return () => unsub();
  }, []);

  // Format Firebase Auth Errors into clear Spanish messages
  const formatAuthError = (err: any): string => {
    const code = err.code || err.message || '';
    if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
      return 'Correo o contraseña incorrectos. Verifica tus datos o regístrate si no tienes cuenta.';
    }
    if (code.includes('email-already-in-use')) {
      return 'Este correo electrónico ya está registrado. Por favor selecciona "Iniciar Sesión".';
    }
    if (code.includes('weak-password')) {
      return 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
    }
    if (code.includes('invalid-email')) {
      return 'El formato de correo electrónico no es válido.';
    }
    if (code.includes('popup-closed-by-user')) {
      return 'La ventana de autenticación fue cerrada antes de completar el inicio de sesión.';
    }
    return err.message || 'Error en la autenticación. Por favor intenta de nuevo.';
  };

  // Load User Data from Firestore
  const loadUserData = async (uid: string) => {
    setLoadingData(true);
    try {
      const [notes, progress, stats] = await Promise.all([
        userService.getNotes(uid).catch(() => []),
        userService.getReadingProgress(uid).catch(() => []),
        userService.getUserStats(uid).catch(() => null)
      ]);
      setUserNotes(notes);
      setNotesCount(notes.length);
      setUserProgress(progress);
      setProgressCount(progress.length);
      if (stats && onStatsUpdated) {
        onStatsUpdated(stats);
      }
    } catch (err) {
      console.warn("Error loading user firestore data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  // Check stored GitHub token on mount
  useEffect(() => {
    if (githubToken) {
      userService.getGitHubUserInfo(githubToken)
        .then(setGithubUser)
        .catch(() => {
          setGithubUser(null);
        });
    }
  }, [githubToken]);

  if (!isOpen) return null;

  // Handlers for Login & Registration
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!email.trim() || !password) {
      setAuthError('Por favor ingresa tu correo y contraseña');
      return;
    }

    if (authMode === 'register') {
      if (password.length < 6) {
        setAuthError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      if (password !== confirmPassword) {
        setAuthError('Las contraseñas no coinciden. Por favor verifícalas.');
        return;
      }
    }

    setAuthLoading(true);
    try {
      if (authMode === 'register') {
        await registerWithEmail(email.trim(), password, displayName.trim() || undefined);
        setAuthSuccess('¡Cuenta creada exitosamente! Has iniciado sesión.');
      } else {
        await loginWithEmail(email.trim(), password);
        setAuthSuccess('¡Sesión iniciada con éxito!');
      }
    } catch (err: any) {
      setAuthError(formatAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    setAuthLoading(true);
    try {
      await loginWithGoogle();
      setAuthSuccess('¡Inicio de sesión exitoso con Google!');
    } catch (err: any) {
      setAuthError(formatAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    setAuthLoading(true);
    try {
      await loginWithGitHub();
      setAuthSuccess('¡Inicio de sesión exitoso con GitHub!');
    } catch (err: any) {
      setAuthError(formatAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    setAuthLoading(true);
    try {
      await loginAsGuest();
      setAuthSuccess('Has ingresado en modo invitado temporal.');
    } catch (err: any) {
      setAuthError(formatAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setAuthMode('login');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setDisplayName('');
      setAuthSuccess(null);
    } catch (err: any) {
      console.error(err);
    }
  };

  // GitHub Backup & Sync
  const handleSaveGithubToken = async () => {
    setGithubMessage(null);
    if (!githubToken.trim()) {
      localStorage.removeItem('biblia_github_pat');
      setGithubUser(null);
      setGithubMessage('Token de GitHub removido');
      return;
    }
    try {
      const info = await userService.getGitHubUserInfo(githubToken.trim());
      setGithubUser(info);
      localStorage.setItem('biblia_github_pat', githubToken.trim());
      setGithubMessage(`Conectado con GitHub como @${info.login}`);
    } catch (err: any) {
      setGithubMessage(err.message || 'Token de GitHub inválido');
    }
  };

  const handleSyncToGist = async () => {
    if (!githubToken.trim()) {
      setGithubMessage('Ingresa un Personal Access Token de GitHub con permiso "gist"');
      return;
    }
    setSyncingGist(true);
    setGithubMessage(null);
    try {
      const markdownContent = userService.exportToGitHubMarkdown(userNotes, userProgress, userStats?.toPlainObject());
      const filename = `estudio-biblico-${new Date().toISOString().split('T')[0]}.md`;
      const result = await userService.syncToGitHubGist(githubToken, 'Respaldo de Estudio Bíblico & Progreso', {
        [filename]: { content: markdownContent },
        'progreso-biblia.json': { content: JSON.stringify({ stats: userStats?.toPlainObject(), progressCount, notesCount, exportedAt: new Date().toISOString() }, null, 2) }
      });
      setGistUrl(result.html_url);
      setGithubMessage('¡Respaldo sincronizado en GitHub Gist!');
    } catch (err: any) {
      setGithubMessage(err.message || 'Error al respaldar en GitHub');
    } finally {
      setSyncingGist(false);
    }
  };

  const handleCopyMarkdown = () => {
    const md = userService.exportToGitHubMarkdown(userNotes, userProgress, userStats?.toPlainObject());
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    const md = userService.exportToGitHubMarkdown(userNotes, userProgress, userStats?.toPlainObject());
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bitacora-biblica-${new Date().toISOString().split('T')[0]}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isGitHubAuth = currentUser?.providerData.some(p => p.providerId === 'github.com');
  const isGoogleAuth = currentUser?.providerData.some(p => p.providerId === 'google.com');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-fade-in">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 px-6 py-5 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400">
              {currentUser ? <UserCheck size={22} /> : <Mail size={22} />}
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif tracking-tight">
                {currentUser ? 'Mi Cuenta & Perfil' : (authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta (Registro)')}
              </h2>
              <p className="text-xs text-stone-400">
                {currentUser ? 'Avance y notas sincronizadas en Cloud Firestore' : 'Accede para guardar tu progreso de lectura y reflexiones'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT FOR NON-AUTHENTICATED USERS: LOGIN & REGISTRATION */}
        {!currentUser && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            
            {/* Top Toggle: Iniciar Sesión vs Registro */}
            <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl border border-stone-200">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
                className={`py-2.5 rounded-xl font-bold text-xs transition-all ${
                  authMode === 'login'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Iniciar Sesión
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
                className={`py-2.5 rounded-xl font-bold text-xs transition-all ${
                  authMode === 'register'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Registrarme (Nueva Cuenta)
              </button>
            </div>

            {/* Error or Success notification */}
            {authError && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-rose-50 text-rose-800 text-xs rounded-2xl border border-rose-200 flex items-start gap-2.5"
              >
                <AlertCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{authError}</span>
              </motion.div>
            )}

            {authSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-2xl border border-emerald-200 flex items-start gap-2.5"
              >
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{authSuccess}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Ej. Juan Pérez"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    />
                    <UserIcon size={16} className="absolute left-3.5 top-3 text-stone-400" />
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
                    placeholder="tucorreo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                  <Mail size={16} className="absolute left-3.5 top-3 text-stone-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Contraseña {authMode === 'register' && <span className="text-stone-400 font-normal">(mín. 6 caracteres)</span>}
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                  <Lock size={16} className="absolute left-3.5 top-3 text-stone-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {authMode === 'register' && (
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
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    />
                    <Lock size={16} className="absolute left-3.5 top-3 text-stone-400" />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
              >
                {authLoading && <Loader2 size={16} className="animate-spin" />}
                <span>
                  {authMode === 'login' ? 'Iniciar Sesión' : 'Completar Registro & Crear Cuenta'}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-stone-200 w-full"></div>
              <span className="bg-white px-3 text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                o acceder con un clic
              </span>
            </div>

            {/* Fast Social Logins */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-bold rounded-2xl transition-colors shadow-xs active:scale-95"
              >
                <span className="font-black text-red-500 text-sm">G</span>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={handleGitHubSignIn}
                disabled={authLoading}
                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-2xl transition-colors shadow-xs active:scale-95"
              >
                <Github size={15} />
                <span>GitHub</span>
              </button>
            </div>

            {/* Guest button */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleGuestSignIn}
                disabled={authLoading}
                className="text-xs text-stone-400 hover:text-stone-700 underline transition-colors"
              >
                Entrar en modo invitado (temporal)
              </button>
            </div>

          </div>
        )}

        {/* CONTENT FOR LOGGED-IN USERS: PROFILE & STATS */}
        {currentUser && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            
            {/* User Profile Card */}
            <div className="p-5 bg-gradient-to-br from-amber-50/70 via-white to-stone-50 rounded-3xl border border-amber-200/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow bg-white flex items-center justify-center flex-shrink-0">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="text-amber-700" size={32} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-stone-900 font-serif">
                      {currentUser.displayName || (currentUser.isAnonymous ? 'Usuario Invitado' : 'Estudiante de la Palabra')}
                    </h3>
                    {isGitHubAuth && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-900 text-white flex items-center gap-1">
                        <Github size={10} /> GitHub
                      </span>
                    )}
                    {isGoogleAuth && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                        Google
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">{currentUser.email || 'Sesión anónima persistente'}</p>
                  <p className="text-[11px] text-amber-700 font-medium mt-1">
                    Conectado a Cloud Firestore
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => currentUser && loadUserData(currentUser.uid)}
                  disabled={loadingData}
                  title="Sincronizar datos"
                  className="p-2.5 rounded-2xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition-colors shadow-xs"
                >
                  <RefreshCw size={16} className={loadingData ? 'animate-spin text-amber-600' : ''} />
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors shadow-xs"
                >
                  <LogOut size={14} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>

            {/* Inner Subtabs: Avance vs Respaldo */}
            <div className="flex border-b border-stone-200 gap-4">
              <button
                onClick={() => setLoggedInTab('profile')}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-all ${
                  loggedInTab === 'profile'
                    ? 'border-amber-600 text-amber-800'
                    : 'border-transparent text-stone-400 hover:text-stone-700'
                }`}
              >
                Avance Bíblico
              </button>

              <button
                onClick={() => setLoggedInTab('github')}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  loggedInTab === 'github'
                    ? 'border-amber-600 text-amber-800'
                    : 'border-transparent text-stone-400 hover:text-stone-700'
                }`}
              >
                <FolderGit2 size={14} />
                <span>Respaldo & Exportación</span>
              </button>
            </div>

            {/* TAB: PROFILE STATS */}
            {loggedInTab === 'profile' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                    <div className="flex items-center justify-between text-stone-400 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Rango Espiritual</span>
                      <Award size={16} className="text-amber-500" />
                    </div>
                    <div className="text-sm font-bold text-stone-900 font-serif">
                      {userStats?.rank || 'Neófito Teológico'}
                    </div>
                    <div className="text-[10px] text-amber-600 font-medium mt-0.5">
                      {userStats?.points || 0} XP acumulados
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                    <div className="flex items-center justify-between text-stone-400 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Racha de Lectura</span>
                      <Flame size={16} className="text-orange-500" />
                    </div>
                    <div className="text-base font-bold text-stone-900 font-serif">
                      {userStats?.streak || 0} días
                    </div>
                    <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                      {userStats?.completedDays?.length || 0} días registrados
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                    <div className="flex items-center justify-between text-stone-400 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Capítulos Leídos</span>
                      <BookOpen size={16} className="text-blue-500" />
                    </div>
                    <div className="text-base font-bold text-stone-900 font-serif">
                      {progressCount} / 1189
                    </div>
                    <div className="text-[10px] text-blue-600 font-medium mt-0.5">
                      {((progressCount / 1189) * 100).toFixed(1)}% de la Biblia
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                    <div className="flex items-center justify-between text-stone-400 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Notas CRUD</span>
                      <FileText size={16} className="text-purple-500" />
                    </div>
                    <div className="text-base font-bold text-stone-900 font-serif">
                      {notesCount} notas
                    </div>
                    <div className="text-[10px] text-purple-600 font-medium mt-0.5">
                      Almacenadas en la nube
                    </div>
                  </div>
                </div>

                {onOpenNotesCrud && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenNotesCrud();
                    }}
                    className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <FileText size={14} />
                    <span>Ver mis Notas & Bitácora CRUD</span>
                  </button>
                )}
              </div>
            )}

            {/* TAB: GITHUB & BACKUP */}
            {loggedInTab === 'github' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800">Token de GitHub (PAT)</span>
                    <a 
                      href="https://github.com/settings/tokens" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[10px] text-amber-700 hover:underline flex items-center gap-1"
                    >
                      Generar Token <ExternalLink size={10} />
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="password"
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                    <button
                      onClick={handleSaveGithubToken}
                      className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      Guardar
                    </button>
                  </div>
                  {githubMessage && (
                    <p className="text-[11px] text-amber-800 font-medium">{githubMessage}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleSyncToGist}
                    disabled={syncingGist}
                    className="p-3 bg-white border border-stone-200 hover:border-amber-400 rounded-2xl text-left flex flex-col justify-between transition-all"
                  >
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">Sincronizar a Gist</span>
                      <span className="text-[10px] text-stone-500">Respaldo en la nube</span>
                    </div>
                    {syncingGist ? <Loader2 size={14} className="animate-spin mt-2" /> : <RefreshCw size={14} className="text-amber-600 mt-2" />}
                  </button>

                  <button
                    onClick={handleDownloadMarkdown}
                    className="p-3 bg-white border border-stone-200 hover:border-amber-400 rounded-2xl text-left flex flex-col justify-between transition-all"
                  >
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">Descargar Markdown</span>
                      <span className="text-[10px] text-stone-500">Archivo .md para Git</span>
                    </div>
                    <Download size={14} className="text-blue-600 mt-2" />
                  </button>
                </div>

                {gistUrl && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                    <a 
                      href={gistUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs font-bold text-emerald-800 hover:underline flex items-center justify-center gap-1.5"
                    >
                      <span>Ver Respaldo publicado en GitHub Gist</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Cloud Firestore</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
