'use client';

import React, { useState, useEffect } from 'react';
import { useMess } from '@/context/MessContext';
import { Modal } from '@/components/ui/Modal';
import { Check, Wallet, AlertCircle } from 'lucide-react';
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

  const quickAmounts = [500, 1000, 1500, 2000];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Dining Payment / Clear Due"
      subtitle="Receive dining fees from resident students"
      maxWidth="lg"
    >
      {isSuccess ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <Check className="w-7 h-7 stroke-[3]" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Payment Successfully Logged!</h4>
            <p className="text-xs text-slate-500 mt-1">
              Transaction has been recorded to cashbook ledger and student account updated.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Student Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Resident Student <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  const s = students.find((std) => std.id === e.target.value);
                  if (s && s.balanceDue > 0) setAmount(String(s.balanceDue));
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all cursor-pointer"
              >
                <option value="">Choose resident student...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.block}-{s.room}) {s.balanceDue > 0 ? `— Due ৳${s.balanceDue}` : '— Clear'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Student Information Card */}
          {selectedStudent && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">
                    {selectedStudent.name}{' '}
                    <span className="text-xs font-semibold text-slate-500">
                      (Room {selectedStudent.block}-{selectedStudent.room})
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">
                    ID: {selectedStudent.studentId} · {selectedStudent.department}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Due Balance</span>
                  <span className={`text-sm font-black ${selectedStudent.balanceDue > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                    ৳{selectedStudent.balanceDue}
                  </span>
                </div>
                <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Payable to Student</span>
                  <span className={`text-sm font-black ${selectedStudent.balanceReceivable > 0 ? 'text-teal-700' : 'text-slate-400'}`}>
                    ৳{selectedStudent.balanceReceivable}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Amount Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Payment Amount (৳) <span className="text-rose-500">*</span>
              </label>
              {selectedStudent && selectedStudent.balanceDue > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(String(selectedStudent.balanceDue))}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
                >
                  Fill Full Due (৳{selectedStudent.balanceDue})
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-base">
                ৳
              </div>
              <input
                type="number"
                required
                min="1"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 font-bold text-base text-slate-900 bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>

            {/* Quick Amount Suggestion Pills */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Quick:</span>
              {selectedStudent && selectedStudent.balanceDue > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(String(selectedStudent.balanceDue))}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition"
                >
                  Full Due (৳{selectedStudent.balanceDue})
                </button>
              )}
              {quickAmounts.map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => setAmount(String(q))}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                >
                  ৳{q}
                </button>
              ))}
            </div>
          </div>

          {/* Overpayment Warning / Auto-credit banner */}
          {selectedStudent && Number(amount) > selectedStudent.balanceDue && (
            <div className="p-3 bg-teal-50/80 border border-teal-200 rounded-xl text-teal-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Overpayment Notice:</strong> ৳{selectedStudent.balanceDue} will clear the student&apos;s current due, and the remaining{' '}
                <strong className="text-teal-700">{formatTaka(Number(amount) - selectedStudent.balanceDue)}</strong> will automatically be credited as <strong>Payable to Student (Change Refund)</strong>.
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Cash', 'bKash', 'Nagad', 'Rocket'] as const).map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    paymentMethod === method
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50/60 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>{method}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note / Remarks Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Note / Reference (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Received for 10-days meal dues via counter"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
            />
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
              disabled={!studentId || !amount || Number(amount) <= 0}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm shadow-xs transition"
            >
              Confirm Receipt (৳{amount || '0'})
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
