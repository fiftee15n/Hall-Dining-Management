'use client';

import React, { useState, useEffect } from 'react';
import { useMess } from '@/context/MessContext';
import { Modal } from '@/components/ui/Modal';
import { Check } from 'lucide-react';
import { formatTaka } from '@/lib/utils';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStudentId?: string;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  defaultStudentId,
}: RecordPaymentModalProps) {
  const { students, recordManualPayment } = useMess();

  const [studentId, setStudentId] = useState(defaultStudentId || '');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Rocket'>('Cash');
  const [note, setNote] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (defaultStudentId) setStudentId(defaultStudentId);
  }, [defaultStudentId]);

  const selectedStudent = students.find((s) => s.id === studentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !amount || Number(amount) <= 0) return;

    recordManualPayment({
      studentId,
      amount: Number(amount),
      paymentMethod,
      note: note.trim() || undefined,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setAmount('');
      setNote('');
      onClose();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Dining Payment / Clear Due"
      subtitle="Receive dining fees from resident students"
      maxWidth="md"
    >
      {isSuccess ? (
        <div className="py-6 text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Payment Logged!</h4>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Select Student <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                const s = students.find((std) => std.id === e.target.value);
                if (s && s.balanceDue > 0) setAmount(String(s.balanceDue));
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="">Choose resident student...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.block}-{s.room}) {s.balanceDue > 0 ? `— Due ৳${s.balanceDue}` : '— Clear'}
                </option>
              ))}
            </select>
          </div>

          {selectedStudent && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">
                  {selectedStudent.name} (Room {selectedStudent.block}-{selectedStudent.room})
                </p>
                <p className="text-[10px] text-slate-500">{selectedStudent.department}</p>
              </div>
              <div className="flex gap-3 text-right">
                <div>
                  <span className="text-[10px] text-slate-500 block">Due:</span>
                  <span className={`font-bold ${selectedStudent.balanceDue > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                    ৳{selectedStudent.balanceDue}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Payable:</span>
                  <span className={`font-bold ${selectedStudent.balanceReceivable > 0 ? 'text-teal-700' : 'text-slate-400'}`}>
                    ৳{selectedStudent.balanceReceivable}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Payment Amount (৳) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
            />
          </div>

          {selectedStudent && Number(amount) > selectedStudent.balanceDue && (
            <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-lg text-teal-800 text-[11px] font-medium">
              💡 Overpayment Alert: ৳{selectedStudent.balanceDue} will clear the student&apos;s current due, and the remaining <strong>{formatTaka(Number(amount) - selectedStudent.balanceDue)}</strong> will automatically be recorded as <strong>Payable to Student</strong> (Change Refund).
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
            <div className="grid grid-cols-4 gap-2">
              {(['Cash', 'bKash', 'Nagad', 'Rocket'] as const).map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-1.5 rounded-lg border font-bold text-xs ${
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

          <div>
            <label className="block font-medium text-slate-700 mb-1">Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Cleared 5-days meal due"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
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
              Confirm Payment (৳{amount || '0'})
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
