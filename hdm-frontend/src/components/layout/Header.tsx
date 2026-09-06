'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMess } from '@/context/MessContext';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar,
  Plus,
  RotateCcw,
  ChevronDown,
  ShieldCheck,
  Shield,
  Users2,
  LogOut,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuickActionsModal } from '@/components/modals/QuickActionsModal';

export function Header() {
  const { activePeriod, periods, switchPeriod, resetToDefaultData } = useMess();
  const { user, logout } = useAuth();
  const [isQuickOpen, setIsQuickOpen] = useState(false);
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);

  const today = new Date();
  const formattedToday = today.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const getRoleBadge = () => {
    if (!user) return null;
    if (user.role === 'Authority') {
      return (
        <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 shadow-2xs">
          <Shield className="w-4 h-4 text-purple-700" />
          <span>Authority</span>
        </div>
      );
    }
    if (user.role === 'Management Team') {
      return (
        <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 shadow-2xs">
          <Users2 className="w-4 h-4 text-teal-700" />
          <span>Management Team</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
        <ShieldCheck className="w-4 h-4 text-slate-700" />
        <span>Admin</span>
      </div>
    );
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        {/* Active Period Selector */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowPeriodMenu(!showPeriodMenu)}
              className="flex items-center gap-2.5 text-sm font-bold px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/90 text-slate-900 transition shadow-2xs border border-slate-200/90"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{activePeriod?.name || 'Period #05'}</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {showPeriodMenu && (
              <div className="absolute left-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Period
                </div>
                {periods.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      switchPeriod(p.id);
                      setShowPeriodMenu(false);
                    }}
                    className={cn(
                      'w-full text-left px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between hover:bg-slate-50 transition',
                      p.id === activePeriod?.id ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600'
                    )}
                  >
                    <span>{p.name}</span>
                    {p.status === 'active' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        Active
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Action Section */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{formattedToday}</span>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={() => setIsQuickOpen(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Quick Action</span>
          </button>

          {/* Settings Button */}
          {user?.role !== 'Management Team' && (
            <Link
              href="/management/settings"
              title="Hall Dining Settings"
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 shadow-2xs transition"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span className="hidden lg:inline">Settings</span>
            </Link>
          )}

          {/* Active Role Badge */}
          {getRoleBadge()}

          {/* Sign Out Button */}
          <button
            onClick={() => {
              if (confirm('Are you sure you want to sign out?')) {
                logout();
              }
            }}
            title="Sign Out to Role Selection"
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 hover:border-rose-200 transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Sign Out</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={() => {
              if (confirm('Reset sample records to default?')) {
                resetToDefaultData();
              }
            }}
            title="Reset default data"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      <QuickActionsModal isOpen={isQuickOpen} onClose={() => setIsQuickOpen(false)} />
    </>
  );
}
