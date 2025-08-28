'use client';
import { useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useUserStore } from '@/store';
import { fetchUserData } from '@/lib/user-actions';

export const useAuth = () => {
  const { data: session, status } = useSession();
  const { user, setUser, setLoading, clearUser } = useUserStore();
  const lastFetchedUserId = useRef<string | null>(null);

  // Memoize store functions to prevent unnecessary re-renders
  const stableFunctions = useRef({ setUser, setLoading, clearUser });
  stableFunctions.current = { setUser, setLoading, clearUser };

  const loadUserData = useCallback(
    async (userId: string) => {
      // Prevent duplicate calls for the same user
      if (lastFetchedUserId.current === userId) {
        return;
      }

      // Check if we already have data for this user in the store
      if (user && user.uid === userId) {
        console.log('✅ User data already loaded from store:', user.email);
        lastFetchedUserId.current = userId;
        return;
      }

      console.log('🔄 Fetching user data from Firestore for:', userId);
      lastFetchedUserId.current = userId;
      stableFunctions.current.setLoading(true);

      try {
        const userData = await fetchUserData(userId);
        if (userData) {
          console.log('✅ User data loaded from Firestore:', userData.email);
          stableFunctions.current.setUser(userData);
        } else {
          console.warn('❌ User data not found in Firestore for UID:', userId);
          console.warn('Email:', session?.user?.email);
          stableFunctions.current.clearUser();
          lastFetchedUserId.current = null;
        }
      } catch (error) {
        console.error('❌ Error loading user data:', error);
        stableFunctions.current.clearUser();
        lastFetchedUserId.current = null;
      } finally {
        stableFunctions.current.setLoading(false);
      }
    },
    [user, session?.user?.email]
  );

  useEffect(() => {
    if (status === 'loading') {
      stableFunctions.current.setLoading(true);
      return;
    }

    if (status === 'unauthenticated') {
      console.log('🚪 User unauthenticated, clearing user data');
      stableFunctions.current.clearUser();
      lastFetchedUserId.current = null;
      return;
    }

    if (status === 'authenticated' && session?.user?.id) {
      // Only load data if we don't have it or it's for a different user
      const sessionUserId = session.user.id;
      const needsRefresh = !user || user.uid !== sessionUserId;

      if (needsRefresh) {
        console.log('🔄 User authentication detected, checking data...');
        loadUserData(sessionUserId);
      } else {
        console.log('✅ User data already available, skipping fetch');
        stableFunctions.current.setLoading(false);
      }
    }
  }, [session?.user?.id, status, loadUserData, user?.uid]);

  return {
    user,
    session,
    status,
    isLoading: status === 'loading' || useUserStore.getState().isLoading,
    isAuthenticated: status === 'authenticated' && !!user,
  };
};
