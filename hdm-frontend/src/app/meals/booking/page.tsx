'use client';

import React, { useState, useMemo } from 'react';
import { useMess } from '@/context/MessContext';
import { DayMealSelection, Student } from '@/types';
import { formatTaka, getTodayDateString, formatDateReadable } from '@/lib/utils';
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  Calendar,
  CreditCard,
  Printer,
  Check,
} from 'lucide-react';

export default function MealBookingPage() {
  const { students, activePeriod, createBooking } = useMess();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<string>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const todayStr = getTodayDateString();
  const [startDate, setStartDate] = useState(todayStr);
  const [durationDays, setDurationDays] = useState(5);

  const [mealDays, setMealDays] = useState<DayMealSelection[]>(() => {
    const list: DayMealSelection[] = [];
    const base = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      list.push({
        date: `${y}-${m}-${day}`,
        lunch: true,
        dinner: true,
      });
    }
    return list;
  });

  const [paymentOption, setPaymentOption] = useState<'full' | 'partial' | 'due'>('full');
  const [customPaidAmount, setCustomPaidAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Rocket'>('Cash');
  const [notes, setNotes] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  const updateDateRange = (start: string, count: number) => {
    setStartDate(start);
    setDurationDays(count);
    const list: DayMealSelection[] = [];
    const [y, m, d] = start.split('-').map(Number);
    const base = new Date(y, m - 1, d);

    for (let i = 0; i < count; i++) {
      const cur = new Date(base);
      cur.setDate(base.getDate() + i);
      const year = cur.getFullYear();
      const month = String(cur.getMonth() + 1).padStart(2, '0');
      const day = String(cur.getDate()).padStart(2, '0');
      list.push({
        date: `${year}-${month}-${day}`,
        lunch: true,
        dinner: true,
      });
    }
    setMealDays(list);
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchBlock = selectedBlock === 'ALL' || s.block === selectedBlock;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.room.toLowerCase().includes(q) ||
        `${s.block}-${s.room}`.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q);
      return matchBlock && matchQuery;
    });
  }, [students, selectedBlock, searchQuery]);

  let totalLunch = 0;
  let totalDinner = 0;
  mealDays.forEach((m) => {
    if (m.lunch) totalLunch += 1;
    if (m.dinner) totalDinner += 1;
  });

  const lunchPrice = activePeriod?.lunchPrice || 50;
  const dinnerPrice = activePeriod?.dinnerPrice || 50;
  const totalAmount = totalLunch * lunchPrice + totalDinner * dinnerPrice;

  const actualPaidAmount =
    paymentOption === 'full'
      ? totalAmount
      : paymentOption === 'due'
      ? 0
      : Number(customPaidAmount) || 0;

  const actualDueAmount = Math.max(0, totalAmount - actualPaidAmount);

  const toggleMeal = (index: number, mealType: 'lunch' | 'dinner') => {
    setMealDays((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [mealType]: !item[mealType] } : item))
    );
  };

  const setAllMeals = (type: 'all' | 'lunch_only' | 'dinner_only') => {
    setMealDays((prev) =>
      prev.map((item) => ({
        ...item,
        lunch: type === 'all' || type === 'lunch_only',
        dinner: type === 'all' || type === 'dinner_only',
      }))
    );
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert('Please select a student from the directory');
      return;
    }
    if (totalLunch + totalDinner === 0) {
      alert('Please select at least 1 lunch or dinner meal');
      return;
    }

    const endDate = mealDays[mealDays.length - 1]?.date || startDate;

    const booking = createBooking({
      studentId: selectedStudent.id,
      startDate,
      endDate,
      selectedMeals: mealDays,
      paidAmount: actualPaidAmount,
      paymentMethod: paymentOption === 'due' ? 'Due' : paymentMethod,
      notes: notes.trim() || undefined,
    });

    setConfirmedBooking(booking);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Meal Registration & Booking</h1>
          <p className="text-xs text-slate-500">
            Register dining meals for hall resident students
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span>Lunch: <strong>{formatTaka(lunchPrice)}</strong></span>
          <span className="text-slate-300">|</span>
          <span>Dinner: <strong>{formatTaka(dinnerPrice)}</strong></span>
          <span className="text-slate-300">|</span>
          <span>Min: <strong>{activePeriod?.minBookingDays || 3} Days</strong></span>
        </div>
      </div>

      {confirmedBooking ? (
        /* Voucher Confirmation */
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">Booking Confirmed!</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Voucher Token #{confirmedBooking.id.slice(-6).toUpperCase()}
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Student:</span>
              <strong className="text-slate-900">{confirmedBooking.studentName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Room:</span>
              <strong className="text-slate-900">
                Block {confirmedBooking.block}, Room {confirmedBooking.room}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Duration:</span>
              <span>{confirmedBooking.startDate} to {confirmedBooking.endDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Meals:</span>
              <span>{confirmedBooking.totalLunchCount} Lunch, {confirmedBooking.totalDinnerCount} Dinner</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 border-t pt-1">
              <span>Total Bill:</span>
              <span>{formatTaka(confirmedBooking.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Paid ({confirmedBooking.paymentMethod}):</span>
              <span>{formatTaka(confirmedBooking.paidAmount)}</span>
            </div>
            {confirmedBooking.dueAmount > 0 && (
              <div className="flex justify-between text-rose-600 font-bold">
                <span>Remaining Due:</span>
                <span>{formatTaka(confirmedBooking.dueAmount)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={() => {
                setConfirmedBooking(null);
                setSelectedStudent(null);
                setSearchQuery('');
              }}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition"
            >
              + Next Booking
            </button>
          </div>
        </div>
      ) : (
        /* 2-Column Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Step 1: Student Lookup */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">1. Select Resident Student</h3>
              <span className="text-[11px] text-slate-400">Step 1</span>
            </div>

            {/* Block Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              {(['ALL', 'A', 'B', 'C', 'D'] as const).map((blk) => (
                <button
                  key={blk}
                  type="button"
                  onClick={() => setSelectedBlock(blk)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    selectedBlock === blk
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {blk === 'ALL' ? 'All' : `Block ${blk}`}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Room (e.g. 204), Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>

            {/* Student List */}
            <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
              {filteredStudents.length === 0 ? (
                <div className="p-6 text-center text-slate-400 italic text-xs">
                  <p>No students found.</p>
                  <a href="/students" className="font-bold text-slate-900 not-italic hover:underline mt-1 block">
                    + Add or Import Students →
                  </a>
                </div>
              ) : (
                filteredStudents.map((std) => {
                  const isSelected = selectedStudent?.id === std.id;
                  return (
                    <button
                      key={std.id}
                      type="button"
                      onClick={() => setSelectedStudent(std)}
                      className={`w-full text-left p-2 rounded-lg border text-xs transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{std.name}</div>
                        <div className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          Room {std.block}-{std.room}
                        </div>
                      </div>
                      {std.balanceDue > 0 && !isSelected && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                          Due ৳{std.balanceDue}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {selectedStudent && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Selected:</span>
                  <strong className="text-slate-900">{selectedStudent.name}</strong>
                  <span className="text-slate-500 text-[11px] ml-1">({selectedStudent.block}-{selectedStudent.room})</span>
                </div>
                <span className="text-xs text-emerald-600 font-bold">✓ Ready</span>
              </div>
            )}
          </div>

          {/* Step 2: Date, Meals & Payment */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  2. Choose Dates & Meals
                </h3>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setAllMeals('all')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold"
                  >
                    Both Meals
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllMeals('lunch_only')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold"
                  >
                    Lunch Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllMeals('dinner_only')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold"
                  >
                    Dinner Only
                  </button>
                </div>
              </div>

              {/* Start Date & Preset Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => updateDateRange(e.target.value, durationDays)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Duration</label>
                  <div className="grid grid-cols-4 gap-1">
                    {[3, 5, 7, 10].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => updateDateRange(startDate, days)}
                        className={`py-1.5 rounded-md font-bold text-center border text-xs ${
                          durationDays === days
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {days}D
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Days List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-slate-100">
                {mealDays.map((m, idx) => (
                  <div key={m.date} className="p-2 flex items-center justify-between hover:bg-slate-50">
                    <span className="font-semibold text-slate-800">
                      {formatDateReadable(m.date)}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">(Day {idx + 1})</span>
                    </span>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={m.lunch}
                          onChange={() => toggleMeal(idx, 'lunch')}
                          className="w-3.5 h-3.5 rounded"
                        />
                        <span>Lunch</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={m.dinner}
                          onChange={() => toggleMeal(idx, 'dinner')}
                          className="w-3.5 h-3.5 rounded"
                        />
                        <span>Dinner</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bill & Payment */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between font-bold text-slate-900 text-sm">
                  <span>Total Calculated Cost:</span>
                  <span>{formatTaka(totalAmount)}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setPaymentOption('full')}
                    className={`py-1.5 rounded-lg border font-bold text-xs ${
                      paymentOption === 'full'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Full Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentOption('partial');
                      setCustomPaidAmount(String(Math.round(totalAmount / 2)));
                    }}
                    className={`py-1.5 rounded-lg border font-bold text-xs ${
                      paymentOption === 'partial'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Partial
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentOption('due')}
                    className={`py-1.5 rounded-lg border font-bold text-xs ${
                      paymentOption === 'due'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Full Due
                  </button>
                </div>

                {paymentOption === 'partial' && (
                  <div className="flex gap-2 pt-1">
                    <input
                      type="number"
                      placeholder="Paid Amount"
                      value={customPaidAmount}
                      onChange={(e) => setCustomPaidAmount(e.target.value)}
                      className="w-full px-2 py-1 border rounded bg-white font-bold"
                    />
                    <div className="text-xs text-rose-600 font-bold flex items-center whitespace-nowrap">
                      Due: {formatTaka(actualDueAmount)}
                    </div>
                  </div>
                )}

                {paymentOption !== 'due' && (
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {(['Cash', 'bKash', 'Nagad', 'Rocket'] as const).map((method) => (
                      <button
                        type="button"
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`py-1 rounded text-[11px] font-bold border ${
                          paymentMethod === method
                            ? 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={!selectedStudent}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Confirm Booking →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
