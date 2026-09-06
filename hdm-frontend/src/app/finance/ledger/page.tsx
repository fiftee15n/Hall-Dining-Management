'use client';

import React, { useMemo } from 'react';
import { useMess } from '@/context/MessContext';
import { formatTaka } from '@/lib/utils';
import {
  BookOpen,
  Printer,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';

export default function CashLedgerPage() {
  const { transactions, activePeriodId, activePeriod, stats } = useMess();

  const activeTxns = useMemo(() => {
    return transactions.filter((t) => t.periodId === activePeriodId);
  }, [transactions, activePeriodId]);

  // Compute running balance
  const ledgerRows = useMemo(() => {
    let running = 0;
    return activeTxns.map((t) => {
      if (t.flow === 'inflow') {
        running += t.amount;
      } else {
        running -= t.amount;
      }
      return {
        ...t,
        runningBalance: running,
      };
    });
  }, [activeTxns]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Master Cashbook Ledger</h1>
          <p className="text-xs text-slate-500">
            Double-entry journal of all dining inflows and outflows with running balances
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Cashbook</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate block">Total Inflows (+)</span>
          <div className="text-lg sm:text-2xl font-black text-emerald-700 mt-0.5 truncate">{formatTaka(stats.totalCollected + (activePeriod?.openingBalance || 0))}</div>
          <span className="text-[9px] sm:text-[10px] text-slate-400 truncate block">Collections</span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate block">Total Outflows (-)</span>
          <div className="text-lg sm:text-2xl font-black text-rose-700 mt-0.5 truncate">{formatTaka(stats.totalExpense)}</div>
          <span className="text-[9px] sm:text-[10px] text-slate-400 truncate block">Bazar & Costs</span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate block">Cash in Hand</span>
          <div className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5 truncate">{formatTaka(stats.currentBalance)}</div>
          <span className="text-[9px] sm:text-[10px] text-emerald-600 font-bold truncate block">Verified Balance</span>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full min-w-[620px] text-left text-xs">
            <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Type</th>
                <th className="p-3">Particulars / Student</th>
                <th className="p-3">Method</th>
                <th className="p-3 text-right">Debit / Inflow (+)</th>
                <th className="p-3 text-right">Credit / Outflow (-)</th>
                <th className="p-3 text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledgerRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No transactions recorded in this period.
                  </td>
                </tr>
              ) : (
                ledgerRows.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 text-slate-500">{t.date}</td>
                    <td className="p-3 font-semibold text-slate-700">{t.type}</td>
                    <td className="p-3 font-medium text-slate-900">
                      {t.studentName || t.note}
                      {t.room && (
                        <span className="text-slate-400 font-normal ml-1">
                          ({t.block}-{t.room})
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600">{t.paymentMethod}</td>
                    <td className="p-3 text-right font-bold text-emerald-700">
                      {t.flow === 'inflow' ? formatTaka(t.amount) : '—'}
                    </td>
                    <td className="p-3 text-right font-bold text-rose-700">
                      {t.flow === 'outflow' ? formatTaka(t.amount) : '—'}
                    </td>
                    <td className="p-3 text-right font-black text-slate-900">
                      {formatTaka(t.runningBalance)}
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
