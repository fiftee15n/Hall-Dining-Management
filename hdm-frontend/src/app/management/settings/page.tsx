'use client';

import React, { useState } from 'react';
import { useMess } from '@/context/MessContext';
import {
  Settings,
  Building,
  Clock,
  RotateCcw,
  Check,
} from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings, resetToDefaultData } = useMess();

  const [hallName, setHallName] = useState(settings.hallName);
  const [universityName, setUniversityName] = useState(settings.universityName);
  const [lunchTime, setLunchTime] = useState(settings.lunchTime);
  const [dinnerTime, setDinnerTime] = useState(settings.dinnerTime);
  const [contactEmergency, setContactEmergency] = useState(settings.contactEmergency);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-lg font-bold text-slate-900">Hall Dining Settings</h1>
        <p className="text-xs text-slate-500">
          Configure dining hall identity, serving hours, and emergency contacts
        </p>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Dining Hall Name</label>
            <input
              type="text"
              required
              value={hallName}
              onChange={(e) => setHallName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">University Name</label>
            <input
              type="text"
              required
              value={universityName}
              onChange={(e) => setUniversityName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Lunch Serving Time</label>
              <input
                type="text"
                value={lunchTime}
                onChange={(e) => setLunchTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Dinner Serving Time</label>
              <input
                type="text"
                value={dinnerTime}
                onChange={(e) => setDinnerTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Emergency Help Contact</label>
            <input
              type="text"
              value={contactEmergency}
              onChange={(e) => setContactEmergency(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

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
        </form>
      </div>

      {/* Danger Zone: Demo Data Reset */}
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
    </div>
  );
}
