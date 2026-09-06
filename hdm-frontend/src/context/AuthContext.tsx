'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'Authority' | 'Admin' | 'Management Team';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  title: string;
  department?: string;
  avatarLetter: string;
}

export const VALID_CREDENTIALS = [
  {
    email: 'admin.hdm@gmail.com',
    pass: 'Tamal12345@@',
    role: 'Admin' as UserRole,
  },
  {
    email: 'authority.hdm@gmail.com',
    pass: 'Authority@@',
    role: 'Authority' as UserRole,
  },
  {
    email: 'management.hdm@gmail.com',
    pass: 'Management@@',
    role: 'Management Team' as UserRole,
  },
];

export const ROLE_PRESETS: Record<UserRole, AuthUser> = {
  Authority: {
    id: 'auth-provost-01',
    name: 'Prof. Dr. Farhana Sultana',
    role: 'Authority',
    email: 'authority.hdm@gmail.com',
    title: 'Hall Provost & Advisory Authority',
    department: 'Hall Administration Office',
    avatarLetter: 'P',
  },
  Admin: {
    id: 'admin-super-01',
    name: 'Jahangir Alam Tamal',
    role: 'Admin',
    email: 'admin.hdm@gmail.com',
    title: 'Chief Dining Supervisor & System Admin',
    department: 'Dining & Kitchen Operations',
    avatarLetter: 'A',
  },
  'Management Team': {
    id: 'mgmt-comm-50',
    name: '50th Batch Student Committee',
    role: 'Management Team',
    email: 'management.hdm@gmail.com',
    title: 'Student Dining Management Committee',
    department: 'Resident Student Representatives',
    avatarLetter: 'M',
  },
};

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (role: UserRole, customName?: string) => void;
  loginWithCredentials: (email: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hdm_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Initial loading splash screen delay
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Failed to parse stored auth user', err);
      } finally {
        setIsLoading(false);
      }
    }, 1400);

    return () => clearTimeout(timer);
  }, []);

  const login = (role: UserRole, customName?: string) => {
    const basePreset = ROLE_PRESETS[role];
    const authenticatedUser: AuthUser = {
      ...basePreset,
      name: customName?.trim() || basePreset.name,
    };
    setUser(authenticatedUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
    } catch (err) {
      console.error('Failed to persist auth user', err);
    }
  };

  const loginWithCredentials = (email: string, pass: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Please enter both email and password' };
    }

    const matched = VALID_CREDENTIALS.find(
      (c) => c.email.toLowerCase() === cleanEmail && c.pass === cleanPass
    );

    if (!matched) {
      return { success: false, error: 'Invalid email or password. Please check your credentials.' };
    }

    const basePreset = ROLE_PRESETS[matched.role];
    const authenticatedUser: AuthUser = {
      ...basePreset,
      email: matched.email,
    };

    setUser(authenticatedUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
    } catch (err) {
      console.error('Failed to persist auth user', err);
    }

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear auth user', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithCredentials, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
