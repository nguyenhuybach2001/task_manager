import { useState, useEffect, createContext, useContext } from 'react';
import { isFirebaseConfigured } from '../firebase/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    // Dynamic import to avoid crash when Firebase isn't configured
    import('../firebase/auth').then(({ onAuthChange }) => {
      const unsubscribe = onAuthChange((user) => {
        setUser(user);
        setLoading(false);
      });
      return unsubscribe;
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isFirebaseConfigured }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
