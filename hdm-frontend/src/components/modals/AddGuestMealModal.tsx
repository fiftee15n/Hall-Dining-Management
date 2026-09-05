'use client';

import React, { useState } from 'react';
import { useMess } from '@/context/MessContext';
import { Modal } from '@/components/ui/Modal';
import { Student } from '@/types';
import { getTodayDateString, formatTaka } from '@/lib/utils';
import { Check, Sun, Moon, Plus, Minus, Users, Wallet, Ticket } from 'lucide-react';

interface AddGuestMealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddGuestMealModal({ isOpen, onClose }: AddGuestMealModalProps) {
  const { students, addGuestMeal, activePeriod } = useMess();

  const currentLunchPrice = activePeriod?.lunchPrice || 35;
  const currentDinnerPrice = activePeriod?.dinnerPrice || 40;

  const [guestName, setGuestName] = useState('');
  const [hostStudentId, setHostStudentId] = useState('');
  const [customHostName, setCustomHostName] = useState('');
  const [block, setBlock] = useState<Student['block']>('A');
  const [room, setRoom] = useState('203');
  const [mealType, setMealType] = useState<'lunch' | 'dinner'>('lunch');
  const [date, setDate] = useState(getTodayDateString());
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(currentLunchPrice);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Due'>('Cash');
  const [note, setNote] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync unit price when mealType or activePeriod changes
  const handleMealTypeChange = (type: 'lunch' | 'dinner') => {
    setMealType(type);
    setUnitPrice(type === 'lunch' ? currentLunchPrice : currentDinnerPrice);
  };

  const handleStudentSelect = (stdId: string) => {
    setHostStudentId(stdId);
    if (stdId === 'custom') return;
    const found = students.find((s) => s.id === stdId);
    if (found) {
      setBlock(found.block);
      setRoom(found.room);
      setCustomHostName(found.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hostName =
      hostStudentId === 'custom' || !hostStudentId
        ? customHostName.trim() || 'General Guest'
        : students.find((s) => s.id === hostStudentId)?.name || 'General Guest';

    const finalGuestName =
      guestName.trim() ||
      (hostStudentId && hostName !== 'General Guest'
        ? `Guest of ${hostName}`
        : 'Guest Visitor');

    addGuestMeal({
      guestName: finalGuestName,
      hostStudentName: hostName,
      block,
      room,
      mealType,
      date,
      quantity,
      unitPrice,
      paymentMethod,
      note: note.trim() || undefined,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setGuestName('');
      setNote('');
      onClose();
    }, 600);
  };

  const totalAmount = quantity * unitPrice;


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Issue Guest Meal Token"
      subtitle="Generate meal vouchers for visiting guests and external visitors"
      maxWidth="lg"
    >
      {isSuccess ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <Check className="w-7 h-7 stroke-[3]" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Guest Voucher Issued!</h4>
            <p className="text-xs text-slate-500 mt-1">
              Guest meal registered and token added to today&apos;s dining counter sheet.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Guest Name (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Guest Visitor Name <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Leave empty for default voucher
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g. Abdullah Al Noman (Optional - defaults to Guest / Guest of Host)"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium"
            />
          </div>

          {/* Host Resident Student Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Host Resident Student (Optional Reference)
            </label>
            <select
              value={hostStudentId}
              onChange={(e) => handleStudentSelect(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all cursor-pointer"
            >
              <option value="">Select resident host student...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.block}-{s.room})
                </option>
              ))}
              <option value="custom">+ General Outside Guest / Hall Staff</option>
            </select>
          </div>

          {/* Meal Shift & Date Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Meal Shift (Matches Student Rate)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleMealTypeChange('lunch')}
                  className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition ${
                    mealType === 'lunch'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Lunch (৳{currentLunchPrice})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMealTypeChange('dinner')}
                  className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition ${
                    mealType === 'dinner'
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>Dinner (৳{currentDinnerPrice})</span>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Dining Date
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

          {/* Quantity & Unit Price with calculation banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Token Quantity (Meals)
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-l-xl text-slate-700 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full py-2.5 border-y border-slate-300 text-center font-bold text-base text-slate-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-r-xl text-slate-700 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Price per Meal (৳)
                </label>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  Same as {mealType === 'lunch' ? 'Lunch' : 'Dinner'}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-base">
                  ৳
                </div>
                <input
                  type="number"
                  min="1"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 font-bold text-base text-slate-900 bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(['Cash', 'bKash', 'Nagad', 'Rocket', 'Due'] as const).map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                    paymentMethod === method
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Note Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Department guest visitor voucher"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
            />
          </div>

          {/* Total Calculation Banner & Action Footer */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="bg-slate-100 px-4 py-2 rounded-xl flex items-center gap-2">
              <Ticket className="w-4 h-4 text-slate-700" />
              <span className="text-xs text-slate-600 font-medium">
                Total Voucher Price ({quantity} × ৳{unitPrice}):
              </span>
              <span className="text-base font-black text-slate-900">{formatTaka(totalAmount)}</span>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={quantity < 1}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm shadow-xs transition"
              >
                Issue Token ({formatTaka(totalAmount)})
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}

