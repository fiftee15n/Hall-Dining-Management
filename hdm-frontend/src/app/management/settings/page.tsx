'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMess } from '@/context/MessContext';
import { useAuth } from '@/context/AuthContext';
import {
  Settings,
  Building,
  Clock,
  RotateCcw,
  Check,
  Shield,
  AlertCircle,
  Layers,
} from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings, resetToDefaultData } = useMess();
  const { user } = useAuth();

  const [hallName, setHallName] = useState(settings.hallName);
  const [universityName, setUniversityName] = useState(settings.universityName);
  const [lunchTime, setLunchTime] = useState(settings.lunchTime);
  const [dinnerTime, setDinnerTime] = useState(settings.dinnerTime);
  const [contactEmergency, setContactEmergency] = useState(settings.contactEmergency);
  const [isSaved, setIsSaved] = useState(false);

  const isAuthorityOrAdmin = user?.role === 'Authority' || user?.role === 'Admin';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorityOrAdmin) return;

    updateSettings({
      hallName,
      universityName,
      lunchTime,
      dinnerTime,
      contactEmergency,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Governance & Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <Link
          href="/management/periods"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition"
        >
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span>Management Periods</span>
        </Link>

        <Link
          href="/management/settings"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white shadow-2xs transition"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Hall Settings</span>
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-slate-900">Hall Dining Settings</h1>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
            Authority Controlled
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure dining hall identity, serving hours, and emergency contacts
        </p>
      </div>

      {!isAuthorityOrAdmin && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900">Read-Only Mode for Committee</p>
            <p className="text-amber-800">
              Hall settings and operational identity are managed by the Hall Authority (Provost Office).
            </p>
          </div>
        </div>
      )}

      {/* Settings Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Dining Hall Name</label>
            <input
              type="text"
              required
              disabled={!isAuthorityOrAdmin}
              value={hallName}
              onChange={(e) => setHallName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">University Name</label>
            <input
              type="text"
              required
              disabled={!isAuthorityOrAdmin}
              value={universityName}
              onChange={(e) => setUniversityName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Lunch Serving Time</label>
              <input
                type="text"
                disabled={!isAuthorityOrAdmin}
                value={lunchTime}
                onChange={(e) => setLunchTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Dinner Serving Time</label>
              <input
                type="text"
                disabled={!isAuthorityOrAdmin}
                value={dinnerTime}
                onChange={(e) => setDinnerTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Emergency Help Contact</label>
            <input
              type="text"
              disabled={!isAuthorityOrAdmin}
              value={contactEmergency}
              onChange={(e) => setContactEmergency(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          {isAuthorityOrAdmin && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {isSaved ? (
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Settings Updated!
                </span>
              ) : <span />}

              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Danger Zone: Demo Data Reset */}
      {isAuthorityOrAdmin && (
        <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900">Reset Demo Records</h3>
            <p className="text-[11px] text-slate-500">Restore pre-loaded New Female Hall sample dataset</p>
          </div>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all mock records to default?')) {
                resetToDefaultData();
                alert('Reset complete!');
              }
            }}
            className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sample Data</span>
          </button>
        </div>
      )}
    </div>
  );
}
