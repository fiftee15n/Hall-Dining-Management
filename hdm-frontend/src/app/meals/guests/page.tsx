'use client';

import React, { useState, useMemo } from 'react';
import { useMess } from '@/context/MessContext';
import { formatTaka } from '@/lib/utils';
import {
  UserPlus,
  Search,
  Plus,
  DollarSign,
  Users,
} from 'lucide-react';
import { AddGuestMealModal } from '@/components/modals/AddGuestMealModal';

export default function GuestMealsPage() {
  const { guestMeals, markGuestMealPaid, activePeriodId, activePeriod } = useMess();

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Paid' | 'Due'>('all');

  const activeGuestMeals = useMemo(() => {
    return guestMeals.filter((g) => g.periodId === activePeriodId);
  }, [guestMeals, activePeriodId]);

  const filteredMeals = useMemo(() => {
    return activeGuestMeals.filter((g) => {
      const matchStatus = filterStatus === 'all' || g.paymentStatus === filterStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        g.guestName.toLowerCase().includes(q) ||
        g.hostStudentName.toLowerCase().includes(q) ||
        g.room.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [activeGuestMeals, filterStatus, searchQuery]);

  const totalCount = activeGuestMeals.reduce((sum, g) => sum + g.quantity, 0);
  const totalCollected = activeGuestMeals
    .filter((g) => g.paymentStatus === 'Paid')
    .reduce((sum, g) => sum + g.totalPrice, 0);
  const totalDue = activeGuestMeals
    .filter((g) => g.paymentStatus === 'Due')
    .reduce((sum, g) => sum + g.totalPrice, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Guest Meals & Vouchers</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {activePeriod?.name || 'Active Period'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Issue dining vouchers for visitors and students&apos; guests at standard period rates:
            <strong className="text-slate-800 ml-1">Lunch {formatTaka(activePeriod?.lunchPrice || 0)}</strong> ·{' '}
            <strong className="text-slate-800">Dinner {formatTaka(activePeriod?.dinnerPrice || 0)}</strong>
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-98 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Issue Guest Meal</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate block">Total Guest Meals</span>
          <div className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5">{totalCount}</div>
          <span className="text-[9px] sm:text-[10px] text-slate-400 truncate block">{activeGuestMeals.length} Vouchers</span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate block">Paid Revenue</span>
          <div className="text-lg sm:text-2xl font-black text-emerald-700 mt-0.5 truncate">{formatTaka(totalCollected)}</div>
          <span className="text-[9px] sm:text-[10px] text-emerald-600 font-bold truncate block">Collected</span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate block">Unpaid Due</span>
          <div className="text-lg sm:text-2xl font-black text-rose-700 mt-0.5 truncate">{formatTaka(totalDue)}</div>
          <span className="text-[9px] sm:text-[10px] text-rose-600 font-bold truncate block">Pending</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            {(['all', 'Paid', 'Due'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition capitalize whitespace-nowrap ${
                  filterStatus === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? 'All' : st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Guest or Host..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full min-w-[620px] text-left text-xs">
            <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Guest Name</th>
                <th className="p-3">Host Student / Room</th>
                <th className="p-3">Meal</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMeals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    No guest meals registered yet.
                  </td>
                </tr>
              ) : (
                filteredMeals.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 text-slate-500">{g.date}</td>
                    <td className="p-3 font-bold text-slate-900">{g.guestName}</td>
                    <td className="p-3 text-slate-700">
                      {g.hostStudentName} <span className="text-slate-400">({g.block}-{g.room})</span>
                    </td>
                    <td className="p-3 capitalize">{g.mealType}</td>
                    <td className="p-3">{g.quantity} × {formatTaka(g.unitPrice)}</td>
                    <td className="p-3 font-bold text-slate-900">{formatTaka(g.totalPrice)}</td>
                    <td className="p-3">
                      {g.paymentStatus === 'Paid' ? (
                        <span className="text-emerald-700 font-bold text-xs">Paid ({g.paymentMethod})</span>
                      ) : (
                        <span className="text-rose-600 font-bold text-xs">Due</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {g.paymentStatus === 'Due' && (
                        <button
                          onClick={() => markGuestMealPaid(g.id, 'Cash')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px]"
                        >
                          Clear Due
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

      <AddGuestMealModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}
