'use client';

import React, { useState } from 'react';
import { useMess } from '@/context/MessContext';
import {
  Calendar,
  Plus,
  RotateCcw,
  Building,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuickActionsModal } from '@/components/modals/QuickActionsModal';

export function Header() {
  const { settings, activePeriod, periods, switchPeriod, resetToDefaultData } = useMess();
  const [isQuickOpen, setIsQuickOpen] = useState(false);
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);

  const today = new Date();
  const formattedToday = today.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <>
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
        {/* Hall & Period Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-700" />
            <div>
              <h2 className="text-xs font-bold text-slate-900 leading-tight">
                {settings.hallName}
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">{settings.universityName}</p>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden md:block" />

          {/* Period Selector */}
          <div className="relative">
            <button
              onClick={() => setShowPeriodMenu(!showPeriodMenu)}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 hover:bg-slate-200 transition"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{activePeriod?.name || 'Period #05'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showPeriodMenu && (
              <div className="absolute left-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                      'w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 transition',
                      p.id === activePeriod?.id ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600'
                    )}
                  >
                    <span>{p.name}</span>
                    {p.status === 'active' && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">
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
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formattedToday}</span>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={() => setIsQuickOpen(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Quick Action</span>
          </button>

          {/* Admin Badge */}
          <div className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>Admin</span>
          </div>

          {/* Reset Demo Data */}
          <button
            onClick={() => {
              if (confirm('Reset sample records to default?')) {
                resetToDefaultData();
              }
            }}
            title="Reset default data"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <QuickActionsModal isOpen={isQuickOpen} onClose={() => setIsQuickOpen(false)} />
    </>
  );
}
