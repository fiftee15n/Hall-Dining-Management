'use client';

import React, { useState, useMemo } from 'react';
import { useMess } from '@/context/MessContext';
import { getTodayDateString, formatTaka, formatDateReadable } from '@/lib/utils';
import {
  UtensilsCrossed,
  Sun,
  Moon,
  Search,
  CheckCircle2,
  Clock,
  Check,
} from 'lucide-react';

export default function TodaysMealBoardPage() {
  const { attendance, guestMeals, markAttendance, stats } = useMess();

  const todayStr = getTodayDateString();
  const [selectedMealType, setSelectedMealType] = useState<'lunch' | 'dinner'>('lunch');
  const [selectedBlock, setSelectedBlock] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const todayRecords = useMemo(() => {
    return attendance.filter((a) => a.date === todayStr && a.mealType === selectedMealType);
  }, [attendance, todayStr, selectedMealType]);

  const filteredRecords = useMemo(() => {
    return todayRecords.filter((r) => {
      const matchBlock = selectedBlock === 'ALL' || r.block === selectedBlock;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        r.studentName.toLowerCase().includes(q) ||
        r.room.toLowerCase().includes(q) ||
        `${r.block}-${r.room}`.toLowerCase().includes(q);
      return matchBlock && matchQuery;
    });
  }, [todayRecords, selectedBlock, searchQuery]);

  const todayGuests = guestMeals.filter((g) => g.date === todayStr && g.mealType === selectedMealType);
  const totalGuestQty = todayGuests.reduce((sum, g) => sum + g.quantity, 0);

  const totalRegistered = todayRecords.length;
  const totalTaken = todayRecords.filter((r) => r.isTaken).length;
  const totalRemaining = totalRegistered - totalTaken;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Today&apos;s Meals Board</h1>
          <p className="text-xs text-slate-500">
            Kitchen orders and meal distribution ({formatDateReadable(todayStr)})
          </p>
        </div>

        {/* Lunch / Dinner Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setSelectedMealType('lunch')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedMealType === 'lunch'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Lunch ({stats.todayLunchMeals})</span>
          </button>
          <button
            onClick={() => setSelectedMealType('dinner')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedMealType === 'dinner'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-indigo-500" />
            <span>Dinner ({stats.todayDinnerMeals})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Total Booked</span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{totalRegistered}</div>
          <span className="text-[10px] text-slate-400">Residents + {totalGuestQty} Guests</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Served</span>
          <div className="text-2xl font-black text-emerald-700 mt-0.5">{totalTaken}</div>
          <span className="text-[10px] text-emerald-600 font-bold">
            {totalRegistered > 0 ? Math.round((totalTaken / totalRegistered) * 100) : 0}% Served
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Remaining</span>
          <div className="text-2xl font-black text-amber-700 mt-0.5">{totalRemaining}</div>
          <span className="text-[10px] text-slate-400">In Queue</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto">
            {(['ALL', 'A', 'B', 'C', 'D'] as const).map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBlock(b)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  selectedBlock === b
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {b === 'ALL' ? 'All' : `Block ${b}`}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Room or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300"
            />
          </div>
        </div>

        {/* Meal List Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">Room / Block</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Meal</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                    No meals found for this filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {rec.block}-{rec.room}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{rec.studentName}</td>
                    <td className="p-3 capitalize text-slate-600">{rec.mealType}</td>
                    <td className="p-3">
                      {rec.isTaken ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Taken
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">Pending</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {rec.isTaken ? (
                        <button
                          onClick={() => markAttendance(rec.id, false)}
                          className="text-[11px] text-slate-400 hover:text-slate-700 underline"
                        >
                          Undo
                        </button>
                      ) : (
                        <button
                          onClick={() => markAttendance(rec.id, true)}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs"
                        >
                          ✓ Mark Served
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
    </div>
  );
}
