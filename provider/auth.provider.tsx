'use client';

import { SessionProvider } from 'next-auth/react';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import UserProvider from './user-provider';

// Create a Firebase Auth context
export const FirebaseAuthContext = createContext<{
  user: User | null;
  loading: boolean;
}>({
  user: null,
  loading: true,
});

// Custom hook to use the Firebase auth context
export const useFirebaseAuth = () => useContext(FirebaseAuthContext);

const FirebaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <FirebaseAuthContext.Provider value={{ user, loading }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider basePath="/api/auth">
      <FirebaseAuthProvider>
        <UserProvider>{children}</UserProvider>
      </FirebaseAuthProvider>
    </SessionProvider>
  );
};

export default AuthProvider;
