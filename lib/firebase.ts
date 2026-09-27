import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  signOut
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId); 
export const auth = getAuth(app);

// Proveedores de autenticación
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
githubProvider.addScope('gist');
githubProvider.addScope('repo');

// Funciones de Autenticación de alto nivel
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const loginWithGitHub = () => signInWithPopup(auth, githubProvider);
export const loginWithEmail = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
export const registerWithEmail = async (email: string, pass: string, displayName?: string) => {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && cred.user) {
    await updateProfile(cred.user, { displayName });
  }
  return cred;
};
export const loginAsGuest = () => signInAnonymously(auth);
export const logoutUser = () => signOut(auth);

async function testConnection() {
  try {
    // Attempting to read a test doc to trigger a server-side check as per skill guidelines
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error instanceof Error && (error.message.includes('the client is offline') || (error as any).code === 'unavailable')) {
      console.warn("Firestore operates in offline cache mode until connection is re-established.");
    }
  }
}
testConnection();
