'use client';

import React from 'react';
import { useMess } from '@/context/MessContext';
import { formatTaka } from '@/lib/utils';
import {
  PieChart,
  Printer,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function FinancialSummaryPage() {
  const { activePeriod, stats, bookings, guestMeals, feastRegistrations, expenses, receivables } = useMess();

  const totalBookingPaid = bookings
    .filter((b) => b.periodId === activePeriod?.id)
    .reduce((sum, b) => sum + b.paidAmount, 0);

  const totalGuestPaid = guestMeals
    .filter((g) => g.periodId === activePeriod?.id && g.paymentStatus === 'Paid')
    .reduce((sum, g) => sum + g.totalPrice, 0);

  const totalFeastPaid = feastRegistrations
    .filter((f) => f.periodId === activePeriod?.id)
    .reduce((sum, f) => sum + f.paidAmount, 0);

  const totalSettledRefunds = receivables
    .filter((r) => r.periodId === activePeriod?.id && r.status === 'settled')
    .reduce((sum, r) => sum + r.amount, 0);

  const netSurplus = stats.totalCollected - stats.totalExpense - totalSettledRefunds;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Financial Summary & Statement</h1>
          <p className="text-xs text-slate-500">
            Accounting statement of accounts for {activePeriod?.name}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Statement</span>
        </button>
      </div>

      {/* Main Statement Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">Statement of Dining Accounts</h2>
          <p className="text-xs text-slate-500">
            Term: {activePeriod?.startDate} to {activePeriod?.endDate} · Managed by {activePeriod?.managedByTeam}
          </p>
        </div>

        {/* Breakdown Sections */}
        <div className="space-y-4 text-xs">
          {/* 1. Opening Balance */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between font-bold">
            <span className="text-slate-700">1. Opening Balance (Previous Term)</span>
            <span className="text-slate-900 text-sm">{formatTaka(activePeriod?.openingBalance || 0)}</span>
          </div>

          {/* 2. Inflows */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 p-2.5 font-bold text-slate-900 border-b border-slate-200 flex justify-between">
              <span>2. Total Revenue Collections (Inflows)</span>
              <span className="text-emerald-700">+{formatTaka(stats.totalCollected)}</span>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>• Resident Meal Bookings</span>
                <span className="font-semibold text-slate-900">{formatTaka(totalBookingPaid)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>• Guest Meal Tokens</span>
                <span className="font-semibold text-slate-900">{formatTaka(totalGuestPaid)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>• Grand Feast Registrations</span>
                <span className="font-semibold text-slate-900">{formatTaka(totalFeastPaid)}</span>
              </div>
            </div>
          </div>

          {/* 3. Outflows */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 p-2.5 font-bold text-slate-900 border-b border-slate-200 flex justify-between">
              <span>3. Total Operating Expenditures (Outflows)</span>
              <span className="text-rose-700">-{formatTaka(stats.totalExpense + totalSettledRefunds)}</span>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>• Market / Bazar Grocery & Provisions</span>
                <span className="font-semibold text-slate-900">{formatTaka(stats.totalExpense)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>• Student Change Refunds Disbursed</span>
                <span className="font-semibold text-slate-900">{formatTaka(totalSettledRefunds)}</span>
              </div>
            </div>
          </div>

          {/* 4. Final Cash in Hand */}
          <div className="p-3.5 sm:p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                4. Verified Closing Cash in Hand
              </span>
              <p className="text-[10px] sm:text-[11px] text-slate-300 mt-0.5">
                Formula: Opening + Collections - Expenses
              </p>
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-400">
              {formatTaka(stats.currentBalance)}
            </div>
          </div>

          {/* Net Term Surplus */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-950 font-bold">
            <span>Net Operating Period Surplus:</span>
            <span className="text-sm text-emerald-800">{formatTaka(netSurplus)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
