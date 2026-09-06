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
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuickActionsModal } from '@/components/modals/QuickActionsModal';

export function Header() {
  const { activePeriod, periods, switchPeriod, resetToDefaultData, toggleMobileNav } = useMess();
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
        <div className="flex items-center gap-1 sm:gap-1.5 text-xs font-bold text-purple-900 bg-purple-100 px-2 sm:px-3 py-1.5 rounded-lg border border-purple-200 shadow-2xs">
          <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-700 flex-shrink-0" />
          <span className="hidden xs:inline">Authority</span>
        </div>
      );
    }
    if (user.role === 'Management Team') {
      return (
        <div className="flex items-center gap-1 sm:gap-1.5 text-xs font-bold text-teal-900 bg-teal-100 px-2 sm:px-3 py-1.5 rounded-lg border border-teal-200 shadow-2xs">
          <Users2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-700 flex-shrink-0" />
          <span className="hidden xs:inline">Management</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 sm:gap-1.5 text-xs font-bold text-slate-800 bg-slate-100 px-2 sm:px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
        <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 flex-shrink-0" />
        <span className="hidden xs:inline">Admin</span>
      </div>
    );
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        {/* Left: Mobile Menu Toggle & Period Selector */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          {/* Hamburger Drawer Toggle on Mobile */}
          <button
            onClick={toggleMobileNav}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition focus:outline-none"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Active Period Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPeriodMenu(!showPeriodMenu)}
              className="flex items-center gap-1.5 sm:gap-2.5 text-xs sm:text-sm font-bold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200/90 text-slate-900 transition shadow-2xs border border-slate-200/90 max-w-[150px] sm:max-w-none"
            >
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <span className="truncate">{activePeriod?.name || 'Period #05'}</span>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
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
                    <span className="truncate">{p.name}</span>
                    {p.status === 'active' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold flex-shrink-0">
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
        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{formattedToday}</span>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={() => setIsQuickOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">+ Quick Action</span>
            <span className="sm:hidden">Action</span>
          </button>

          {/* Settings Button */}
          {user?.role !== 'Management Team' && (
            <Link
              href="/management/settings"
              title="Hall Dining Settings"
              className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 shadow-2xs transition"
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
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 hover:border-rose-200 transition"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
            className="hidden sm:block p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      <QuickActionsModal isOpen={isQuickOpen} onClose={() => setIsQuickOpen(false)} />
    </>
  );
}
