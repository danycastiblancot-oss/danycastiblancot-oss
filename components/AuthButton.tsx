import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LogIn, User as UserIcon, Loader2, LogOut } from 'lucide-react';
import { auth, logoutUser } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface AuthButtonProps {
  onOpenAccountModal?: () => void;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ onOpenAccountModal }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <Loader2 className="animate-spin text-amber-600" size={18} />;

  if (user) {
    return (
      <div className="flex items-center gap-1.5">
        <button 
          onClick={onOpenAccountModal}
          className="flex items-center gap-2 p-1 pl-2.5 sm:pl-3 bg-white hover:bg-stone-50 border border-stone-200 rounded-full shadow-sm transition-all group"
          title="Ver Perfil y Avance"
        >
          <div className="hidden sm:block text-right leading-none">
            <p className="text-[11px] font-bold text-stone-800 truncate max-w-[120px]">
              {user.displayName || (user.isAnonymous ? 'Invitado' : 'Mi Perfil')}
            </p>
            <span className="text-[9px] font-semibold text-amber-700 uppercase tracking-wider flex items-center justify-end gap-1 mt-0.5">
              Ver Perfil
            </span>
          </div>
          <div className="w-8 h-8 rounded-full border border-amber-500/40 p-0.5 overflow-hidden shadow-sm bg-amber-50 flex items-center justify-center group-hover:scale-105 transition-transform">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full rounded-full object-cover" />
            ) : (
              <UserIcon className="w-4 h-4 text-amber-800" />
            )}
          </div>
        </button>

        <button
          onClick={async () => {
            await logoutUser();
          }}
          className="p-2 rounded-full text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Cerrar Sesión"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onOpenAccountModal}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-stone-900 to-stone-850 text-white rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all"
    >
      <LogIn size={13} className="text-amber-400" />
      <span>Iniciar Sesión / Registro</span>
    </motion.button>
  );
};
