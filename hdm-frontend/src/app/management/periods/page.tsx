'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMess } from '@/context/MessContext';
import { useAuth } from '@/context/AuthContext';
import { formatTaka } from '@/lib/utils';
import {
  Settings,
  Plus,
  CheckCircle2,
  Calendar,
  Layers,
  Shield,
  AlertCircle,
  Key,
  Mail,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';

export default function PeriodsManagementPage() {
  const { periods, activePeriodId, switchPeriod, createPeriod, resetPeriodPassword } = useMess();
  const { user } = useAuth();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedPeriodForReset, setSelectedPeriodForReset] = useState<any>(null);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [showResetPasswordText, setShowResetPasswordText] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // New Period Form
  const nextPeriodNum = String(periods.length + 1).padStart(2, '0');
  const [name, setName] = useState(`Management Period #${nextPeriodNum}`);
  const [code, setCode] = useState(`P-${nextPeriodNum}`);
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-15');
  const [managedByTeam, setManagedByTeam] = useState('51st Batch Dining Committee');
  const [teamLead, setTeamLead] = useState('Tanvir Hasan');
  const [contactNumber, setContactNumber] = useState('01700-112233');
  const [teamContactEmail, setTeamContactEmail] = useState('');
  const [managementPassword, setManagementPassword] = useState('Management@@');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const [lunchPrice, setLunchPrice] = useState(50);
  const [dinnerPrice, setDinnerPrice] = useState(50);
  const [feastRegularPrice, setFeastRegularPrice] = useState(160);
  const [feastGuestPrice, setFeastGuestPrice] = useState(220);
  const [minBookingDays, setMinBookingDays] = useState(3);
  const [openingBalance, setOpeningBalance] = useState(10000);

  const isAuthorityOrAdmin = user?.role === 'Authority' || user?.role === 'Admin';
  const isManagementTeam = user?.role === 'Management Team';

  // Derived system email
  const periodCodeDigits = code.match(/\d+/) || name.match(/\d+/);
  const derivedPeriodNum = periodCodeDigits ? periodCodeDigits[0].padStart(2, '0') : nextPeriodNum;
  const autoSystemEmail = `mp_${derivedPeriodNum}.hdm@gmail.com`;

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass + '@@';
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      code: code.trim(),
      startDate,
      endDate,
      managedByTeam: managedByTeam.trim(),
      teamLead: teamLead.trim(),
      contactNumber: contactNumber.trim(),
      managementEmail: autoSystemEmail,
      teamContactEmail: teamContactEmail.trim() || undefined,
      managementPassword: managementPassword.trim() || 'Management@@',
      lunchPrice: Number(lunchPrice),
      dinnerPrice: Number(dinnerPrice),
      feastRegularPrice: Number(feastRegularPrice),
      feastGuestPrice: Number(feastGuestPrice),
      minBookingDays: Number(minBookingDays),
      openingBalance: Number(openingBalance),
      status: 'active' as const,
    };

    createPeriod(payload);

    // Call FastAPI backend in parallel if online
    try {
      await api.createPeriod(payload);
    } catch {
      // ignore
    }

    setShowCreateModal(false);
  };

  const handleOpenResetModal = (period: any) => {
    setSelectedPeriodForReset(period);
    setNewResetPassword(generateRandomPassword());
    setResetSuccessMessage(null);
    setShowResetModal(true);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeriodForReset || !newResetPassword.trim()) return;

    resetPeriodPassword(selectedPeriodForReset.id, newResetPassword.trim());

    try {
      await api.resetPeriodPassword(selectedPeriodForReset.id, newResetPassword.trim());
    } catch {
      // ignore
    }

    setResetSuccessMessage(`Password updated for ${selectedPeriodForReset.managementEmail || 'Management Team'}!`);
    setTimeout(() => {
      setShowResetModal(false);
      setResetSuccessMessage(null);
    }, 1500);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Governance & Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <Link
          href="/management/periods"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white shadow-2xs transition"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Management Periods</span>
        </Link>

        <Link
          href="/management/settings"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition"
        >
          <Settings className="w-3.5 h-3.5 text-slate-500" />
          <span>Hall Settings</span>
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Management Periods & Governance</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
              Authority Governed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Create and rotate dining terms, provision committee login credentials, and manage passwords
          </p>
        </div>

        {isAuthorityOrAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Period</span>
          </button>
        )}
      </div>

      {/* Access info if Management Team */}
      {isManagementTeam && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-900">Management Team Access Scope</p>
            <p className="text-amber-800 leading-relaxed">
              You are logged in under your assigned committee term. <strong>Management teams can only view and manage their designated period</strong> and cannot access other periods.
            </p>
            <p className="text-amber-700 font-medium">
              * If you forgot your password or need changes, please contact the <strong>Hall Provost / Authority Office</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Period Cards */}
      <div className="space-y-3">
        {periods.map((p) => {
          const isActive = p.id === activePeriodId;
          const periodNum = p.code?.replace(/\D/g, '') || '01';
          const systemEmail = p.managementEmail || `mp_${periodNum.padStart(2, '0')}.hdm@gmail.com`;

          return (
            <div
              key={p.id}
              className={`p-5 rounded-2xl border transition flex flex-col gap-4 ${
                isActive
                  ? 'bg-white border-slate-900 shadow-xs ring-1 ring-slate-900'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-base">{p.name}</h3>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                      {p.code}
                    </span>
                    {isActive && (
                      <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Currently Active
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 font-medium">
                    {p.managedByTeam} (Lead: <strong>{p.teamLead}</strong>, {p.contactNumber})
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {isAuthorityOrAdmin && (
                    <button
                      type="button"
                      onClick={() => handleOpenResetModal(p)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                    >
                      <Key className="w-3.5 h-3.5 text-amber-600" />
                      <span>Reset Password</span>
                    </button>
                  )}

                  {isActive ? (
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active Term
                    </span>
                  ) : isAuthorityOrAdmin ? (
                    <button
                      onClick={() => switchPeriod(p.id)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition"
                    >
                      Activate Period
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium italic">Previous Term</span>
                  )}
                </div>
              </div>

              {/* Credentials & Rates Grid */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* System Login Email */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Dedicated Team Login</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900">{systemEmail}</span>
                    <button
                      onClick={() => handleCopy(systemEmail)}
                      className="text-slate-400 hover:text-slate-600 transition"
                      title="Copy email"
                    >
                      {copiedEmail === systemEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Team Contact Email */}
                {p.teamContactEmail && (
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Notification Gmail</span>
                    <div className="font-medium text-slate-700 truncate">{p.teamContactEmail}</div>
                  </div>
                )}

                {/* Rates */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Meal Pricing</span>
                  <div className="font-semibold text-slate-800">
                    Lunch: {formatTaka(p.lunchPrice)} · Dinner: {formatTaka(p.dinnerPrice)}
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Schedule</span>
                  <div className="font-medium text-slate-700">
                    {p.startDate} to {p.endDate}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal for Authority */}
      {isAuthorityOrAdmin && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Management Period & Provision Login"
          subtitle="Authority Portal: Initialize dining term and assign dedicated team login credentials"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Period Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Management Period #06"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Period Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. P-06"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                />
              </div>
            </div>

            {/* Dedicated Login Credentials Box */}
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-3">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-purple-700" />
                <span className="text-xs font-bold text-purple-950 uppercase tracking-wider">
                  Management Team Login Credentials
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-purple-900 mb-1">
                    System Assigned Login Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-400">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      readOnly
                      value={autoSystemEmail}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-purple-300 font-mono text-xs font-bold text-purple-900 cursor-not-allowed"
                    />
                  </div>
                  <span className="text-[10px] text-purple-600 mt-0.5 block">
                    Auto-formatted based on period sequence
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-purple-900 mb-1">
                    Committee Members&apos; Contact Gmail
                  </label>
                  <input
                    type="email"
                    value={teamContactEmail}
                    onChange={(e) => setTeamContactEmail(e.target.value)}
                    placeholder="e.g. diningteam51@gmail.com"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-purple-300 text-xs text-slate-900 focus:ring-2 focus:ring-purple-900/10 focus:border-purple-800 transition"
                  />
                  <span className="text-[10px] text-purple-600 mt-0.5 block">
                    For sending credentials notification
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-purple-900">
                    Initial Management Team Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setManagementPassword(generateRandomPassword())}
                    className="text-[11px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Generate Password
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={managementPassword}
                    onChange={(e) => setManagementPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 rounded-lg bg-white border border-purple-300 font-mono text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-purple-900/10 focus:border-purple-800 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-400 hover:text-purple-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Start Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">End Date</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Lunch Rate (৳)
                </label>
                <input
                  type="number"
                  value={lunchPrice}
                  onChange={(e) => setLunchPrice(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Dinner Rate (৳)
                </label>
                <input
                  type="number"
                  value={dinnerPrice}
                  onChange={(e) => setDinnerPrice(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Opening Cash (৳)</label>
                <input
                  type="number"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Management Committee</label>
                <input
                  type="text"
                  value={managedByTeam}
                  onChange={(e) => setManagedByTeam(e.target.value)}
                  placeholder="e.g. 51st Batch Dining Committee"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Committee Lead / Phone</label>
                <input
                  type="text"
                  value={teamLead}
                  onChange={(e) => setTeamLead(e.target.value)}
                  placeholder="e.g. Tanvir Hasan (01700-112233)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs transition"
              >
                Create Period & Credentials
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Password Reset Modal for Authority */}
      {isAuthorityOrAdmin && (
        <Modal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          title="Reset Management Team Password"
          subtitle={`Authority Action: Set a new login password for ${selectedPeriodForReset?.name || 'Period'}`}
          maxWidth="md"
        >
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-sm">
            {resetSuccessMessage ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{resetSuccessMessage}</span>
              </div>
            ) : (
              <>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <div className="font-bold text-slate-800">{selectedPeriodForReset?.name}</div>
                  <div className="font-mono text-slate-600">
                    Account: <strong>{selectedPeriodForReset?.managementEmail || 'mp_*.hdm@gmail.com'}</strong>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      New Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setNewResetPassword(generateRandomPassword())}
                      className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Generate Random
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showResetPasswordText ? 'text' : 'password'}
                      required
                      value={newResetPassword}
                      onChange={(e) => setNewResetPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 font-mono text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPasswordText(!showResetPasswordText)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showResetPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs transition"
                  >
                    Save & Update Password
                  </button>
                </div>
              </>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
}
