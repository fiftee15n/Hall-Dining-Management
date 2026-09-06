'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMess } from '@/context/MessContext';
import { useAuth } from '@/context/AuthContext';
import { formatTaka } from '@/lib/utils';
import {
  Settings,
  Plus,
  CheckCircle2,
  Calendar,
  Layers,
  Shield,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export default function PeriodsManagementPage() {
  const { periods, activePeriodId, switchPeriod, createPeriod } = useMess();
  const { user } = useAuth();

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

  const isAuthorityOrAdmin = user?.role === 'Authority' || user?.role === 'Admin';

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
      {/* Governance & Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <Link
          href="/management/periods"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white shadow-2xs transition"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Management Periods</span>
        </Link>

        <Link
          href="/management/settings"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition"
        >
          <Settings className="w-3.5 h-3.5 text-slate-500" />
          <span>Hall Settings</span>
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Management Periods</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
              Authority Governed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Create and rotate dining management terms, designate committee leads, and set meal rates
          </p>
        </div>

        {isAuthorityOrAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Period</span>
          </button>
        )}
      </div>

      {/* Access info if Management Team */}
      {!isAuthorityOrAdmin && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-900">Restricted Authority Operation</p>
            <p className="text-amber-800 leading-relaxed">
              Period creation and rate configuration are managed exclusively by the <strong>Hall Authority (Provost Office)</strong>. As a Management Team committee, your records operate under the currently assigned active period.
            </p>
          </div>
        </div>
      )}

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
                ) : isAuthorityOrAdmin ? (
                  <button
                    onClick={() => switchPeriod(p.id)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 font-bold text-xs rounded-xl transition"
                  >
                    Switch to This Period
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 font-medium italic">Previous Term</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal for Authority */}
      {isAuthorityOrAdmin && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Management Period"
          subtitle="Authority Portal: Initialize a new mess term with designated committee and pricing"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Management Committee</label>
                <input
                  type="text"
                  value={managedByTeam}
                  onChange={(e) => setManagedByTeam(e.target.value)}
                  placeholder="e.g. 50th Batch Dining Committee"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Committee Lead / Phone</label>
                <input
                  type="text"
                  value={teamLead}
                  onChange={(e) => setTeamLead(e.target.value)}
                  placeholder="e.g. Kazi Moinul"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                />
              </div>
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
      )}
    </div>
  );
}
