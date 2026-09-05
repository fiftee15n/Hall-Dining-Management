'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMess } from '@/context/MessContext';
import {
  Utensils,
  Sun,
  Moon,
  Users,
  Wallet,
  AlertTriangle,
  ShoppingCart,
  DollarSign,
  UserPlus,
  Plus,
  Receipt,
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { formatTaka } from '@/lib/utils';
import { QuickActionsModal } from '@/components/modals/QuickActionsModal';
import { AddExpenseModal } from '@/components/modals/AddExpenseModal';
import { RecordPaymentModal } from '@/components/modals/RecordPaymentModal';
import { AddGuestMealModal } from '@/components/modals/AddGuestMealModal';

export default function DashboardPage() {
  const { stats, activePeriod, transactions, bookings } = useMess();

  const [showQuickModal, setShowQuickModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            {activePeriod?.name || 'Management Period #05'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Managed By: <strong className="text-slate-800">{activePeriod?.managedByTeam}</strong> ({activePeriod?.startDate} to {activePeriod?.endDate}) · Lunch: {formatTaka(activePeriod?.lunchPrice)} · Dinner: {formatTaka(activePeriod?.dinnerPrice)}
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuickModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Quick Action</span>
          </button>
          <Link
            href="/meals/booking"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition"
          >
            New Booking
          </Link>
          <Link
            href="/meals/attendance"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition"
          >
            Attendance
          </Link>
        </div>
      </div>

      {/* Main KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Meals */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Today&apos;s Meals</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.todayTotalMeals}</h3>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Lunch: {stats.todayLunchMeals} · Dinner: {stats.todayDinnerMeals}</span>
            <Link href="/meals/today" className="font-bold text-slate-800 hover:underline">
              Board →
            </Link>
          </div>
        </div>

        {/* Total Collected */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Collected</span>
            <h3 className="text-2xl font-black text-emerald-800 mt-1">{formatTaka(stats.totalCollected)}</h3>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{bookings.length} Bookings</span>
            <Link href="/finance/payments" className="font-bold text-emerald-800 hover:underline">
              Receipts →
            </Link>
          </div>
        </div>

        {/* Total Market Expenses */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Bazar Expenses</span>
            <h3 className="text-2xl font-black text-rose-800 mt-1">{formatTaka(stats.totalExpense)}</h3>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Today: {formatTaka(stats.todayExpense)}</span>
            <Link href="/finance/expenses" className="font-bold text-rose-800 hover:underline">
              Expenses →
            </Link>
          </div>
        </div>

        {/* Cash in Hand */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Cash in Hand</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{formatTaka(stats.currentBalance)}</h3>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Opening: {formatTaka(activePeriod?.openingBalance || 0)}</span>
            <Link href="/finance/ledger" className="font-bold text-slate-800 hover:underline">
              Ledger →
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Metrics & Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/students/dues"
          className="p-3 bg-white rounded-xl border border-slate-200 hover:border-amber-400 transition shadow-2xs block"
        >
          <span className="text-[11px] font-medium text-slate-500">Student Dues (Owed to Mess)</span>
          <div className="text-base font-bold text-amber-900 mt-0.5">{formatTaka(stats.totalDue)}</div>
        </Link>

        <Link
          href="/students/dues"
          className="p-3 bg-white rounded-xl border border-slate-200 hover:border-teal-400 transition shadow-2xs block"
        >
          <span className="text-[11px] font-medium text-slate-500">Mess Payable (Owed to Students)</span>
          <div className="text-base font-bold text-teal-800 mt-0.5">{formatTaka(stats.studentReceivablesTotal)}</div>
        </Link>

        <Link
          href="/meals/guests"
          className="p-3 bg-white rounded-xl border border-slate-200 hover:border-purple-400 transition shadow-2xs block"
        >
          <span className="text-[11px] font-medium text-slate-500">Guest Meals Today</span>
          <div className="text-base font-bold text-purple-900 mt-0.5">{stats.todayGuestMeals} meals</div>
        </Link>

        <Link
          href="/students"
          className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-400 transition shadow-2xs block"
        >
          <span className="text-[11px] font-medium text-slate-500">Registered Residents</span>
          <div className="text-base font-bold text-slate-900 mt-0.5">{stats.registeredStudentsCount} students</div>
        </Link>
      </div>

      {/* Recent Cashbook Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recent Transactions</h3>
            <p className="text-xs text-slate-500">Latest collections and bazar expenditures</p>
          </div>
          <Link href="/finance/ledger" className="text-xs font-bold text-slate-800 hover:underline">
            View All Ledger Entries →
          </Link>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Student / Particulars</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-2.5 px-3 text-slate-500 font-medium">{t.date}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-700">{t.type}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">
                    {t.studentName || t.note}
                    {t.room && <span className="text-slate-500 text-[11px] ml-1">({t.block}-{t.room})</span>}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{t.paymentMethod}</td>
                  <td
                    className={`py-2.5 px-3 text-right font-black ${
                      t.flow === 'inflow' ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {t.flow === 'inflow' ? '+' : '-'}{formatTaka(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <QuickActionsModal isOpen={showQuickModal} onClose={() => setShowQuickModal(false)} />
      <AddExpenseModal isOpen={showExpenseModal} onClose={() => setShowExpenseModal(false)} />
      <RecordPaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />
      <AddGuestMealModal isOpen={showGuestModal} onClose={() => setShowGuestModal(false)} />
    </div>
  );
}
