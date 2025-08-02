"use client";
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/hooks/use-auth';
import { useUserStore } from '@/store';

export default function TestFirebaseConnection() {
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const { user, session, status, isLoading, isAuthenticated } = useAuth();
  const { clearUser } = useUserStore();

  useEffect(() => {
    // Test Firebase Auth connection
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
        });
      } else {
        setFirebaseUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      setConnectionStatus('✅ NextAuth + Firebase + Zustand Connected');
    } else if (status === 'authenticated' && !user) {
      setConnectionStatus('✅ NextAuth Connected, ⚠️ Loading user data...');
    } else if (firebaseUser && !isAuthenticated) {
      setConnectionStatus('✅ Firebase Auth Only, ⚠️ NextAuth not connected');
    } else if (status === 'unauthenticated') {
      setConnectionStatus('🔐 Not authenticated');
    } else {
      setConnectionStatus('⏳ Loading...');
    }
  }, [isAuthenticated, user, status, firebaseUser]);

  return (
    <div className="p-6 bg-card rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Firebase Connection Test</h3>
      
      <div className="space-y-4 mb-4">
        <div>
          <p><strong>Status:</strong> {connectionStatus}</p>
          <p><strong>NextAuth Status:</strong> {status}</p>
          <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
          <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        </div>
        
        {session && (
          <div>
            <p><strong>NextAuth Session:</strong></p>
            <pre className="text-xs bg-muted p-2 rounded">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        )}

        {firebaseUser && (
          <div>
            <p><strong>Firebase User:</strong></p>
            <pre className="text-xs bg-muted p-2 rounded">
              {JSON.stringify(firebaseUser, null, 2)}
            </pre>
          </div>
        )}
        
        {user && (
          <div>
            <p><strong>Zustand User Store:</strong></p>
            <div className="text-sm space-y-1 mb-2">
              <p><strong>First Name:</strong> {user.firstName || 'N/A'}</p>
              <p><strong>Last Name:</strong> {user.lastName || 'N/A'}</p>
              <p><strong>Full Name:</strong> {user.name || 'N/A'}</p>
              <p><strong>Email:</strong> {user.email || 'N/A'}</p>
              <p><strong>Role:</strong> {user.role || 'N/A'}</p>
              <p><strong>Provider:</strong> {user.provider || 'N/A'}</p>
              <p><strong>Verified:</strong> {user.isVerified ? 'Yes' : 'No'}</p>
              <p><strong>KYC Status:</strong> {user.kycRecord?.status || 'N/A'}</p>
            </div>
            <details>
              <summary className="cursor-pointer text-sm font-medium">Show Raw User Data</summary>
              <pre className="text-xs bg-muted p-2 rounded mt-2">
                {JSON.stringify(user, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        {isAuthenticated && (
          <Button 
            onClick={() => {
              signOut();
              clearUser();
            }} 
            variant="outline" 
            size="sm"
          >
            Sign Out
          </Button>
        )}
        {user && (
          <Button 
            onClick={() => clearUser()} 
            variant="destructive" 
            size="sm"
          >
            Clear Store
          </Button>
        )}
      </div>
    </div>
  );
}