'use client';
import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useUserStore } from '@/store';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { convertFirestoreTimestamps } from '@/lib/user-utils';

export const useAuth = () => {
  const { data: session, status } = useSession();
  const { setUser, setLoading, clearUser } = useUserStore();

  // Keep stable refs for store setters so snapshot callback never changes
  const stable = useRef({ setUser, setLoading, clearUser });
  stable.current = { setUser, setLoading, clearUser };

  // Track one active listener per uid and the latest updatedAt we've applied
  const unsubscribeRef = useRef<null | (() => void)>(null);
  const subscribedUserIdRef = useRef<string | null>(null);
  const lastUpdatedAtRef = useRef<number>(0);

  const startUserListener = (uid: string) => {
    // If already subscribed for this uid, do nothing
    if (subscribedUserIdRef.current === uid && unsubscribeRef.current) {
      stable.current.setLoading(false);
      return;
    }

    // Tear down any previous listener
    if (unsubscribeRef.current) {
      try {
        unsubscribeRef.current();
      } catch {}
      unsubscribeRef.current = null;
    }

    subscribedUserIdRef.current = uid;
    // Initialize lastUpdatedAt from current store state (if any)
    try {
      const current = (useUserStore.getState().user as any)?.updatedAt;
      lastUpdatedAtRef.current = current?.getTime?.() || 0;
    } catch {
      lastUpdatedAtRef.current = 0;
    }

    stable.current.setLoading(true);

    const userRef = doc(db, 'users', uid);

    unsubscribeRef.current = onSnapshot(
      userRef,
      (snap) => {
        try {
          if (snap.exists()) {
            const data = convertFirestoreTimestamps(snap.data());
            const incomingUpdatedAt = (data as any)?.updatedAt?.getTime?.() || 0;

            // Only update Zustand when server data is newer than what we applied
            if (incomingUpdatedAt >= lastUpdatedAtRef.current) {
              lastUpdatedAtRef.current = incomingUpdatedAt;
              stable.current.setUser(data as any);
            }
          } else {
            // Document missing — clear local user
            lastUpdatedAtRef.current = 0;
            stable.current.clearUser();
          }
        } finally {
          stable.current.setLoading(false);
        }
      },
      async (error) => {
        console.error('User snapshot error:', error);
        // Fallback to one-time fetch so UI isn't blocked
        try {
          const once = await getDoc(userRef);
          if (once.exists()) {
            const data = convertFirestoreTimestamps(once.data());
            lastUpdatedAtRef.current = (data as any)?.updatedAt?.getTime?.() || 0;
            stable.current.setUser(data as any);
          } else {
            lastUpdatedAtRef.current = 0;
            stable.current.clearUser();
          }
        } catch {
          lastUpdatedAtRef.current = 0;
          stable.current.clearUser();
        } finally {
          stable.current.setLoading(false);
        }
      }
    );
  };

  useEffect(() => {
    if (status === 'loading') {
      stable.current.setLoading(true);
      return;
    }

    if (status === 'unauthenticated') {
      // Cleanup listener and clear state
      if (unsubscribeRef.current) {
        try {
          unsubscribeRef.current();
        } catch {}
        unsubscribeRef.current = null;
      }
      subscribedUserIdRef.current = null;
      lastUpdatedAtRef.current = 0;
      stable.current.clearUser();
      return;
    }

    if (status === 'authenticated' && session?.user?.id) {
      startUserListener(session.user.id);
    }

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        try {
          unsubscribeRef.current();
        } catch {}
        unsubscribeRef.current = null;
      }
      subscribedUserIdRef.current = null;
      lastUpdatedAtRef.current = 0;
    };
  }, [status, session?.user?.id]);

  return {
    user: useUserStore.getState().user,
    session,
    status,
    isLoading: status === 'loading' || useUserStore.getState().isLoading,
    isAuthenticated: status === 'authenticated' && !!useUserStore.getState().user,
  };
};
