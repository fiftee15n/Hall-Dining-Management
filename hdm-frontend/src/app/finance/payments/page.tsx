'use client';

import React, { useState, useMemo } from 'react';
import { useMess } from '@/context/MessContext';
import { formatTaka } from '@/lib/utils';
import {
  Receipt,
  Search,
  Plus,
} from 'lucide-react';
import { RecordPaymentModal } from '@/components/modals/RecordPaymentModal';

export default function PaymentsPage() {
  const { transactions, activePeriodId, stats } = useMess();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');

  const activeInflows = useMemo(() => {
    return transactions.filter((t) => t.periodId === activePeriodId && t.flow === 'inflow');
  }, [transactions, activePeriodId]);

  const filteredInflows = useMemo(() => {
    return activeInflows.filter((t) => {
      const matchMethod = selectedMethod === 'ALL' || t.paymentMethod === selectedMethod;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        (t.studentName && t.studentName.toLowerCase().includes(q)) ||
        (t.note && t.note.toLowerCase().includes(q)) ||
        (t.room && t.room.toLowerCase().includes(q));
      return matchMethod && matchQuery;
    });
  }, [activeInflows, selectedMethod, searchQuery]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Payment Collection Receipts</h1>
          <p className="text-xs text-slate-500">
            Cash, bKash, Nagad, and Rocket incoming fee collections
          </p>
        </div>

        <button
          onClick={() => setShowPaymentModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Record Payment</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate block">Total Collected</span>
          <div className="text-lg sm:text-2xl font-black text-emerald-700 mt-0.5 truncate">{formatTaka(stats.totalCollected)}</div>
          <span className="text-[9px] sm:text-[10px] text-slate-400 truncate block">{activeInflows.length} Receipts</span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate block">Student Due</span>
          <div className="text-lg sm:text-2xl font-black text-rose-700 mt-0.5 truncate">{formatTaka(stats.totalDue)}</div>
          <span className="text-[9px] sm:text-[10px] text-slate-400 truncate block">Uncollected</span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate block">Expected Inflow</span>
          <div className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5 truncate">{formatTaka(stats.totalExpectedCollection)}</div>
          <span className="text-[9px] sm:text-[10px] text-slate-400 truncate block">Expected</span>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            {(['ALL', 'Cash', 'bKash', 'Nagad', 'Rocket'] as const).map((method) => (
              <button
                key={method}
                onClick={() => setSelectedMethod(method)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  selectedMethod === method
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {method}
              </button>
            ))}
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

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full min-w-[550px] text-left text-xs">
            <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Student / Particulars</th>
                <th className="p-3">Payment Type</th>
                <th className="p-3">Method</th>
                <th className="p-3">Recorded By</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInflows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    No payment collection receipts found.
                  </td>
                </tr>
              ) : (
                filteredInflows.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 text-slate-500">{txn.date}</td>
                    <td className="p-3 font-bold text-slate-900">
                      {txn.studentName || txn.note}
                      {txn.room && (
                        <span className="text-slate-400 font-normal ml-1">
                          ({txn.block}-{txn.room})
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{txn.type}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                        {txn.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{txn.recordedBy}</td>
                    <td className="p-3 text-right font-black text-emerald-700">
                      +{formatTaka(txn.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RecordPaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />
    </div>
  );
}
