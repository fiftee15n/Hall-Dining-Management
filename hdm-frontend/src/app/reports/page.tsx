'use client';

import React, { useState } from 'react';
import { useMess } from '@/context/MessContext';
import { formatTaka, getTodayDateString, formatDateReadable } from '@/lib/utils';
import {
  FileText,
  Printer,
  Calendar,
  Utensils,
  CreditCard,
  ShoppingCart,
  Users,
} from 'lucide-react';

export default function ReportsPage() {
  const { students, attendance, expenses, activePeriod, stats, settings } = useMess();
  const [reportType, setReportType] = useState<'due_sheet' | 'kitchen_sheet' | 'bazar_sheet' | 'handover'>('due_sheet');

  const todayStr = getTodayDateString();
  const dueStudents = students.filter((s) => s.balanceDue > 0);
  const todayAttendance = attendance.filter((a) => a.date === todayStr);
  const lunchCount = todayAttendance.filter((a) => a.mealType === 'lunch').length;
  const dinnerCount = todayAttendance.filter((a) => a.mealType === 'dinner').length;
  const periodExpenses = expenses.filter((e) => e.periodId === activePeriod?.id);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Reports & Notice Sheets</h1>
          <p className="text-xs text-slate-500">
            Print-ready notice board sheets, kitchen slips, and handover statements
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print This Sheet</span>
        </button>
      </div>

      {/* Report Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 no-print">
        <button
          onClick={() => setReportType('due_sheet')}
          className={`p-3 rounded-xl border text-left transition text-xs font-bold ${
            reportType === 'due_sheet'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Notice Board Dues & Payable Sheet</span>
        </button>

        <button
          onClick={() => setReportType('kitchen_sheet')}
          className={`p-3 rounded-xl border text-left transition text-xs font-bold ${
            reportType === 'kitchen_sheet'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Kitchen Meal Slip</span>
        </button>

        <button
          onClick={() => setReportType('bazar_sheet')}
          className={`p-3 rounded-xl border text-left transition text-xs font-bold ${
            reportType === 'bazar_sheet'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Bazar Expenditure Sheet</span>
        </button>

        <button
          onClick={() => setReportType('handover')}
          className={`p-3 rounded-xl border text-left transition text-xs font-bold ${
            reportType === 'handover'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Term Handover Statement</span>
        </button>
      </div>

      {/* Printable Sheet Box */}
      <div className="bg-white rounded-2xl border border-slate-300 p-8 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Printable Header */}
        <div className="text-center border-b pb-4 space-y-1">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">
            {settings.hallName}
          </h2>
          <p className="text-xs text-slate-600 font-medium">{settings.universityName}</p>
          <div className="text-xs font-bold text-slate-800 pt-1">
            {activePeriod?.name} ({activePeriod?.startDate} to {activePeriod?.endDate}) · Managed by: {activePeriod?.managedByTeam}
          </div>
        </div>

        {/* 1. Dues & Payable Sheet */}
        {reportType === 'due_sheet' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <h3 className="font-black text-slate-900 uppercase">
                  1. Dining Due Notice Sheet — Outstanding Balances
                </h3>
                <span className="text-slate-500">Date: {formatDateReadable(todayStr)}</span>
              </div>

              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 uppercase border-b border-slate-300 font-bold">
                  <tr>
                    <th className="p-2 border-r border-slate-300">Room</th>
                    <th className="p-2 border-r border-slate-300">Student Name</th>
                    <th className="p-2 border-r border-slate-300">Student ID</th>
                    <th className="p-2 border-r border-slate-300">Department</th>
                    <th className="p-2 text-right">Outstanding Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {dueStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-3 text-center text-slate-400 italic">
                        No outstanding student dues for this period.
                      </td>
                    </tr>
                  ) : (
                    dueStudents.map((std) => (
                      <tr key={std.id}>
                        <td className="p-2 border-r font-bold">{std.block}-{std.room}</td>
                        <td className="p-2 border-r font-medium">{std.name}</td>
                        <td className="p-2 border-r text-slate-600">{std.studentId}</td>
                        <td className="p-2 border-r text-slate-600">{std.department}</td>
                        <td className="p-2 text-right font-black text-rose-700">{formatTaka(std.balanceDue)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-slate-50 font-black border-t border-slate-300">
                  <tr>
                    <td colSpan={4} className="p-2 text-right">Total Outstanding Due:</td>
                    <td className="p-2 text-right text-rose-700">{formatTaka(stats.totalDue)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* 2. Payable to Students Sheet */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs">
                <h3 className="font-black text-slate-900 uppercase">
                  2. Mess Payable to Students — Change Shortages & Advances
                </h3>
                <span className="text-slate-500">Total Payable: {formatTaka(stats.studentReceivablesTotal)}</span>
              </div>

              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 uppercase border-b border-slate-300 font-bold">
                  <tr>
                    <th className="p-2 border-r border-slate-300">Room</th>
                    <th className="p-2 border-r border-slate-300">Student Name</th>
                    <th className="p-2 border-r border-slate-300">Student ID</th>
                    <th className="p-2 border-r border-slate-300">Department</th>
                    <th className="p-2 text-right">Payable Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {students.filter((s) => s.balanceReceivable > 0).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-3 text-center text-slate-400 italic">
                        No pending payables or refunds owed to students.
                      </td>
                    </tr>
                  ) : (
                    students
                      .filter((s) => s.balanceReceivable > 0)
                      .map((std) => (
                        <tr key={std.id}>
                          <td className="p-2 border-r font-bold">{std.block}-{std.room}</td>
                          <td className="p-2 border-r font-medium">{std.name}</td>
                          <td className="p-2 border-r text-slate-600">{std.studentId}</td>
                          <td className="p-2 border-r text-slate-600">{std.department}</td>
                          <td className="p-2 text-right font-black text-teal-800">{formatTaka(std.balanceReceivable)}</td>
                        </tr>
                      ))
                  )}
                </tbody>
                <tfoot className="bg-slate-50 font-black border-t border-slate-300">
                  <tr>
                    <td colSpan={4} className="p-2 text-right">Total Payable to Students:</td>
                    <td className="p-2 text-right text-teal-800">{formatTaka(stats.studentReceivablesTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* 2. Kitchen Sheet */}
        {reportType === 'kitchen_sheet' && (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-900 uppercase">
                Daily Kitchen Order Sheet ({formatDateReadable(todayStr)})
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-slate-300 rounded-xl">
                <span className="font-bold uppercase text-slate-700 block">☀️ Lunch Meal Order</span>
                <div className="text-3xl font-black text-slate-900 mt-2">{lunchCount} Plates</div>
                <p className="text-[11px] text-slate-500 mt-1">Serving Time: {settings.lunchTime}</p>
              </div>

              <div className="p-4 border border-slate-300 rounded-xl">
                <span className="font-bold uppercase text-slate-700 block">🌙 Dinner Meal Order</span>
                <div className="text-3xl font-black text-slate-900 mt-2">{dinnerCount} Plates</div>
                <p className="text-[11px] text-slate-500 mt-1">Serving Time: {settings.dinnerTime}</p>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
              <h4 className="font-bold text-slate-900 mb-1">Kitchen Instructions:</h4>
              <p className="text-slate-600 text-[11px]">
                Please prepare food according to the registered plate count above. Keep extra 5-10 portions for on-the-spot guest meal vouchers.
              </p>
            </div>
          </div>
        )}

        {/* 3. Bazar Sheet */}
        {reportType === 'bazar_sheet' && (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-900 uppercase">
                Bazar Expenditure Statement ({activePeriod?.name})
              </h3>
              <span className="text-slate-500">Total: {formatTaka(stats.totalExpense)}</span>
            </div>

            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 uppercase border-b border-slate-300 font-bold">
                <tr>
                  <th className="p-2 border-r">Date</th>
                  <th className="p-2 border-r">Item</th>
                  <th className="p-2 border-r">Category</th>
                  <th className="p-2 border-r">Qty</th>
                  <th className="p-2 border-r">Vendor / Memo</th>
                  <th className="p-2 text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {periodExpenses.map((exp) => (
                  <tr key={exp.id}>
                    <td className="p-2 border-r text-slate-500">{exp.date}</td>
                    <td className="p-2 border-r font-bold">{exp.item}</td>
                    <td className="p-2 border-r">{exp.category}</td>
                    <td className="p-2 border-r">{exp.quantity} {exp.unit || ''}</td>
                    <td className="p-2 border-r text-slate-600">{exp.vendor || exp.purchasedBy}</td>
                    <td className="p-2 text-right font-bold text-slate-900">{formatTaka(exp.totalCost)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-black border-t border-slate-300">
                <tr>
                  <td colSpan={5} className="p-2 text-right">Total Bazar Cost:</td>
                  <td className="p-2 text-right text-rose-700">{formatTaka(stats.totalExpense)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* 4. Handover Statement */}
        {reportType === 'handover' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-black text-slate-900 uppercase text-center text-sm">
              Term Closing & Financial Handover Statement
            </h3>

            <div className="border border-slate-300 rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span>1. Opening Balance Received:</span>
                <strong>{formatTaka(activePeriod?.openingBalance || 0)}</strong>
              </div>
              <div className="flex justify-between">
                <span>2. Total Money Collected:</span>
                <strong>+{formatTaka(stats.totalCollected)}</strong>
              </div>
              <div className="flex justify-between">
                <span>3. Total Operating Bazar Expenses:</span>
                <strong>-{formatTaka(stats.totalExpense)}</strong>
              </div>
              <div className="flex justify-between font-bold text-slate-900 border-t pt-2 text-sm">
                <span>4. Handover Cash Balance:</span>
                <span className="text-emerald-700">{formatTaka(stats.currentBalance)}</span>
              </div>
            </div>

            <div className="pt-12 grid grid-cols-3 text-center text-xs">
              <div className="border-t border-slate-400 pt-2 font-bold">Mess Manager / Admin</div>
              <div className="border-t border-slate-400 pt-2 font-bold">Accountant / Auditor</div>
              <div className="border-t border-slate-400 pt-2 font-bold">Hall Provost</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
