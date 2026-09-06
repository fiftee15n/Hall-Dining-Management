'use client';

import React, { useState, useMemo } from 'react';
import { useMess } from '@/context/MessContext';
import { formatTaka } from '@/lib/utils';
import { ExpenseCategory } from '@/types';
import {
  ShoppingCart,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { AddExpenseModal } from '@/components/modals/AddExpenseModal';

export default function ExpensesPage() {
  const { expenses, deleteExpense, activePeriodId, stats } = useMess();

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const activeExpenses = useMemo(() => {
    return expenses.filter((e) => e.periodId === activePeriodId);
  }, [expenses, activePeriodId]);

  const categories: string[] = [
    'ALL',
    'Grocery',
    'Meat',
    'Fish',
    'Vegetable',
    'Spices & Oil',
    'Labor & Cook',
    'Gas & Utility',
  ];

  const filteredExpenses = useMemo(() => {
    return activeExpenses.filter((e) => {
      const matchCat = selectedCategory === 'ALL' || e.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        e.item.toLowerCase().includes(q) ||
        e.purchasedBy.toLowerCase().includes(q) ||
        (e.vendor && e.vendor.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [activeExpenses, selectedCategory, searchQuery]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Market / Bazar Expenses</h1>
          <p className="text-xs text-slate-500">
            Daily grocery, meat, fish, and cook labor payouts
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Bazar Expense</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate block">Total Bazar</span>
          <div className="text-lg sm:text-2xl font-black text-rose-700 mt-0.5 truncate">{formatTaka(stats.totalExpense)}</div>
          <span className="text-[9px] sm:text-[10px] text-slate-400 truncate block">{activeExpenses.length} Memos</span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate block">Today&apos;s Bazar</span>
          <div className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5 truncate">{formatTaka(stats.todayExpense)}</div>
          <span className="text-[9px] sm:text-[10px] text-slate-400 truncate block">Today Outflow</span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate block">Cash in Hand</span>
          <div className="text-lg sm:text-2xl font-black text-emerald-700 mt-0.5 truncate">{formatTaka(stats.currentBalance)}</div>
          <span className="text-[9px] sm:text-[10px] text-emerald-600 font-bold truncate block">Liquid Cash</span>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-60 flex-shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Item or Vendor..."
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
                <th className="p-3">Item Description</th>
                <th className="p-3">Category</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Vendor / Purchaser</th>
                <th className="p-3 text-right">Cost</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 text-slate-500">{exp.date}</td>
                    <td className="p-3 font-bold text-slate-900">
                      {exp.item}
                      {exp.memoNo && <span className="text-[10px] text-slate-400 block">Memo #{exp.memoNo}</span>}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700">{exp.quantity} {exp.unit || ''}</td>
                    <td className="p-3 text-slate-600">
                      {exp.purchasedBy} {exp.vendor ? `· ${exp.vendor}` : ''}
                    </td>
                    <td className="p-3 text-right font-black text-rose-700">
                      {formatTaka(exp.totalCost)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Delete expense record for ${exp.item}?`)) {
                            deleteExpense(exp.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddExpenseModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}
