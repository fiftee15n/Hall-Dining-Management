'use client';

import React, { useState } from 'react';
import { useMess } from '@/context/MessContext';
import { Student } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { formatTaka } from '@/lib/utils';
import { RecordPaymentModal } from './RecordPaymentModal';
import { User, Phone, GraduationCap, Building, CreditCard, Calendar, CheckCircle2 } from 'lucide-react';

interface StudentProfileDrawerProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StudentProfileDrawer({ student, isOpen, onClose }: StudentProfileDrawerProps) {
  const { bookings, attendance, transactions, receivables, settleReceivable, activePeriodId } = useMess();
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
  const studentReceivables = receivables.filter(
    (r) => r.studentId === student.id && r.periodId === activePeriodId && r.status === 'pending'
  );

  const mealsTakenCount = studentAttendance.filter((a) => a.isTaken).length;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={student.name}
        subtitle={`Room ${student.block}-${student.room} · ${student.department}`}
        maxWidth="xl"
      >
        <div className="space-y-5 text-sm">
          {/* Top Profile Card */}
          <div className="p-5 bg-slate-900 text-white rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center font-bold text-lg border border-white/10">
                {student.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{student.name}</h3>
                <p className="text-slate-300 text-xs mt-0.5">
                  ID: {student.studentId} · Batch {student.batch} · Room {student.block}-{student.room}
                </p>
                <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{student.phone}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="text-left sm:text-right bg-slate-800/90 px-3.5 py-2 rounded-xl border border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Due Balance</span>
                <span className={`text-base font-black ${student.balanceDue > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {formatTaka(student.balanceDue)}
                </span>
              </div>

              <div className="text-left sm:text-right bg-slate-800/90 px-3.5 py-2 rounded-xl border border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Payable to Student</span>
                <span className={`text-base font-black ${student.balanceReceivable > 0 ? 'text-teal-400' : 'text-slate-300'}`}>
                  {formatTaka(student.balanceReceivable)}
                </span>
              </div>

              {student.balanceDue > 0 && (
                <button
                  onClick={() => setShowPayModal(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition shadow-xs"
                >
                  Pay Due
                </button>
              )}
            </div>
          </div>

          {/* Bookings Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">Active Period Bookings</h4>
              <span className="text-xs font-semibold text-slate-500">{studentBookings.length} booking(s)</span>
            </div>
            {studentBookings.length === 0 ? (
              <p className="text-slate-400 text-xs italic bg-slate-50 p-4 rounded-xl border border-slate-200">
                No meal bookings registered for this period.
              </p>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">Date Range</th>
                      <th className="p-3">Meals</th>
                      <th className="p-3">Total Cost</th>
                      <th className="p-3">Paid Amount</th>
                      <th className="p-3">Settlement Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70">
                        <td className="p-3 font-semibold text-slate-800">{b.startDate} to {b.endDate}</td>
                        <td className="p-3 text-slate-600">{b.totalLunchCount}L + {b.totalDinnerCount}D</td>
                        <td className="p-3 font-bold text-slate-900">{formatTaka(b.totalAmount)}</td>
                        <td className="p-3 text-emerald-700 font-bold">{formatTaka(b.paidAmount)}</td>
                        <td className="p-3">
                          {b.dueAmount > 0 ? (
                            <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                              Due {formatTaka(b.dueAmount)}
                            </span>
                          ) : (b.payableAmount || 0) > 0 ? (
                            <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                              Payable {formatTaka(b.payableAmount || 0)}
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Cleared</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pending Payables / Refunds */}
          {studentReceivables.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-teal-950 text-sm">
                Pending Payables & Change Refunds ({studentReceivables.length})
              </h4>
              <div className="border border-teal-200 rounded-2xl overflow-hidden bg-teal-50/30 shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-teal-50 text-[11px] font-bold text-teal-900 uppercase border-b border-teal-200">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Particulars / Reason</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-teal-100">
                    {studentReceivables.map((r) => (
                      <tr key={r.id} className="hover:bg-teal-50/60">
                        <td className="p-3 text-slate-600">{r.date}</td>
                        <td className="p-3 text-slate-800 font-medium">{r.reason}</td>
                        <td className="p-3 font-bold text-teal-900">{formatTaka(r.amount)}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => settleReceivable(r.id, 'Cash', 'Direct settlement')}
                            className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-lg text-xs transition shadow-xs"
                          >
                            Settle (Cash)
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transactions History */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">Payment & Transaction History</h4>
            {studentTxns.length === 0 ? (
              <p className="text-slate-400 text-xs italic bg-slate-50 p-4 rounded-xl border border-slate-200">
                No transactions recorded for this student yet.
              </p>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Particulars / Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentTxns.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/70">
                        <td className="p-3 text-slate-600 font-medium">{t.date}</td>
                        <td className="p-3 font-bold text-emerald-700">{formatTaka(t.amount)}</td>
                        <td className="p-3 text-slate-700 font-semibold">{t.paymentMethod}</td>
                        <td className="p-3 text-slate-500 truncate max-w-xs">{t.note || '—'}</td>
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

