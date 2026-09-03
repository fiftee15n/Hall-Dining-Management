'use client';

import React, { useState } from 'react';
import { useMess } from '@/context/MessContext';
import { Student } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { formatTaka } from '@/lib/utils';
import { RecordPaymentModal } from './RecordPaymentModal';

interface StudentProfileDrawerProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StudentProfileDrawer({ student, isOpen, onClose }: StudentProfileDrawerProps) {
  const { bookings, attendance, transactions, activePeriodId } = useMess();
  const [showPayModal, setShowPayModal] = useState(false);

  if (!student) return null;

  const studentBookings = bookings.filter(
    (b) => b.studentId === student.id && b.periodId === activePeriodId
  );
  const studentAttendance = attendance.filter(
    (a) => a.studentId === student.id && a.periodId === activePeriodId
  );
  const studentTxns = transactions.filter(
    (t) => t.studentId === student.id && t.periodId === activePeriodId
  );

  const mealsTakenCount = studentAttendance.filter((a) => a.isTaken).length;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={student.name}
        subtitle={`Room ${student.block}-${student.room} · ${student.department}`}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          {/* Top Profile Card */}
          <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold">{student.name}</h3>
              <p className="text-slate-400 text-[11px]">ID: {student.studentId} · Batch {student.batch}</p>
              <p className="text-slate-300 text-[11px] mt-0.5">Phone: {student.phone}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Due Balance</span>
                <span className={`text-sm font-black ${student.balanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {formatTaka(student.balanceDue)}
                </span>
              </div>
              {student.balanceDue > 0 && (
                <button
                  onClick={() => setShowPayModal(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                >
                  Pay Due
                </button>
              )}
            </div>
          </div>

          {/* Bookings */}
          <div>
            <h4 className="font-bold text-slate-900 mb-1.5">Active Period Bookings</h4>
            {studentBookings.length === 0 ? (
              <p className="text-slate-400 italic">No bookings registered for this period.</p>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-2">Dates</th>
                      <th className="p-2">Meals</th>
                      <th className="p-2">Total</th>
                      <th className="p-2">Paid</th>
                      <th className="p-2">Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentBookings.map((b) => (
                      <tr key={b.id}>
                        <td className="p-2 font-medium">{b.startDate} to {b.endDate}</td>
                        <td className="p-2 text-slate-600">{b.totalLunchCount}L + {b.totalDinnerCount}D</td>
                        <td className="p-2 font-bold">{formatTaka(b.totalAmount)}</td>
                        <td className="p-2 text-emerald-700 font-bold">{formatTaka(b.paidAmount)}</td>
                        <td className="p-2 text-rose-700 font-bold">{formatTaka(b.dueAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Transactions */}
          <div>
            <h4 className="font-bold text-slate-900 mb-1.5">Payment History</h4>
            {studentTxns.length === 0 ? (
              <p className="text-slate-400 italic">No transactions recorded.</p>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Amount</th>
                      <th className="p-2">Method</th>
                      <th className="p-2">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentTxns.map((t) => (
                      <tr key={t.id}>
                        <td className="p-2 text-slate-500">{t.date}</td>
                        <td className="p-2 font-bold text-emerald-700">{formatTaka(t.amount)}</td>
                        <td className="p-2 text-slate-700">{t.paymentMethod}</td>
                        <td className="p-2 text-slate-500 truncate max-w-xs">{t.note || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Modal>

      <RecordPaymentModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        defaultStudentId={student.id}
      />
    </>
  );
}
