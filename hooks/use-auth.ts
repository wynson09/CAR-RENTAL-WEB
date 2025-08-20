'use client';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useUserStore } from '@/store';
import { fetchUserData } from '@/lib/user-actions';

export const useAuth = () => {
  const { data: session, status } = useSession();
  const { user, setUser, setLoading, clearUser } = useUserStore();

  useEffect(() => {
    const loadUserData = async () => {
      if (status === 'loading') {
        setLoading(true);
        return;
      }

      if (status === 'unauthenticated') {
        clearUser();
        return;
      }

      if (status === 'authenticated' && session?.user?.email) {
        setLoading(true);
        try {
          const userData = await fetchUserData(session.user.email);
          if (userData) {
            setUser(userData);
          } else {
            console.warn('User data not found in Firestore for:', session.user.email);
            clearUser();
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          clearUser();
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserData();
  }, [session, status, setUser, setLoading, clearUser]);

  return {
    user,
    session,
    status,
    isLoading: status === 'loading' || useUserStore.getState().isLoading,
    isAuthenticated: status === 'authenticated' && !!user,
  };
};
