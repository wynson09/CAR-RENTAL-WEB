'use client';

import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

/**
 * Component to initialize user data loading from Firestore into Zustand store
 * This should be used in layouts or pages where user data is needed
 */
export const UserInitializer = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, session, status } = useAuth();

  // Debug logging to help troubleshoot authentication issues
  useEffect(() => {
    console.log('UserInitializer Debug:', {
      sessionStatus: status,
      sessionUser: session?.user,
      firestoreUser: user,
      isLoading,
      sessionId: session?.user?.id,
      sessionEmail: session?.user?.email,
    });
  }, [status, session, user, isLoading]);

  return <>{children}</>;
};
