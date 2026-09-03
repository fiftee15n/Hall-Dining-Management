'use client';

import React, { useState } from 'react';
import { useMess } from '@/context/MessContext';
import { Modal } from '@/components/ui/Modal';
import { Student } from '@/types';
import { getTodayDateString } from '@/lib/utils';
import { Check } from 'lucide-react';

interface AddGuestMealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddGuestMealModal({ isOpen, onClose }: AddGuestMealModalProps) {
  const { students, addGuestMeal } = useMess();

  const [guestName, setGuestName] = useState('');
  const [hostStudentId, setHostStudentId] = useState('');
  const [customHostName, setCustomHostName] = useState('');
  const [block, setBlock] = useState<Student['block']>('A');
  const [room, setRoom] = useState('203');
  const [mealType, setMealType] = useState<'lunch' | 'dinner'>('lunch');
  const [date, setDate] = useState(getTodayDateString());
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(80);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Due'>('Cash');
  const [note, setNote] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

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
    if (!guestName.trim()) return;

    const hostName =
      hostStudentId === 'custom' || !hostStudentId
        ? customHostName.trim() || 'General Guest'
        : students.find((s) => s.id === hostStudentId)?.name || 'General Guest';

    addGuestMeal({
      guestName: guestName.trim(),
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Guest Meal Voucher"
      subtitle="Issue dining tokens for guest visitors"
      maxWidth="md"
    >
      {isSuccess ? (
        <div className="py-6 text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Guest Meal Added!</h4>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Guest Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Abdullah Al Noman"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Host Resident Student</label>
            <select
              value={hostStudentId}
              onChange={(e) => handleStudentSelect(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="">Select resident student...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.block}-{s.room})
                </option>
              ))}
              <option value="custom">+ General Outside Guest</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Meal Type</label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setMealType('lunch')}
                  className={`flex-1 py-1.5 rounded-lg border font-bold text-center ${
                    mealType === 'lunch'
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Lunch
                </button>
                <button
                  type="button"
                  onClick={() => setMealType('dinner')}
                  className={`flex-1 py-1.5 rounded-lg border font-bold text-center ${
                    mealType === 'dinner'
                      ? 'bg-indigo-600 text-white border-indigo-700'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Dinner
                </button>
              </div>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                max="20"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-center"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Price per Meal (৳)</label>
              <input
                type="number"
                min="10"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-center"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
            <div className="grid grid-cols-5 gap-1">
              {(['Cash', 'bKash', 'Nagad', 'Rocket', 'Due'] as const).map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-1 rounded-md border text-xs font-bold text-center ${
                    paymentMethod === method
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs">
              Total: <strong className="text-slate-900">৳{quantity * unitPrice}</strong>
            </div>
            <div className="flex gap-2">
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
                Confirm Voucher
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
