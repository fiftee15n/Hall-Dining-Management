'use client';

import React, { useState } from 'react';
import { useMess } from '@/context/MessContext';
import { Modal } from '@/components/ui/Modal';
import { ExpenseCategory } from '@/types';
import { getTodayDateString } from '@/lib/utils';
import { Check } from 'lucide-react';

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
      maxWidth="md"
    >
      {isSuccess ? (
        <div className="py-6 text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Expense Recorded!</h4>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Item Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Chicken, Miniket Rice, Vegetables"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Quantity</label>
              <input
                type="text"
                placeholder="e.g. 15"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-2 py-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="kg">kg</option>
                <option value="litres">litres</option>
                <option value="sack">sack</option>
                <option value="pcs">pcs</option>
                <option value="shift">shift</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Total Cost (৳) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="৳ 2500"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Purchased By</label>
              <input
                type="text"
                value={purchasedBy}
                onChange={(e) => setPurchasedBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Vendor / Market</label>
              <input
                type="text"
                placeholder="e.g. JU Gate Market"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold"
            >
              Save (৳{totalCost || '0'})
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
