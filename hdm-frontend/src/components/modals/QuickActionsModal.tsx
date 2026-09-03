'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import {
  CalendarCheck,
  UserCheck,
  UserPlus,
  ShoppingCart,
  Receipt,
  Sparkles,
  ChevronRight,
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
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const actions = [
    {
      title: 'New Meal Booking',
      desc: 'Register student meals with custom dates',
      icon: CalendarCheck,
      action: () => {
        onClose();
        router.push('/meals/booking');
      },
    },
    {
      title: 'Mark Meal Attendance',
      desc: 'Live dining counter check-in',
      icon: UserCheck,
      action: () => {
        onClose();
        router.push('/meals/attendance');
      },
    },
    {
      title: 'Add Guest Meal',
      desc: 'Issue voucher for visiting guest',
      icon: UserPlus,
      action: () => {
        onClose();
        setShowGuestModal(true);
      },
    },
    {
      title: 'Add Market / Bazar Expense',
      desc: 'Record grocery, chicken or labor cost',
      icon: ShoppingCart,
      action: () => {
        onClose();
        setShowExpenseModal(true);
      },
    },
    {
      title: 'Record Payment / Clear Due',
      desc: 'Receive dining fees from student',
      icon: Receipt,
      action: () => {
        onClose();
        setShowPaymentModal(true);
      },
    },
    {
      title: 'Create Grand Feast',
      desc: 'Schedule special mutton kacchi feast',
      icon: Sparkles,
      action: () => {
        onClose();
        router.push('/feast');
      },
    },
  ];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Quick Actions"
        subtitle="Select an operation to perform"
        maxWidth="md"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {actions.map((act, index) => {
            const Icon = act.icon;
            return (
              <button
                key={index}
                onClick={act.action}
                className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-left transition group"
              >
                <div className="p-2 rounded-lg bg-slate-100 text-slate-700 flex-shrink-0 group-hover:bg-slate-900 group-hover:text-white transition">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{act.title}</h4>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{act.desc}</p>
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
