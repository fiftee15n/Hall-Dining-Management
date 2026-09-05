'use client';

import React, { useState, useMemo } from 'react';
import { useMess } from '@/context/MessContext';
import { formatTaka } from '@/lib/utils';
import {
  CreditCard,
  Search,
  Plus,
} from 'lucide-react';
import { RecordPaymentModal } from '@/components/modals/RecordPaymentModal';
import { Modal } from '@/components/ui/Modal';

export default function DuesAndReceivablesPage() {
  const { students, receivables, settleReceivable, createReceivable, stats } = useMess();

  const [activeTab, setActiveTab] = useState<'dues' | 'receivables'>('dues');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedStudentForPay, setSelectedStudentForPay] = useState<string | null>(null);

  // Settle Refund Modal
  const [settleModalData, setSettleModalData] = useState<{
    id: string;
    studentName: string;
    room: string;
    amount: number;
    reason: string;
  } | null>(null);
  const [settleMethod, setSettleMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Rocket'>('Cash');
  const [settleNote, setSettleNote] = useState('');

  // Add new manual receivable
  const [showAddReceivableModal, setShowAddReceivableModal] = useState(false);
  const [newRecStudentId, setNewRecStudentId] = useState('');
  const [newRecAmount, setNewRecAmount] = useState('');
  const [newRecReason, setNewRecReason] = useState('');

  const dueStudents = useMemo(() => {
    return students.filter((s) => s.balanceDue > 0);
  }, [students]);

  const filteredDueStudents = useMemo(() => {
    return dueStudents.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.room.toLowerCase().includes(q) ||
        `${s.block}-${s.room}`.toLowerCase().includes(q)
      );
    });
  }, [dueStudents, searchQuery]);

  const pendingReceivables = useMemo(() => {
    return receivables.filter((r) => r.status === 'pending');
  }, [receivables]);

  const filteredReceivables = useMemo(() => {
    return pendingReceivables.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        r.studentName.toLowerCase().includes(q) ||
        r.room.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q)
      );
    });
  }, [pendingReceivables, searchQuery]);

  const handleSettleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleModalData) return;

    settleReceivable(settleModalData.id, settleMethod, settleNote.trim() || undefined);
    setSettleModalData(null);
  };

  const handleAddReceivableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecStudentId || !newRecAmount || Number(newRecAmount) <= 0) return;

    createReceivable(
      newRecStudentId,
      Number(newRecAmount),
      newRecReason.trim() || 'Cash change shortage during dining payment'
    );
    setNewRecStudentId('');
    setNewRecAmount('');
    setNewRecReason('');
    setShowAddReceivableModal(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Dues & Payable</h1>
          <p className="text-xs text-slate-500">
            Manage student unpaid meal dues and hall payables / change refunds
          </p>
        </div>

        <button
          onClick={() => setShowAddReceivableModal(true)}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
        >
          + Add Change Payable / Refund
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div
          onClick={() => setActiveTab('dues')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            activeTab === 'dues' ? 'bg-white border-slate-900 shadow-xs ring-1 ring-slate-900' : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-[11px] font-medium text-slate-500">Total Student Due (Payable to Mess)</span>
          <div className="text-2xl font-black text-rose-700 mt-0.5">{formatTaka(stats.totalDue)}</div>
          <span className="text-[10px] text-slate-400">{dueStudents.length} Students have dues</span>
        </div>

        <div
          onClick={() => setActiveTab('receivables')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            activeTab === 'receivables' ? 'bg-white border-slate-900 shadow-xs ring-1 ring-slate-900' : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-[11px] font-medium text-slate-500">Total Mess Payable (Owed to Students)</span>
          <div className="text-2xl font-black text-teal-800 mt-0.5">{formatTaka(stats.studentReceivablesTotal)}</div>
          <span className="text-[10px] text-slate-400">{pendingReceivables.length} Pending refunds / advance payables</span>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('dues')}
              className={`px-4 py-1 rounded-lg text-xs font-bold transition ${
                activeTab === 'dues' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Student Dues ({dueStudents.length})
            </button>
            <button
              onClick={() => setActiveTab('receivables')}
              className={`px-4 py-1 rounded-lg text-xs font-bold transition ${
                activeTab === 'receivables' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Mess Payable / Refunds ({pendingReceivables.length})
            </button>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300"
            />
          </div>
        </div>

        {/* Tab 1: Dues Table */}
        {activeTab === 'dues' && (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Room / Block</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Department & Phone</th>
                  <th className="p-3">Due Balance</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDueStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                      No unpaid dues found! All registered meals are cleared.
                    </td>
                  </tr>
                ) : (
                  filteredDueStudents.map((std) => (
                    <tr key={std.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {std.block}-{std.room}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900">{std.name}</td>
                      <td className="p-3 text-slate-600">{std.department} · {std.phone}</td>
                      <td className="p-3 font-bold text-rose-600">{formatTaka(std.balanceDue)}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedStudentForPay(std.id)}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs"
                        >
                          Clear Due
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Receivables Table */}
        {/* Tab 2: Receivables / Payables Table */}
        {activeTab === 'receivables' && (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Student & Room</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Payable Amount</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReceivables.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                      No pending payables or change refunds owed.
                    </td>
                  </tr>
                ) : (
                  filteredReceivables.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 text-slate-500">{r.date}</td>
                      <td className="p-3 font-bold text-slate-900">
                        {r.studentName} <span className="text-slate-500 font-normal">({r.block}-{r.room})</span>
                      </td>
                      <td className="p-3 text-slate-700 max-w-sm">{r.reason}</td>
                      <td className="p-3 font-bold text-teal-800">{formatTaka(r.amount)}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() =>
                            setSettleModalData({
                              id: r.id,
                              studentName: r.studentName,
                              room: `${r.block}-${r.room}`,
                              amount: r.amount,
                              reason: r.reason,
                            })
                          }
                          className="px-3 py-1 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-lg text-xs"
                        >
                          Settle / Pay Out
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Settle Refund Modal */}
      {settleModalData && (
        <Modal
          isOpen={true}
          onClose={() => setSettleModalData(null)}
          title="Settle Payable / Refund"
          subtitle={`Disburse payable refund of ${formatTaka(settleModalData.amount)} to ${settleModalData.studentName}`}
          maxWidth="md"
        >
          <form onSubmit={handleSettleSubmit} className="space-y-4 text-sm">
            <div className="p-4 bg-teal-50/80 rounded-2xl border border-teal-200/90">
              <p className="font-bold text-teal-950 text-sm">
                {settleModalData.studentName} ({settleModalData.room})
              </p>
              <div className="mt-1 text-lg font-black text-teal-900">
                Payable Amount: {formatTaka(settleModalData.amount)}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Disbursement Channel
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Cash', 'bKash', 'Nagad', 'Rocket'] as const).map((method) => (
                  <button
                    type="button"
                    key={method}
                    onClick={() => setSettleMethod(method)}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                      settleMethod === method
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSettleModalData(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm shadow-xs transition"
              >
                Confirm Payable Settled
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Manual Add Receivable Modal */}
      <Modal
        isOpen={showAddReceivableModal}
        onClose={() => setShowAddReceivableModal(false)}
        title="Add Change Payable / Refund"
        subtitle="Record change shortage or excess advance owed to student"
        maxWidth="md"
      >
        <form onSubmit={handleAddReceivableSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Resident Student <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={newRecStudentId}
              onChange={(e) => setNewRecStudentId(e.target.value)}
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

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Amount Owed (৳) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-base">
                ৳
              </div>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 30"
                value={newRecAmount}
                onChange={(e) => setNewRecAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 font-bold text-base text-teal-800 bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason / Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. Paid ৳100 for ৳70 meal, change shortage"
              value={newRecReason}
              onChange={(e) => setNewRecReason(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setShowAddReceivableModal(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs transition"
            >
              Save Payable Record
            </button>
          </div>
        </form>
      </Modal>

      {selectedStudentForPay && (
        <RecordPaymentModal
          isOpen={true}
          onClose={() => setSelectedStudentForPay(null)}
          defaultStudentId={selectedStudentForPay}
        />
      )}
    </div>
  );
}
