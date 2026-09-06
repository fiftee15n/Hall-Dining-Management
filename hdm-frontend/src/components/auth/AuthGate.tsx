'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { SplashScreen } from './SplashScreen';
import { SignInView } from './SignInView';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  if (!user) {
    return <SignInView />;
  }

  return <>{children}</>;
}
