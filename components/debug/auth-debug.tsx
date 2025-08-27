'use client';

import { useAuth } from '@/hooks/use-auth';
import { useUserStore } from '@/store';
import { useState } from 'react';

/**
 * Debug component to inspect authentication state and Zustand store
 * Only shows in development environment
 */
export const AuthDebug = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, session, status, isLoading, isAuthenticated } = useAuth();
  const storeState = useUserStore.getState();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium shadow-lg"
      >
        🐛 Auth Debug
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 w-96 max-h-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-auto">
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">Auth State Debug</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <strong>NextAuth Status:</strong>
                <span
                  className={`ml-2 px-2 py-1 rounded ${
                    status === 'authenticated'
                      ? 'bg-green-100 text-green-800'
                      : status === 'loading'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {status}
                </span>
              </div>

              <div>
                <strong>Is Authenticated:</strong>
                <span className={`ml-2 ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                  {isAuthenticated ? '✅ Yes' : '❌ No'}
                </span>
              </div>

              <div>
                <strong>Is Loading:</strong>
                <span className={`ml-2 ${isLoading ? 'text-yellow-600' : 'text-green-600'}`}>
                  {isLoading ? '⏳ Yes' : '✅ No'}
                </span>
              </div>

              <div>
                <strong>Session User ID:</strong>
                <code className="ml-2 bg-gray-100 dark:bg-gray-700 px-1 rounded">
                  {session?.user?.id || 'null'}
                </code>
              </div>

              <div>
                <strong>Session Email:</strong>
                <code className="ml-2 bg-gray-100 dark:bg-gray-700 px-1 rounded">
                  {session?.user?.email || 'null'}
                </code>
              </div>

              <div>
                <strong>Zustand User UID:</strong>
                <code className="ml-2 bg-gray-100 dark:bg-gray-700 px-1 rounded">
                  {user?.uid || 'null'}
                </code>
              </div>

              <div>
                <strong>Zustand User Email:</strong>
                <code className="ml-2 bg-gray-100 dark:bg-gray-700 px-1 rounded">
                  {user?.email || 'null'}
                </code>
              </div>

              <div>
                <strong>User Role:</strong>
                <span
                  className={`ml-2 px-2 py-1 rounded text-xs ${
                    user?.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : user?.role === 'moderator'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {user?.role || 'none'}
                </span>
              </div>

              <div>
                <strong>Data Match:</strong>
                <span
                  className={`ml-2 ${
                    session?.user?.id === user?.uid ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {session?.user?.id === user?.uid ? '✅ Match' : '❌ Mismatch'}
                </span>
              </div>

              <div>
                <strong>LocalStorage Key:</strong>
                <code className="ml-2 bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">
                  user-store
                </code>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => {
                    console.log('🔍 Full Auth Debug Info:', {
                      nextAuthSession: session,
                      nextAuthStatus: status,
                      zustandUser: user,
                      zustandStoreState: storeState,
                      localStorage: localStorage.getItem('user-store'),
                      isAuthenticated,
                      isLoading,
                    });
                  }}
                  className="text-blue-600 hover:text-blue-800 text-xs underline"
                >
                  Log Full State to Console
                </button>
              </div>

              <div>
                <button
                  onClick={() => {
                    localStorage.removeItem('user-store');
                    window.location.reload();
                  }}
                  className="text-red-600 hover:text-red-800 text-xs underline"
                >
                  Clear Store & Reload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthDebug;
