'use client';

import React, { useState } from 'react';
import { useMess } from '@/context/MessContext';
import { formatTaka } from '@/lib/utils';
import {
  Settings,
  Plus,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export default function PeriodsManagementPage() {
  const { periods, activePeriodId, switchPeriod, createPeriod } = useMess();

  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Period Form
  const [name, setName] = useState('Management Period #06');
  const [code, setCode] = useState('P-06');
  const [startDate, setStartDate] = useState('2026-09-16');
  const [endDate, setEndDate] = useState('2026-09-30');
  const [managedByTeam, setManagedByTeam] = useState('Team Guardians (50th Batch)');
  const [teamLead, setTeamLead] = useState('Kazi Moinul');
  const [contactNumber, setContactNumber] = useState('01700-112233');
  const [lunchPrice, setLunchPrice] = useState(50);
  const [dinnerPrice, setDinnerPrice] = useState(50);
  const [feastRegularPrice, setFeastRegularPrice] = useState(160);
  const [feastGuestPrice, setFeastGuestPrice] = useState(220);
  const [minBookingDays, setMinBookingDays] = useState(3);
  const [openingBalance, setOpeningBalance] = useState(10000);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createPeriod({
      name: name.trim(),
      code: code.trim(),
      startDate,
      endDate,
      managedByTeam: managedByTeam.trim(),
      teamLead: teamLead.trim(),
      contactNumber: contactNumber.trim(),
      lunchPrice: Number(lunchPrice),
      dinnerPrice: Number(dinnerPrice),
      feastRegularPrice: Number(feastRegularPrice),
      feastGuestPrice: Number(feastGuestPrice),
      minBookingDays: Number(minBookingDays),
      openingBalance: Number(openingBalance),
      status: 'active',
    });

    setShowCreateModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Management Periods</h1>
          <p className="text-xs text-slate-500">
            Rotate dining management terms and isolate accounting records
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Period</span>
        </button>
      </div>

      {/* Period Cards */}
      <div className="space-y-3">
        {periods.map((p) => {
          const isActive = p.id === activePeriodId;

          return (
            <div
              key={p.id}
              className={`p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isActive
                  ? 'bg-white border-slate-900 shadow-xs ring-1 ring-slate-900'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                  {isActive && (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      Currently Active
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-1 font-medium">
                  {p.managedByTeam} (Lead: {p.teamLead}, {p.contactNumber})
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                  <span>📅 {p.startDate} to {p.endDate}</span>
                  <span>•</span>
                  <span>Lunch: {formatTaka(p.lunchPrice)}</span>
                  <span>•</span>
                  <span>Dinner: {formatTaka(p.dinnerPrice)}</span>
                  <span>•</span>
                  <span>Opening: {formatTaka(p.openingBalance)}</span>
                </div>
              </div>

              <div>
                {isActive ? (
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Active Term
                  </span>
                ) : (
                  <button
                    onClick={() => switchPeriod(p.id)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 font-bold text-xs rounded-xl transition"
                  >
                    Switch to This Period
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Management Period"
        subtitle="Initialize a new mess period with custom pricing structure and opening cash"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Period Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Period #06 (Nov 2026)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Period Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. P06-NOV26"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Lunch Rate (৳) <span className="text-[11px] text-slate-400 font-normal lowercase">(student & guest)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-base">
                  ৳
                </div>
                <input
                  type="number"
                  value={lunchPrice}
                  onChange={(e) => setLunchPrice(Number(e.target.value))}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 font-bold text-base text-slate-900 bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Dinner Rate (৳) <span className="text-[11px] text-slate-400 font-normal lowercase">(student & guest)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-base">
                  ৳
                </div>
                <input
                  type="number"
                  value={dinnerPrice}
                  onChange={(e) => setDinnerPrice(Number(e.target.value))}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 font-bold text-base text-slate-900 bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Opening Cash (৳)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-base">
                  ৳
                </div>
                <input
                  type="number"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(Number(e.target.value))}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 font-bold text-base text-slate-900 bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Management Team / Committee</label>
            <input
              type="text"
              value={managedByTeam}
              onChange={(e) => setManagedByTeam(e.target.value)}
              placeholder="e.g. 50th Batch Dining Committee"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs transition"
            >
              Create Period
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
