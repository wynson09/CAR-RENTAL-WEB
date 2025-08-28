'use client';

import { useAuth } from '@/hooks/use-auth';
import { useEffect, useRef } from 'react';

/**
 * Component to initialize user data loading from Firestore into Zustand store
 * This should be used in layouts or pages where user data is needed
 */
export const UserInitializer = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, session, status } = useAuth();
  const lastLoggedState = useRef<string>('');

  // Reduced debug logging - only log when auth state actually changes
  useEffect(() => {
    const currentState = `${status}-${session?.user?.id}-${user?.uid}-${isLoading}`;

    // Only log when the meaningful state changes
    if (currentState !== lastLoggedState.current) {
      lastLoggedState.current = currentState;

      // Only log important state changes
      if (status === 'authenticated' && user) {
        console.log('👤 User authenticated and data loaded:', {
          email: user.email,
          role: user.role,
          uid: user.uid,
        });
      } else if (status === 'authenticated' && !user && !isLoading) {
        console.warn('⚠️ User authenticated but no Firestore data:', {
          sessionId: session?.user?.id,
          sessionEmail: session?.user?.email,
        });
      } else if (status === 'unauthenticated') {
        console.log('🚪 User unauthenticated');
      }
    }
  }, [status, session?.user?.id, user?.uid, user?.email, user?.role, isLoading]);

  return <>{children}</>;
};
