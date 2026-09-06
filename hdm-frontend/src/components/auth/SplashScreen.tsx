'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export function SplashScreen() {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Connecting to Portal...');

  useEffect(() => {
    const step1 = setTimeout(() => {
      setProgress(45);
      setStatusText('Loading dining ledger and student accounts...');
    }, 300);

    const step2 = setTimeout(() => {
      setProgress(80);
      setStatusText('Synchronizing active period rates...');
    }, 700);

    const step3 = setTimeout(() => {
      setProgress(100);
      setStatusText('Ready');
    }, 1100);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-white text-slate-900 flex flex-col items-center justify-between p-8 select-none animate-in fade-in duration-300">
      {/* Top minimal bar */}
      <div className="text-xs font-medium text-slate-400 text-center">
        New Female Hall
      </div>

      {/* Center Minimal Branding & Progress */}
      <div className="max-w-md w-full text-center space-y-6 my-auto px-4">
        {/* Official GAU Logo */}
        <div className="mx-auto w-24 h-24 rounded-2xl bg-white border border-slate-200/90 shadow-sm p-2 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Gazipur Agricultural University"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Title in single line */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
            Gazipur Agriculture University
          </h1>
          <p className="text-xs text-slate-500 font-medium">New Female Hall Dining System</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="w-full bg-slate-100 border border-slate-200/80 h-2 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-slate-900 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="truncate">{statusText}</span>
            <span className="font-mono text-slate-600 ml-2">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Secure University Portal</span>
      </div>
    </div>
  );
}
