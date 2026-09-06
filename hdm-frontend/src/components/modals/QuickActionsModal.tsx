'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal';
import {
  CalendarCheck,
  UserCheck,
  UserPlus,
  ShoppingCart,
  Receipt,
  Sparkles,
  ChevronRight,
  PlusCircle,
  Users,
  Settings,
  Shield,
  Layers,
} from 'lucide-react';
import { AddExpenseModal } from './AddExpenseModal';
import { AddGuestMealModal } from './AddGuestMealModal';
import { RecordPaymentModal } from './RecordPaymentModal';

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickActionsModal({ isOpen, onClose }: QuickActionsModalProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Authority actions
  const authorityActions = [
    {
      title: 'Create Management Period',
      desc: 'Initialize a new term, assign student committee and set rates',
      icon: Layers,
      color: 'bg-purple-50 text-purple-700 border-purple-100 group-hover:bg-purple-600 group-hover:text-white',
      action: () => {
        onClose();
        router.push('/management/periods');
      },
    },
    {
      title: 'Add Resident Student',
      desc: 'Register a new student into the hall directory database',
      icon: Users,
      color: 'bg-blue-50 text-blue-700 border-blue-100 group-hover:bg-blue-600 group-hover:text-white',
      action: () => {
        onClose();
        router.push('/students');
      },
    },
    {
      title: 'Update Student Directory',
      desc: 'Modify student room, contact, batch, or active status',
      icon: UserCheck,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white',
      action: () => {
        onClose();
        router.push('/students');
      },
    },
    {
      title: 'Configure Hall Settings',
      desc: 'Update dining hall identity, serving schedule and contacts',
      icon: Settings,
      color: 'bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-slate-900 group-hover:text-white',
      action: () => {
        onClose();
        router.push('/management/settings');
      },
    },
  ];

  // Operations actions for Management Team & Admin
  const operationalActions = [
    {
      title: 'New Meal Booking',
      desc: 'Register student meals with custom date ranges',
      icon: CalendarCheck,
      color: 'bg-blue-50 text-blue-700 border-blue-100 group-hover:bg-blue-600 group-hover:text-white',
      action: () => {
        onClose();
        router.push('/meals/booking');
      },
    },
    {
      title: 'Live Counter Attendance',
      desc: 'Mark student check-in with spot meal verification',
      icon: UserCheck,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white',
      action: () => {
        onClose();
        router.push('/meals/attendance');
      },
    },
    {
      title: 'Record Payment / Clear Due',
      desc: 'Collect cash or bKash dining fees from students',
      icon: Receipt,
      color: 'bg-teal-50 text-teal-700 border-teal-100 group-hover:bg-teal-600 group-hover:text-white',
      action: () => {
        onClose();
        setShowPaymentModal(true);
      },
    },
    {
      title: 'Add Bazar / Market Expense',
      desc: 'Log grocery, chicken, provisions or cook wages',
      icon: ShoppingCart,
      color: 'bg-rose-50 text-rose-700 border-rose-100 group-hover:bg-rose-600 group-hover:text-white',
      action: () => {
        onClose();
        setShowExpenseModal(true);
      },
    },
    {
      title: 'Issue Guest Meal Voucher',
      desc: 'Generate token for visiting guests & outsiders',
      icon: UserPlus,
      color: 'bg-purple-50 text-purple-700 border-purple-100 group-hover:bg-purple-600 group-hover:text-white',
      action: () => {
        onClose();
        setShowGuestModal(true);
      },
    },
    {
      title: 'Schedule Grand Feast',
      desc: 'Organize special monthly/weekly kacchi feast',
      icon: Sparkles,
      color: 'bg-amber-50 text-amber-700 border-amber-100 group-hover:bg-amber-600 group-hover:text-white',
      action: () => {
        onClose();
        router.push('/feast');
      },
    },
  ];

  const isAuthority = user?.role === 'Authority';
  const actions = isAuthority ? authorityActions : operationalActions;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isAuthority ? 'Authority Governance Actions' : 'Quick Operational Actions'}
        subtitle={
          isAuthority
            ? 'Provost administrative controls for student directory & term management'
            : 'Select a frequent mess task to execute immediately'
        }
        maxWidth="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((act, index) => {
            const Icon = act.icon;
            return (
              <button
                key={index}
                onClick={act.action}
                className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200/90 hover:border-slate-400 bg-white hover:bg-slate-50/70 text-left transition-all shadow-2xs hover:shadow-xs group"
              >
                <div
                  className={`p-3 rounded-xl border flex-shrink-0 transition-all ${act.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-slate-950">
                      {act.title}
                    </h4>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{act.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </Modal>

      <AddExpenseModal isOpen={showExpenseModal} onClose={() => setShowExpenseModal(false)} />
      <AddGuestMealModal isOpen={showGuestModal} onClose={() => setShowGuestModal(false)} />
      <RecordPaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />
    </>
  );
}
