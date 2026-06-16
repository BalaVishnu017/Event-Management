import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
} from '../config/firebase';
import type { User } from '../types';

// ─── Context Shape ──────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  signup: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  clearError: () => {},
});

export const useAuth = () => useContext(AuthContext);

// ─── Demo Mode (when Firebase isn't configured) ─────────────

const IS_DEMO = !import.meta.env.VITE_FIREBASE_API_KEY ||
                import.meta.env.VITE_FIREBASE_API_KEY === 'your_firebase_api_key';

const DEMO_USER: User = {
  uid: 'demo-user-001',
  email: 'demo@skycal.app',
  displayName: 'Demo User',
  photoURL: undefined,
};

// ─── Provider ───────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    if (IS_DEMO) {
      // Check localStorage for demo session
      const demoSession = localStorage.getItem('skycal_demo_session');
      if (demoSession) setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL || undefined,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      if (IS_DEMO) {
        // Demo login — accept any credentials
        await new Promise((r) => setTimeout(r, 800));
        localStorage.setItem('skycal_demo_session', 'true');
        setUser({ ...DEMO_USER, email, displayName: email.split('@')[0] });
        return;
      }
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      const msg = err.code === 'auth/invalid-credential'
        ? 'Invalid email or password'
        : err.code === 'auth/user-not-found'
        ? 'No account found with this email'
        : err.message || 'Login failed';
      setError(msg);
      throw err;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setError(null);
    try {
      if (IS_DEMO) {
        await new Promise((r) => setTimeout(r, 800));
        localStorage.setItem('skycal_demo_session', 'true');
        setUser({ ...DEMO_USER, email, displayName: name });
        return;
      }
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      setUser({
        uid: cred.user.uid,
        email: cred.user.email || email,
        displayName: name,
        photoURL: undefined,
      });
    } catch (err: any) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'Email already in use'
        : err.code === 'auth/weak-password'
        ? 'Password should be at least 6 characters'
        : err.message || 'Signup failed';
      setError(msg);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      if (IS_DEMO) {
        await new Promise((r) => setTimeout(r, 600));
        localStorage.setItem('skycal_demo_session', 'true');
        setUser(DEMO_USER);
        return;
      }
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message || 'Google login failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      if (IS_DEMO) {
        localStorage.removeItem('skycal_demo_session');
        setUser(null);
        return;
      }
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, signup, loginWithGoogle, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
};
