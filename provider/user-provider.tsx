'use client';
import { useAuth } from '@/hooks/use-auth';
import { ReactNode } from 'react';

interface UserProviderProps {
  children: ReactNode;
}

export default function UserProvider({ children }: UserProviderProps) {
  // This will automatically handle user state management
  useAuth();

  return <>{children}</>;
}
