'use client';

import React, { useState, useMemo } from 'react';
import { useMess } from '@/context/MessContext';
import { formatTaka } from '@/lib/utils';
import {
  Sparkles,
  Plus,
  Printer,
  Ticket,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export default function FeastManagementPage() {
  const { feasts, feastRegistrations, createFeast, registerFeast, students, activePeriodId } = useMess();

  const [showCreateFeastModal, setShowCreateFeastModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedFeastId, setSelectedFeastId] = useState<string>(feasts[0]?.id || '');

  // New Feast
  const [feastTitle, setFeastTitle] = useState('');
  const [feastDate, setFeastDate] = useState('2026-09-08');
  const [feastMealType, setFeastMealType] = useState<'lunch' | 'dinner'>('dinner');
  const [regularPrice, setRegularPrice] = useState(160);
  const [guestPrice, setGuestPrice] = useState(220);
  const [maxCapacity, setMaxCapacity] = useState(350);
  const [menuDescription, setMenuDescription] = useState(
    'Special Mutton Kacchi Biryani, Chicken Roast, Borhani & Firni'
  );

  // New Registration
  const [regStudentId, setRegStudentId] = useState('');
  const [isGuest, setIsGuest] = useState(false);
  const [guestCount, setGuestCount] = useState(0);
  const [regPaymentMethod, setRegPaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Due'>('Cash');

  const activeFeasts = useMemo(() => {
    return feasts.filter((f) => f.periodId === activePeriodId);
  }, [feasts, activePeriodId]);

  const currentFeast = activeFeasts.find((f) => f.id === selectedFeastId) || activeFeasts[0];

  const currentRegistrations = useMemo(() => {
    if (!currentFeast) return [];
    return feastRegistrations.filter((r) => r.feastId === currentFeast.id);
  }, [feastRegistrations, currentFeast]);

  const handleCreateFeastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feastTitle.trim()) return;

    const created = createFeast({
      title: feastTitle.trim(),
      date: feastDate,
      mealType: feastMealType,
      regularPrice: Number(regularPrice),
      guestPrice: Number(guestPrice),
      maxCapacity: Number(maxCapacity),
      menuDescription: menuDescription.trim(),
      status: 'upcoming',
    });

    setSelectedFeastId(created.id);
    setShowCreateFeastModal(false);
    setFeastTitle('');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFeast || !regStudentId) return;

    const regCost = currentFeast.regularPrice;
    const gCost = (guestCount || 0) * currentFeast.guestPrice;
    const total = regCost + gCost;

    registerFeast({
      feastId: currentFeast.id,
      studentId: regStudentId,
      isGuest,
      guestCount: isGuest ? guestCount : 0,
      paidAmount: regPaymentMethod === 'Due' ? 0 : total,
      paymentMethod: regPaymentMethod,
    });

    setShowRegisterModal(false);
    setRegStudentId('');
    setIsGuest(false);
    setGuestCount(0);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Grand Feast Management</h1>
          <p className="text-xs text-slate-500">
            Schedule hall feasts, special menu tickets, and guest vouchers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            + Register Feast Token
          </button>
          <button
            onClick={() => setShowCreateFeastModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition"
          >
            + New Feast
          </button>
        </div>
      </div>

      {/* Feast Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {activeFeasts.map((feast) => {
          const isSelected = currentFeast?.id === feast.id;
          const regs = feastRegistrations.filter((r) => r.feastId === feast.id);
          const revenue = regs.reduce((sum, r) => sum + r.paidAmount, 0);

          return (
            <div
              key={feast.id}
              onClick={() => setSelectedFeastId(feast.id)}
              className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-slate-900 shadow-xs ring-1 ring-slate-900'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{feast.date} · {feast.mealType}</span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{feast.title}</h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                    {feast.registeredCount} / {feast.maxCapacity} Seats
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {feast.menuDescription}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Regular: <strong>{formatTaka(feast.regularPrice)}</strong> · Guest: <strong>{formatTaka(feast.guestPrice)}</strong></span>
                <span className="font-bold text-emerald-700">Collected {formatTaka(revenue)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Registrations List */}
      {currentFeast && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Feast Token List ({currentFeast.title})
              </h3>
              <p className="text-xs text-slate-500">{currentRegistrations.length} Students Registered</p>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print List</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Token #</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Room / Block</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                      No registrations logged yet. Click &quot;+ Register Feast Token&quot; to issue tickets.
                    </td>
                  </tr>
                ) : (
                  currentRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border">#{reg.tokenNumber}</span>
                      </td>
                      <td className="p-3 font-bold text-slate-900">{reg.studentName}</td>
                      <td className="p-3 text-slate-700">{reg.block}-{reg.room}</td>
                      <td className="p-3 text-slate-600">
                        {reg.isGuest ? `Resident + ${reg.guestCount} Guest(s)` : 'Resident'}
                      </td>
                      <td className="p-3 font-bold text-slate-900">{formatTaka(reg.totalAmount)}</td>
                      <td className="p-3">
                        <span className="text-emerald-700 font-bold">Paid ({reg.paymentMethod}) ✓</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Feast Modal */}
      <Modal
        isOpen={showCreateFeastModal}
        onClose={() => setShowCreateFeastModal(false)}
        title="Schedule Grand Feast Event"
        subtitle="Create feast event with pricing structure and dinner menu"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateFeastSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Feast Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Grand Shaptahik Mutton Kacchi Feast"
              value={feastTitle}
              onChange={(e) => setFeastTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Feast Date</label>
              <input
                type="date"
                required
                value={feastDate}
                onChange={(e) => setFeastDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Meal Shift</label>
              <select
                value={feastMealType}
                onChange={(e) => setFeastMealType(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all cursor-pointer"
              >
                <option value="dinner">Dinner Feast</option>
                <option value="lunch">Lunch Feast</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Regular Student Price (৳)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-base">
                  ৳
                </div>
                <input
                  type="number"
                  min="0"
                  value={regularPrice}
                  onChange={(e) => setRegularPrice(Number(e.target.value))}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 font-bold text-base text-slate-900 bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Guest Voucher Price (৳)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-base">
                  ৳
                </div>
                <input
                  type="number"
                  min="0"
                  value={guestPrice}
                  onChange={(e) => setGuestPrice(Number(e.target.value))}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 font-bold text-base text-slate-900 bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Max Seat Capacity</label>
              <input
                type="number"
                min="10"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-base text-slate-900 bg-white text-center focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Menu Items & Special Dishes</label>
            <textarea
              rows={2}
              value={menuDescription}
              onChange={(e) => setMenuDescription(e.target.value)}
              placeholder="e.g. Mutton Kacchi Biryani, Borhani, Firni, Shami Kabab, Salad"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setShowCreateFeastModal(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs transition"
            >
              Save Feast Event
            </button>
          </div>
        </form>
      </Modal>

      {/* Register Token Modal */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Register Feast Token"
        subtitle={currentFeast ? `${currentFeast.title}` : 'Feast Ticket'}
        maxWidth="md"
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Resident Student <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={regStudentId}
              onChange={(e) => setRegStudentId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all cursor-pointer"
            >
              <option value="">Choose resident student...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.block}-{s.room})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer font-bold text-xs text-slate-800">
              <input
                type="checkbox"
                checked={isGuest}
                onChange={(e) => setIsGuest(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900"
              />
              <span>Include Guest Feast Tickets</span>
            </label>

            {isGuest && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-xs">
                <span className="font-semibold text-slate-600">Extra Guest Count:</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 border border-slate-300 rounded-xl text-center font-bold text-sm bg-white"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Payment Method</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Cash', 'bKash', 'Nagad', 'Rocket'] as const).map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setRegPaymentMethod(method)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                    regPaymentMethod === method
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="text-sm font-bold text-slate-900">
              Total Fee: <span className="text-base font-black text-emerald-700">{currentFeast ? formatTaka(currentFeast.regularPrice + (isGuest ? (guestCount || 0) * currentFeast.guestPrice : 0)) : '৳0'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs transition"
              >
                Issue Token
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
