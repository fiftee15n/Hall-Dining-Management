'use client';

import React, { useState, useMemo } from 'react';
import { useMess } from '@/context/MessContext';
import { getTodayDateString, formatTaka } from '@/lib/utils';
import {
  UserCheck,
  Search,
  Sun,
  Moon,
  CheckCircle2,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export default function MealAttendancePage() {
  const { attendance, markAttendance, stats } = useMess();

  const todayStr = getTodayDateString();
  const [mealType, setMealType] = useState<'lunch' | 'dinner'>('lunch');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<string>('ALL');

  // Due prompt modal state
  const [dueModalData, setDueModalData] = useState<{
    attendanceId?: string;
    studentName: string;
    room: string;
    block: string;
    dueAmount: number;
  } | null>(null);

  const [collectAmount, setCollectAmount] = useState('');
  const [collectMethod, setCollectMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Rocket'>('Cash');

  const currentAttendance = useMemo(() => {
    return attendance.filter((a) => a.date === todayStr && a.mealType === mealType);
  }, [attendance, todayStr, mealType]);

  const filteredAttendance = useMemo(() => {
    return currentAttendance.filter((a) => {
      const matchBlock = selectedBlock === 'ALL' || a.block === selectedBlock;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        a.studentName.toLowerCase().includes(q) ||
        a.room.toLowerCase().includes(q) ||
        `${a.block}-${a.room}`.toLowerCase().includes(q);
      return matchBlock && matchQuery;
    });
  }, [currentAttendance, selectedBlock, searchQuery]);

  const takenCount = currentAttendance.filter((a) => a.isTaken).length;

  const handleMarkMeal = (rec: (typeof currentAttendance)[0]) => {
    if (rec.isTaken) {
      markAttendance(rec.id, false);
      return;
    }

    if (rec.hasDue && rec.dueAmount > 0) {
      setDueModalData({
        attendanceId: rec.id,
        studentName: rec.studentName,
        room: rec.room,
        block: rec.block,
        dueAmount: rec.dueAmount,
      });
      setCollectAmount(String(rec.dueAmount));
    } else {
      markAttendance(rec.id, true);
    }
  };

  const handleConfirmDuePayment = (recordPayment: boolean) => {
    if (!dueModalData || !dueModalData.attendanceId) return;

    if (recordPayment) {
      const amt = Number(collectAmount) || 0;
      markAttendance(dueModalData.attendanceId, true, amt, collectMethod);
    } else {
      markAttendance(dueModalData.attendanceId, true);
    }

    setDueModalData(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Meal Attendance Register</h1>
          <p className="text-xs text-slate-500">
            Fast dining token serving with one-click check-in
          </p>
        </div>

        {/* Meal Type Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setMealType('lunch')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              mealType === 'lunch'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Lunch ({stats.todayTakenLunch}/{stats.todayLunchMeals})</span>
          </button>
          <button
            onClick={() => setMealType('dinner')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              mealType === 'dinner'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-indigo-500" />
            <span>Dinner ({stats.todayTakenDinner}/{stats.todayDinnerMeals})</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Quick Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              autoFocus
              placeholder="Type Room (e.g. 204), Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
            />
          </div>

          {/* Block Filters */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            {(['ALL', 'A', 'B', 'C', 'D'] as const).map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBlock(b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  selectedBlock === b
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {b === 'ALL' ? 'All' : `Block ${b}`}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full min-w-[520px] text-left text-xs">
            <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Room / Block</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                    No tokens found for &quot;{searchQuery || selectedBlock}&quot;.
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {rec.block}-{rec.room}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{rec.studentName}</td>
                    <td className="py-2.5 px-3">
                      {rec.hasDue ? (
                        <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px]">
                          Due ৳{rec.dueAmount}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold text-[11px]">Paid ✓</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {rec.isTaken ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Taken
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">Pending</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {rec.isTaken ? (
                        <button
                          onClick={() => handleMarkMeal(rec)}
                          className="text-[11px] text-slate-400 hover:text-slate-700 underline"
                        >
                          Undo
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkMeal(rec)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs"
                        >
                          ✓ Meal Taken
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Due Modal Prompt */}
      {dueModalData && (
        <Modal
          isOpen={true}
          onClose={() => setDueModalData(null)}
          title="Student Due Balance"
          subtitle={`${dueModalData.studentName} (Room ${dueModalData.block}-${dueModalData.room}) has unpaid dining fees`}
          maxWidth="md"
        >
          <div className="space-y-4 text-sm">
            <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/90 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                  Outstanding Due
                </span>
                <p className="text-xs text-amber-700 mt-0.5">Unsettled meals from previous bookings</p>
              </div>
              <div className="text-xl font-black text-rose-600">
                {formatTaka(dueModalData.dueAmount)}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Collect Payment on Spot (৳)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-base">
                  ৳
                </div>
                <input
                  type="number"
                  min="0"
                  max={dueModalData.dueAmount}
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 font-bold text-base text-slate-900 bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Cash', 'bKash', 'Nagad', 'Rocket'] as const).map((method) => (
                  <button
                    type="button"
                    key={method}
                    onClick={() => setCollectMethod(method)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      collectMethod === method
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => handleConfirmDuePayment(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition"
              >
                Allow Meal without Payment (Keep Due)
              </button>

              <button
                type="button"
                onClick={() => handleConfirmDuePayment(true)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs transition"
              >
                Collect ৳{collectAmount || '0'} & Take Meal
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
