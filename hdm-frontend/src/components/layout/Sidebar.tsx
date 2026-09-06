'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMess } from '@/context/MessContext';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  UtensilsCrossed,
  UserCheck,
  UserPlus,
  Users,
  CreditCard,
  Sparkles,
  ShoppingCart,
  Receipt,
  BookOpen,
  PieChart,
  FileText,
  Layers,
  Settings,
  LogOut,
  Shield,
  ShieldCheck,
  Users2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { stats, activePeriod } = useMess();
  const { user, logout } = useAuth();

  const getNavLinks = () => {
    // 1. Authority Role: ONLY Students Directory, Period Management (create/manage terms), and Hall Settings
    if (user?.role === 'Authority') {
      return [
        { name: 'Authority Portal', href: '/', icon: LayoutDashboard },
        { name: 'Students Directory', href: '/students', icon: Users, badge: `${stats.registeredStudentsCount}` },
        { name: 'Period Management', href: '/management/periods', icon: Layers, badge: 'Governance', badgeColor: 'bg-purple-100 text-purple-900' },
        { name: 'Hall Settings', href: '/management/settings', icon: Settings },
      ];
    }

    // 2. Management Team Role: Operational facilities ONLY (Period & Settings moved away)
    if (user?.role === 'Management Team') {
      return [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Meal Booking', href: '/meals/booking', icon: CalendarCheck },
        { name: "Today's Meals", href: '/meals/today', icon: UtensilsCrossed, badge: `${stats.todayTotalMeals}` },
        { name: 'Meal Attendance', href: '/meals/attendance', icon: UserCheck, badge: 'Live', badgeColor: 'bg-emerald-100 text-emerald-800' },
        { name: 'Guest Meals', href: '/meals/guests', icon: UserPlus },
        { name: 'Dues & Payable', href: '/students/dues', icon: CreditCard, badge: stats.totalDue > 0 ? `৳${Math.round(stats.totalDue)}` : stats.totalPayable > 0 ? `৳${Math.round(stats.totalPayable)}` : null, badgeColor: stats.totalDue > 0 ? 'bg-amber-100 text-amber-900' : 'bg-teal-100 text-teal-900' },
        { name: 'Grand Feast', href: '/feast', icon: Sparkles },
        { name: 'Bazar & Expenses', href: '/finance/expenses', icon: ShoppingCart },
        { name: 'Payment Receipts', href: '/finance/payments', icon: Receipt },
        { name: 'Cash Ledger', href: '/finance/ledger', icon: BookOpen },
        { name: 'Financial Summary', href: '/finance/summary', icon: PieChart },
        { name: 'Reports & Notice', href: '/reports', icon: FileText },
      ];
    }

    // 3. Admin: Full system access
    return [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Meal Booking', href: '/meals/booking', icon: CalendarCheck },
      { name: "Today's Meals", href: '/meals/today', icon: UtensilsCrossed, badge: `${stats.todayTotalMeals}` },
      { name: 'Meal Attendance', href: '/meals/attendance', icon: UserCheck, badge: 'Live', badgeColor: 'bg-emerald-100 text-emerald-800' },
      { name: 'Guest Meals', href: '/meals/guests', icon: UserPlus },
      { name: 'Students Directory', href: '/students', icon: Users },
      { name: 'Dues & Payable', href: '/students/dues', icon: CreditCard, badge: stats.totalDue > 0 ? `৳${Math.round(stats.totalDue)}` : stats.totalPayable > 0 ? `৳${Math.round(stats.totalPayable)}` : null, badgeColor: stats.totalDue > 0 ? 'bg-amber-100 text-amber-900' : 'bg-teal-100 text-teal-900' },
      { name: 'Grand Feast', href: '/feast', icon: Sparkles },
      { name: 'Bazar & Expenses', href: '/finance/expenses', icon: ShoppingCart },
      { name: 'Payment Receipts', href: '/finance/payments', icon: Receipt },
      { name: 'Cash Ledger', href: '/finance/ledger', icon: BookOpen },
      { name: 'Financial Summary', href: '/finance/summary', icon: PieChart },
      { name: 'Reports & Notice', href: '/reports', icon: FileText },
      { name: 'Period Management', href: '/management/periods', icon: Layers },
      { name: 'Hall Settings', href: '/management/settings', icon: Settings },
    ];
  };

  const navLinks = getNavLinks();

  const getRoleIcon = () => {
    if (user?.role === 'Authority') return Shield;
    if (user?.role === 'Management Team') return Users2;
    return ShieldCheck;
  };

  const RoleIcon = getRoleIcon();

  return (
    <aside className="w-60 bg-white border-r border-slate-200 min-h-screen flex flex-col flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 p-1 flex items-center justify-center flex-shrink-0 shadow-2xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="GAU Emblem"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-sm leading-tight">New Female Hall</h1>
          <p className="text-[11px] text-slate-500 font-medium">Gazipur Agri University</p>
        </div>
      </div>

      {/* Active Term Status */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">{activePeriod?.name || 'Period #05'}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
            Active
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Cash in Hand:</span>
          <span className="font-bold text-slate-900">৳{Math.round(stats.currentBalance).toLocaleString()}</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {navLinks.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition',
                isActive
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-white' : 'text-slate-400')} />
                <span className="truncate">{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-md font-semibold',
                    isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-700'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Card & Footer */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        {user && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                {user.avatarLetter}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate leading-tight">{user.name}</p>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                  <RoleIcon className="w-3 h-3 text-slate-400" />
                  <span className="truncate">{user.role}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (confirm('Sign out and return to role selection?')) {
                  logout();
                }
              }}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition flex-shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          {user?.role !== 'Management Team' ? (
            <Link
              href="/management/settings"
              className="hover:text-slate-900 font-medium flex items-center gap-1 transition"
            >
              <Settings className="w-3 h-3 text-slate-400" />
              <span>Hall Settings</span>
            </Link>
          ) : (
            <span className="text-[10px] text-slate-400 font-medium">New Female Hall</span>
          )}
          <span className="text-[10px] text-slate-400">v1.2.0</span>
        </div>
      </div>
    </aside>
  );
}
