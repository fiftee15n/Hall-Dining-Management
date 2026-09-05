'use client';

import React, { useState } from 'react';
import { useMess } from '@/context/MessContext';
import { Modal } from '@/components/ui/Modal';
import { ExpenseCategory } from '@/types';
import { getTodayDateString, formatTaka } from '@/lib/utils';
import { Check, ShoppingCart, Tag, Store, Calendar, FileText } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
  const { addExpense } = useMess();

  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [totalCost, setTotalCost] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [category, setCategory] = useState<ExpenseCategory>('Grocery');
  const [purchasedBy, setPurchasedBy] = useState('Admin');
  const [vendor, setVendor] = useState('');
  const [memoNo, setMemoNo] = useState('');
  const [note, setNote] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const categories: ExpenseCategory[] = [
    'Grocery',
    'Meat',
    'Fish',
    'Vegetable',
    'Spices & Oil',
    'Gas & Utility',
    'Labor & Cook',
    'Feast Special',
    'Others',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.trim() || !totalCost || isNaN(Number(totalCost))) return;

    addExpense({
      item: item.trim(),
      quantity: quantity.trim() || '1',
      unit: unit.trim() || 'item',
      totalCost: Number(totalCost),
      date,
      category,
      purchasedBy: purchasedBy.trim() || 'Admin',
      vendor: vendor.trim() || undefined,
      memoNo: memoNo.trim() || undefined,
      note: note.trim() || undefined,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setItem('');
      setQuantity('');
      setTotalCost('');
      setVendor('');
      setMemoNo('');
      setNote('');
      onClose();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Bazar / Market Expense"
      subtitle="Record dining grocery, kitchen provisions or labor wages"
      maxWidth="lg"
    >
      {isSuccess ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <Check className="w-7 h-7 stroke-[3]" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Expense Recorded!</h4>
            <p className="text-xs text-slate-500 mt-1">
              Bazar voucher has been logged to expense log and debited from cashbook.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Item Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Item Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Broiler Chicken, Miniket Rice, Potato, Soybean Oil"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium"
            />
          </div>

          {/* Quantity, Unit & Total Cost Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Quantity
              </label>
              <input
                type="text"
                placeholder="e.g. 15"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all cursor-pointer"
              >
                <option value="kg">kg (Kilogram)</option>
                <option value="litres">litres</option>
                <option value="sack">sack (ব্যাগ/বস্তা)</option>
                <option value="pcs">pcs (পিস)</option>
                <option value="shift">shift (কুক মজুরি)</option>
                <option value="doz">doz (ডজন)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Total Cost (৳) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-base">
                  ৳
                </div>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="2500"
                  value={totalCost}
                  onChange={(e) => setTotalCost(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 font-bold text-base text-rose-700 bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>
          </div>

          {/* Purchased By & Vendor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Purchased By / Manager
              </label>
              <input
                type="text"
                value={purchasedBy}
                onChange={(e) => setPurchasedBy(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Vendor / Market / Shop
              </label>
              <input
                type="text"
                placeholder="e.g. JU Gate Bazar / Salna Poultry"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>
          </div>

          {/* Memo & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Memo / Voucher No (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. VCH-084"
                value={memoNo}
                onChange={(e) => setMemoNo(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Note / Description (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Purchased for Thursday night feast preparation"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!item.trim() || !totalCost || isNaN(Number(totalCost))}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm shadow-xs transition"
            >
              Save Expense ({totalCost ? formatTaka(Number(totalCost)) : '৳0'})
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

