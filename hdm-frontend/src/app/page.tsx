'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useMess } from '@/context/MessContext';
import { useAuth } from '@/context/AuthContext';
import { Student } from '@/types';
import {
  Utensils,
  Sun,
  Moon,
  Users,
  Wallet,
  ShoppingCart,
  DollarSign,
  UserPlus,
  Plus,
  CalendarCheck,
  UserCheck,
  CreditCard,
  Building,
  Clock,
  ArrowRight,
  Shield,
  Settings,
  ChevronRight,
  CheckCircle2,
  Layers,
  Phone,
  BookOpen,
  Search,
  Pencil,
  Sparkles,
} from 'lucide-react';
import { formatTaka } from '@/lib/utils';
import { QuickActionsModal } from '@/components/modals/QuickActionsModal';
import { AddExpenseModal } from '@/components/modals/AddExpenseModal';
import { RecordPaymentModal } from '@/components/modals/RecordPaymentModal';
import { AddGuestMealModal } from '@/components/modals/AddGuestMealModal';
import { EditStudentModal } from '@/components/modals/EditStudentModal';

export default function DashboardPage() {
  const { stats, activePeriod, periods, students, settings, transactions, bookings, attendance, switchPeriod } = useMess();
  const { user } = useAuth();

  const [showQuickModal, setShowQuickModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<Student | null>(null);
  const [authSearchQuery, setAuthSearchQuery] = useState('');

  const recentTransactions = transactions.slice(0, 6);

  // Calculate today attendance counts
  const todayTakenLunch = attendance.filter((a) => a.mealType === 'lunch' && a.isTaken).length;
  const todayTakenDinner = attendance.filter((a) => a.mealType === 'dinner' && a.isTaken).length;

  // Filter students for Authority quick table preview
  const authPreviewStudents = useMemo(() => {
    const q = authSearchQuery.toLowerCase().trim();
    if (!q) return students.slice(0, 6);
    return students
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.room.toLowerCase().includes(q) ||
          `${s.block}-${s.room}`.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [students, authSearchQuery]);

  // If logged in as Authority, render the Minimalist Authority Portal Dashboard
  if (user?.role === 'Authority') {
    const blockACount = students.filter((s) => s.block === 'A').length;
    const blockBCount = students.filter((s) => s.block === 'B').length;
    const blockCCount = students.filter((s) => s.block === 'C').length;
    const blockDCount = students.filter((s) => s.block === 'D').length;

    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Minimalist Top Header */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Authority Portal</h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-900 border border-purple-200/80">
                Provost Office
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {settings.hallName} · {settings.universityName}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/management/periods"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-2xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create Period</span>
            </Link>
            <Link
              href="/students"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-800 rounded-xl text-xs font-bold border border-slate-200/80 transition"
            >
              <Users className="w-3.5 h-3.5 text-slate-600" />
              <span>Directory</span>
            </Link>
            <Link
              href="/management/settings"
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition"
              title="Hall Settings"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Settings</span>
            </Link>
          </div>
        </div>

        {/* 4 Minimal Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Registered Students */}
          <Link
            href="/students"
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group block"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Resident Students</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{students.length}</span>
              <span className="text-xs text-slate-400">residents</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 font-medium truncate">
              A: {blockACount} · B: {blockBCount} · C: {blockCCount} · D: {blockDCount}
            </div>
          </Link>

          {/* Card 2: Active Management Period */}
          <Link
            href="/management/periods"
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group block"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Active Period</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="mt-2.5">
              <span className="text-base font-bold text-slate-900 truncate block">
                {activePeriod?.name || 'Period #05'}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 font-medium truncate">
              {activePeriod?.managedByTeam || 'Committee Lead'}
            </div>
          </Link>

          {/* Card 3: Standard Rates */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Standard Meal Rates</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-base font-bold text-slate-900">
                {formatTaka(activePeriod?.lunchPrice || 50)}
              </span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-base font-bold text-slate-900">
                {formatTaka(activePeriod?.dinnerPrice || 50)}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 font-medium">
              Lunch & Dinner policy
            </div>
          </div>

          {/* Card 4: Hall Identity & Serving Hours */}
          <Link
            href="/management/settings"
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition group block"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Serving Hours</span>
              <Building className="w-4 h-4 text-slate-500" />
            </div>
            <div className="mt-2.5 space-y-1">
              <span className="text-xs font-bold text-slate-900 block truncate">
                Lunch: {settings.lunchTime}
              </span>
              <span className="text-xs font-bold text-slate-900 block truncate">
                Dinner: {settings.dinnerTime}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400 font-medium truncate">
              Emergency: {settings.contactEmergency || 'Desk'}
            </div>
          </Link>
        </div>

        {/* Two Balanced Governance Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Student Directory Management (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Resident Students Directory</h3>
                <p className="text-xs text-slate-500">Quickly search and update resident information</p>
              </div>

              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search resident..."
                  value={authSearchQuery}
                  onChange={(e) => setAuthSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 font-medium focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
            </div>

            {/* Compact Student Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Room</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Student ID</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {authPreviewStudents.map((std) => (
                    <tr key={std.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        {std.block}-{std.room}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900">{std.name}</td>
                      <td className="py-2 px-3 text-slate-500">{std.studentId}</td>
                      <td className="py-2 px-3 text-slate-600">{std.phone}</td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => setSelectedStudentForEdit(std)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold rounded-md transition inline-flex items-center gap-1"
                        >
                          <Pencil className="w-2.5 h-2.5 text-slate-500" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400 font-medium">
                Showing {authPreviewStudents.length} of {students.length} residents
              </span>
              <Link
                href="/students"
                className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1"
              >
                <span>Full Directory & CSV Import</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Management Periods (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Management Periods</h3>
                  <p className="text-xs text-slate-500">Term committees & rate rotation</p>
                </div>
                <Link
                  href="/management/periods"
                  className="text-xs font-bold text-slate-800 hover:text-slate-950 hover:underline"
                >
                  All Terms →
                </Link>
              </div>

              {/* Minimal Period Cards */}
              <div className="space-y-2.5">
                {periods.map((p) => {
                  const isActive = p.id === activePeriod?.id;
                  return (
                    <div
                      key={p.id}
                      className={`p-3.5 rounded-xl border transition ${
                        isActive
                          ? 'bg-slate-50/80 border-slate-900 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-bold text-slate-900 text-xs truncate">{p.name}</span>
                          {isActive && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 flex-shrink-0">
                              Active
                            </span>
                          )}
                        </div>

                        {!isActive && (
                          <button
                            onClick={() => switchPeriod(p.id)}
                            className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:underline ml-2"
                          >
                            Switch
                          </button>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 mt-1 truncate">
                        {p.managedByTeam} (Lead: {p.teamLead})
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-100">
                        <span>📅 {p.startDate} to {p.endDate}</span>
                        <span className="font-medium text-slate-700">Lunch: ৳{p.lunchPrice} · Dinner: ৳{p.dinnerPrice}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Link
                href="/management/periods"
                className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Management Period</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Direct Edit Modal from Authority Dashboard */}
        <EditStudentModal
          student={selectedStudentForEdit}
          isOpen={!!selectedStudentForEdit}
          onClose={() => setSelectedStudentForEdit(null)}
        />
      </div>
    );
  }

  // Management Team & Admin Operational Dashboard
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Welcome & Period Command Card */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active Management Period</span>
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
              {activePeriod?.startDate} to {activePeriod?.endDate}
            </span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {activePeriod?.name || 'Management Period #05'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Supervised By:{' '}
              <strong className="text-slate-800 font-semibold">{activePeriod?.managedByTeam || '50th Batch Committee'}</strong>
            </p>
          </div>

          {/* Rate Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/70">
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>Lunch Rate: {formatTaka(activePeriod?.lunchPrice || 0)}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200/70">
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Dinner Rate: {formatTaka(activePeriod?.dinnerPrice || 0)}</span>
            </span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowQuickModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-xs hover:shadow-md transition active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>+ Quick Action</span>
          </button>
          <Link
            href="/meals/booking"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 rounded-xl text-sm font-bold border border-slate-200/80 transition"
          >
            <CalendarCheck className="w-4 h-4 text-slate-600" />
            <span>Book Meals</span>
          </Link>
          <Link
            href="/meals/attendance"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 rounded-xl text-sm font-bold border border-slate-200/80 transition"
          >
            <UserCheck className="w-4 h-4 text-slate-600" />
            <span>Live Attendance</span>
          </Link>
        </div>
      </div>

      {/* Main 4 Hero KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Today's Total Meals */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Today&apos;s Meals
              </span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                <Utensils className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                {stats.todayTotalMeals}
              </h3>
              <span className="text-xs font-medium text-slate-500">meals scheduled</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-amber-700 font-semibold">{stats.todayLunchMeals} Lunch</span>
              <span className="text-slate-300">·</span>
              <span className="text-indigo-700 font-semibold">{stats.todayDinnerMeals} Dinner</span>
            </div>
            <Link
              href="/meals/today"
              className="font-bold text-slate-900 hover:text-blue-600 flex items-center gap-1 group-hover:underline"
            >
              <span>Board</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Total Collected Cash */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Collections
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-emerald-800 tracking-tight">
                {formatTaka(stats.totalCollected)}
              </h3>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="text-slate-500">{bookings.length} resident booking(s)</span>
            <Link
              href="/finance/payments"
              className="font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 group-hover:underline"
            >
              <span>Receipts</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Total Bazar / Market Expenses */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Bazar Expenses
              </span>
              <div className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-rose-800 tracking-tight">
                {formatTaka(stats.totalExpense)}
              </h3>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="text-slate-500">Today: {formatTaka(stats.todayExpense)}</span>
            <Link
              href="/finance/expenses"
              className="font-bold text-rose-800 hover:text-rose-950 flex items-center gap-1 group-hover:underline"
            >
              <span>Expenses</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Cash in Hand */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Cash in Hand
              </span>
              <div className="p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                {formatTaka(stats.currentBalance)}
              </h3>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="text-slate-500">Opening: {formatTaka(activePeriod?.openingBalance || 0)}</span>
            <Link
              href="/finance/ledger"
              className="font-bold text-slate-900 hover:text-slate-700 flex items-center gap-1 group-hover:underline"
            >
              <span>Ledger</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Financial & Insight Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Link
          href="/students/dues"
          className="p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-amber-400/90 transition shadow-2xs hover:shadow-xs block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Student Dues (Owed to Mess)</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-lg font-black text-amber-900 mt-1">
            {formatTaka(stats.totalDue)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 group-hover:text-amber-700 transition">
            Click to view student unpaid list →
          </p>
        </Link>

        <Link
          href="/students/dues"
          className="p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-teal-400/90 transition shadow-2xs hover:shadow-xs block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Mess Payable (Owed to Students)</span>
            <span className="w-2 h-2 rounded-full bg-teal-500" />
          </div>
          <div className="text-lg font-black text-teal-800 mt-1">
            {formatTaka(stats.studentReceivablesTotal)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 group-hover:text-teal-700 transition">
            Click to disburse change refunds →
          </p>
        </Link>

        <Link
          href="/meals/guests"
          className="p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-purple-400/90 transition shadow-2xs hover:shadow-xs block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Guest Meals Today</span>
            <span className="w-2 h-2 rounded-full bg-purple-500" />
          </div>
          <div className="text-lg font-black text-purple-900 mt-1">
            {stats.todayGuestMeals} vouchers
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 group-hover:text-purple-700 transition">
            Click to issue guest tokens →
          </p>
        </Link>

        <Link
          href="/students"
          className="p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-slate-400 transition shadow-2xs hover:shadow-xs block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Registered Residents</span>
            <span className="w-2 h-2 rounded-full bg-slate-400" />
          </div>
          <div className="text-lg font-black text-slate-900 mt-1">
            {stats.registeredStudentsCount} residents
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 group-hover:text-slate-700 transition">
            Click to view student directory →
          </p>
        </Link>
      </div>

      {/* Today's Dining Counter & Shifts Live Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today Shift Counter Card */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Today&apos;s Dining Shifts</h3>
              <p className="text-xs text-slate-500">Live check-in counter progress</p>
            </div>
            <Link
              href="/meals/attendance"
              className="text-xs font-bold text-slate-700 hover:text-slate-900 hover:underline"
            >
              Live Counter →
            </Link>
          </div>

          <div className="space-y-3.5">
            {/* Lunch Shift */}
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-600" />
                  <span>Lunch Shift</span>
                </span>
                <span className="text-xs font-bold text-amber-800">
                  {todayTakenLunch} / {stats.todayLunchMeals} Served
                </span>
              </div>
              <div className="w-full h-2 bg-amber-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{
                    width: stats.todayLunchMeals > 0
                      ? `${Math.min(100, (todayTakenLunch / stats.todayLunchMeals) * 100)}%`
                      : '0%',
                  }}
                />
              </div>
            </div>

            {/* Dinner Shift */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span>Dinner Shift</span>
                </span>
                <span className="text-xs font-bold text-indigo-800">
                  {todayTakenDinner} / {stats.todayDinnerMeals} Served
                </span>
              </div>
              <div className="w-full h-2 bg-indigo-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{
                    width: stats.todayDinnerMeals > 0
                      ? `${Math.min(100, (todayTakenDinner / stats.todayDinnerMeals) * 100)}%`
                      : '0%',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Cashbook & Transactions Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Recent Cashbook Transactions</h3>
              <p className="text-xs text-slate-500">Live collections, payments and bazar expenditures</p>
            </div>
            <Link
              href="/finance/ledger"
              className="text-xs font-bold text-slate-800 hover:text-slate-950 hover:underline flex items-center gap-1"
            >
              <span>View Full Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto border border-slate-200/90 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">Date</th>
                  <th className="py-3 px-3.5">Type</th>
                  <th className="py-3 px-3.5">Student / Particulars</th>
                  <th className="py-3 px-3.5">Method</th>
                  <th className="py-3 px-3.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                      No transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3.5 text-slate-500 font-medium">{t.date}</td>
                      <td className="py-3 px-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            t.flow === 'inflow'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-medium text-slate-900">
                        {t.studentName || t.note}
                        {t.room && (
                          <span className="text-slate-500 text-[11px] ml-1.5 font-normal">
                            (Room {t.block}-{t.room})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 font-medium">{t.paymentMethod}</td>
                      <td
                        className={`py-3 px-3.5 text-right font-black text-xs ${
                          t.flow === 'inflow' ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {t.flow === 'inflow' ? '+' : '-'}{formatTaka(t.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <QuickActionsModal isOpen={showQuickModal} onClose={() => setShowQuickModal(false)} />
      <AddExpenseModal isOpen={showExpenseModal} onClose={() => setShowExpenseModal(false)} />
      <RecordPaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />
      <AddGuestMealModal isOpen={showGuestModal} onClose={() => setShowGuestModal(false)} />
    </div>
  );
}
