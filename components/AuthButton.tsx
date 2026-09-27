import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LogIn, LogOut, User as UserIcon, Loader2 } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';

export const AuthButton: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader2 className="animate-spin text-bible-gold" size={20} />;

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden md:block text-right">
          <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">{user.displayName}</p>
          <button onClick={handleLogout} className="text-[8px] font-extra-bold text-bible-accent uppercase tracking-tighter hover:underline">Cerrar Sesión</button>
        </div>
        <div className="w-10 h-10 rounded-full border-2 border-bible-gold/30 p-0.5 overflow-hidden shadow-sm">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full rounded-full object-cover" />
          ) : (
            <UserIcon className="w-full h-full text-stone-400 p-1" />
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleLogin}
      className="flex items-center gap-2 px-5 py-2.5 bg-bible-leather text-white rounded-full text-xs font-bold shadow-md hover:bg-bible-ink transition-all"
    >
      <LogIn size={14} />
      <span>Acceder</span>
    </motion.button>
  );
};
