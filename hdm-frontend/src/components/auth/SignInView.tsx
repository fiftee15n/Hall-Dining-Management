'use client';

import React, { useState } from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import {
  Shield,
  ShieldCheck,
  Users2,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';

export function SignInView() {
  const { loginWithCredentials } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('Admin');
  const [email, setEmail] = useState('admin.hdm@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const roles: { role: UserRole; label: string; defaultEmail: string; icon: React.ElementType }[] = [
    { role: 'Authority', label: 'Authority', defaultEmail: 'authority.hdm@gmail.com', icon: Shield },
    { role: 'Admin', label: 'Admin', defaultEmail: 'admin.hdm@gmail.com', icon: ShieldCheck },
    { role: 'Management Team', label: 'Management Team', defaultEmail: 'mp_01.hdm@gmail.com', icon: Users2 },
  ];

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    const target = roles.find((r) => r.role === role);
    if (target) {
      setEmail(target.defaultEmail);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await loginWithCredentials(email, password);
      if (!result.success) {
        setErrorMessage(result.error || 'Invalid credentials. Please check your email and password.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed. Please verify credentials.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col justify-between p-6 sm:p-10 select-none">
      {/* Top minimal status */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between text-xs text-slate-400">
        <span className="font-medium whitespace-nowrap">Gazipur Agriculture University</span>
        <span className="flex items-center gap-1.5 font-medium text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Period #05</span>
        </span>
      </div>

      {/* Center Minimalist Sign In Card */}
      <div className="max-w-md mx-auto w-full my-auto py-8">
        <div className="text-center space-y-3 mb-8">
          {/* Official University Logo */}
          <div className="mx-auto w-20 h-20 rounded-2xl bg-white border border-slate-200/90 shadow-sm p-2 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Gazipur Agricultural University"
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Gazipur Agriculture University
            </h1>
            <p className="text-sm text-slate-500 font-medium">New Female Hall Dining Management</p>
          </div>
        </div>

        {/* Minimalist Segmented Role Selector */}
        <div className="space-y-6">
          <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1 border border-slate-200/80">
            {roles.map(({ role, label, icon: Icon }) => {
              const isSelected = selectedRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleChange(role)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-900' : 'text-slate-400'}`} />
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Clean Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Official Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="name.hdm@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Enter your portal password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
                />
                <span>Remember session</span>
              </label>
              <span className="text-slate-400">Official Portal Access</span>
            </div>

            {/* Primary Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-semibold text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-75"
            >
              <span>{isSubmitting ? 'Verifying Credentials...' : `Sign In as ${selectedRole}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="max-w-md mx-auto w-full text-center text-xs text-slate-400 space-y-0.5">
        <p>© {new Date().getFullYear()} Gazipur Agriculture University</p>
        <p className="text-[11px] text-slate-400">New Female Hall Dining Management System</p>
      </div>
    </div>
  );
}
