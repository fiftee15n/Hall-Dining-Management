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
  periodId?: string;
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
    email: 'mp_01.hdm@gmail.com',
    pass: 'Management@@',
    role: 'Management Team' as UserRole,
    periodId: 'period-01',
  },
  {
    email: 'management.hdm@gmail.com',
    pass: 'Management@@',
    role: 'Management Team' as UserRole,
    periodId: 'period-01',
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
    email: 'mp_01.hdm@gmail.com',
    title: 'Student Dining Management Committee',
    department: 'Resident Student Representatives',
    avatarLetter: 'M',
    periodId: 'period-01',
  },
};

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (role: UserRole, customName?: string, periodId?: string) => void;
  loginWithCredentials: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hdm_auth_user';
const TOKEN_STORAGE_KEY = 'hdm_auth_token';

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

  const login = (role: UserRole, customName?: string, periodId?: string) => {
    const basePreset = ROLE_PRESETS[role];
    const authenticatedUser: AuthUser = {
      ...basePreset,
      name: customName?.trim() || basePreset.name,
      periodId: periodId || basePreset.periodId,
    };
    setUser(authenticatedUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
    } catch (err) {
      console.error('Failed to persist auth user', err);
    }
  };

  const loginWithCredentials = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Please enter both email and password' };
    }

    // 1. Try FastAPI Backend if available
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });

      if (response.ok) {
        const data = await response.json();
        const authenticatedUser: AuthUser = {
          id: data.user.id,
          name: data.user.name,
          role: data.user.role,
          email: data.user.email,
          title: data.user.title || '',
          department: data.user.department || '',
          avatarLetter: data.user.avatarLetter || data.user.name.charAt(0).toUpperCase(),
          periodId: data.user.periodId || (data.user.role === 'Management Team' ? 'period-01' : undefined),
        };

        setUser(authenticatedUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
        if (data.access_token) {
          localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
        }
        return { success: true };
      }
    } catch (apiErr) {
      // Backend not running or unreachable -> fallback to local credential verification
    }

    // 2. Local fallback credential matching (including dynamic period credentials)
    let matchedPeriodId: string | undefined = undefined;
    let matchedRole: UserRole | undefined = undefined;
    let matchedName: string | undefined = undefined;

    // Check dynamic period credentials saved in localStorage
    try {
      const savedPeriodsStr = localStorage.getItem('gau_female_hall_residents_v2');
      if (savedPeriodsStr) {
        const parsed = JSON.parse(savedPeriodsStr);
        if (parsed.periods && Array.isArray(parsed.periods)) {
          const foundPeriod = parsed.periods.find((p: any) => {
            const periodEmail = p.managementEmail?.toLowerCase() || '';
            const defaultEmail = `mp_${p.code?.replace(/\D/g, '') || '01'}.hdm@gmail.com`.toLowerCase();
            return periodEmail === cleanEmail || defaultEmail === cleanEmail;
          });

          if (foundPeriod) {
            const storedPass = foundPeriod.managementPassword || 'Management@@';
            if (storedPass === cleanPass) {
              matchedPeriodId = foundPeriod.id;
              matchedRole = 'Management Team';
              matchedName = `${foundPeriod.managedByTeam} (${foundPeriod.name})`;
            }
          }
        }
      }
    } catch (e) {
      // ignore
    }

    // Check static credentials
    if (!matchedRole) {
      const matched = VALID_CREDENTIALS.find(
        (c) => c.email.toLowerCase() === cleanEmail && c.pass === cleanPass
      );
      if (matched) {
        matchedRole = matched.role;
        matchedPeriodId = (matched as any).periodId;
      }
    }

    // Dynamic mp_*.hdm@gmail.com format check with default password
    if (!matchedRole && cleanEmail.startsWith('mp_') && cleanEmail.endsWith('@gmail.com') && cleanPass === 'Management@@') {
      matchedRole = 'Management Team';
      const periodNum = cleanEmail.replace('mp_', '').replace('.hdm@gmail.com', '');
      matchedPeriodId = `period-${periodNum}`;
      matchedName = `Management Team (Period #${periodNum})`;
    }

    if (!matchedRole) {
      return { success: false, error: 'Invalid email or password. Please check your credentials.' };
    }

    const basePreset = ROLE_PRESETS[matchedRole];
    const authenticatedUser: AuthUser = {
      ...basePreset,
      email: cleanEmail,
      name: matchedName || basePreset.name,
      periodId: matchedPeriodId || basePreset.periodId,
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
      localStorage.removeItem(TOKEN_STORAGE_KEY);
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
