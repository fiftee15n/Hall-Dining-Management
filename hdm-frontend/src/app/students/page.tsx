'use client';

import React, { useState, useMemo } from 'react';
import { useMess } from '@/context/MessContext';
import { Student } from '@/types';
import { formatTaka } from '@/lib/utils';
import {
  Users,
  Search,
  Plus,
  Upload,
} from 'lucide-react';
import { StudentProfileDrawer } from '@/components/modals/StudentProfileDrawer';
import { Modal } from '@/components/ui/Modal';
import { ImportStudentsCsvModal } from '@/components/modals/ImportStudentsCsvModal';

export default function StudentsDirectoryPage() {
  const { students, addStudent } = useMess();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<string>('ALL');
  const [balanceFilter, setBalanceFilter] = useState<'ALL' | 'DUE' | 'PAYABLE'>('ALL');
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<Student | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showImportCsvModal, setShowImportCsvModal] = useState(false);

  // New Student Form
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [block, setBlock] = useState<Student['block']>('A');
  const [room, setRoom] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [batch, setBatch] = useState('50');

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchBlock = selectedBlock === 'ALL' || s.block === selectedBlock;
      const matchBalance =
        balanceFilter === 'ALL' ||
        (balanceFilter === 'DUE' && s.balanceDue > 0) ||
        (balanceFilter === 'PAYABLE' && s.balanceReceivable > 0);
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.room.toLowerCase().includes(q) ||
        `${s.block}-${s.room}`.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q);
      return matchBlock && matchBalance && matchQuery;
    });
  }, [students, selectedBlock, balanceFilter, searchQuery]);

  const dueStudentsCount = useMemo(() => students.filter((s) => s.balanceDue > 0).length, [students]);
  const payableStudentsCount = useMemo(() => students.filter((s) => s.balanceReceivable > 0).length, [students]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !room.trim()) return;

    addStudent({
      name: name.trim(),
      studentId: studentId.trim() || `2024-${Math.floor(Math.random() * 900 + 100)}`,
      block,
      room: room.trim(),
      phone: phone.trim() || '01700-000000',
      department: department.trim() || 'General Department',
      batch: batch.trim() || '50',
      status: 'active',
    });

    setName('');
    setStudentId('');
    setRoom('');
    setPhone('');
    setDepartment('');
    setShowAddStudentModal(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Resident Students Directory</h1>
          <p className="text-xs text-slate-500">
            Database of hall residents across Blocks A, B, C, D ({students.length} students)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportCsvModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition border border-slate-200"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => setShowAddStudentModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['ALL', 'A', 'B', 'C', 'D'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBlock(b)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    selectedBlock === b
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {b === 'ALL' ? 'All Blocks' : `Block ${b}`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setBalanceFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  balanceFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setBalanceFilter('DUE')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  balanceFilter === 'DUE'
                    ? 'bg-white text-rose-700 shadow-2xs'
                    : 'text-slate-600 hover:text-rose-600'
                }`}
              >
                With Dues ({dueStudentsCount})
              </button>
              <button
                onClick={() => setBalanceFilter('PAYABLE')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  balanceFilter === 'PAYABLE'
                    ? 'bg-white text-teal-800 shadow-2xs'
                    : 'text-slate-600 hover:text-teal-700'
                }`}
              >
                With Payable ({payableStudentsCount})
              </button>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Student Name, Room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">Room / Block</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Student ID</th>
                <th className="p-3">Department & Batch</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Dues & Payable</th>
                <th className="p-3 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs">No resident students found</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Add students individually or import using a CSV file.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        onClick={() => setShowImportCsvModal(true)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs transition"
                      >
                        Import CSV
                      </button>
                      <button
                        onClick={() => setShowAddStudentModal(true)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition"
                      >
                        + Add Student
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => (
                  <tr
                    key={std.id}
                    onClick={() => setSelectedStudentForDrawer(std)}
                    className="hover:bg-slate-50 cursor-pointer transition"
                  >
                    <td className="p-3 font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {std.block}-{std.room}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{std.name}</td>
                    <td className="p-3 text-slate-500">{std.studentId}</td>
                    <td className="p-3 text-slate-700">{std.department} ({std.batch})</td>
                    <td className="p-3 text-slate-600">{std.phone}</td>
                    <td className="p-3">
                      {std.balanceDue > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                          Due {formatTaka(std.balanceDue)}
                        </span>
                      ) : std.balanceReceivable > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                          Payable {formatTaka(std.balanceReceivable)}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">Cleared (৳0)</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button className="text-[11px] font-bold text-slate-700 hover:text-slate-900 underline">
                        View →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StudentProfileDrawer
        student={selectedStudentForDrawer}
        isOpen={!!selectedStudentForDrawer}
        onClose={() => setSelectedStudentForDrawer(null)}
      />

      {/* CSV Import Modal */}
      <ImportStudentsCsvModal
        isOpen={showImportCsvModal}
        onClose={() => setShowImportCsvModal(false)}
      />

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        title="Add Resident Student"
        subtitle="Add new student record to hall dining directory"
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mahir Faysal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Student ID / Roll</label>
              <input
                type="text"
                placeholder="2022-1-60-101"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Phone Number</label>
              <input
                type="text"
                placeholder="01712-345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Block / Building</label>
              <select
                value={block}
                onChange={(e) => setBlock(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all cursor-pointer"
              >
                <option value="A">Block A</option>
                <option value="B">Block B</option>
                <option value="C">Block C</option>
                <option value="D">Block D</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Room Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 204"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Department</label>
              <input
                type="text"
                placeholder="e.g. Computer Science & Engineering"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Batch / Session</label>
              <input
                type="text"
                placeholder="e.g. 49"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setShowAddStudentModal(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs transition"
            >
              Save Student
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
