'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Role,
  Student,
  ManagementPeriod,
  MealBooking,
  MealAttendanceRecord,
  GuestMeal,
  Feast,
  FeastRegistration,
  Expense,
  PaymentTransaction,
  Receivable,
  AuditLog,
  HallSettings,
  DayMealSelection,
} from '@/types';
import {
  INITIAL_HALL_SETTINGS,
  INITIAL_MANAGEMENT_PERIODS,
  INITIAL_STUDENTS,
  INITIAL_BOOKINGS,
  INITIAL_ATTENDANCE,
  INITIAL_GUEST_MEALS,
  INITIAL_FEASTS,
  INITIAL_FEAST_REGISTRATIONS,
  INITIAL_EXPENSES,
  INITIAL_TRANSACTIONS,
  INITIAL_RECEIVABLES,
  INITIAL_AUDIT_LOGS,
} from '@/lib/data/mockData';
import { generateId, getTodayDateString } from '@/lib/utils';

export interface MessStats {
  todayTotalMeals: number;
  todayLunchMeals: number;
  todayDinnerMeals: number;
  todayTakenLunch: number;
  todayTakenDinner: number;
  todayGuestMeals: number;
  registeredStudentsCount: number;
  totalExpectedCollection: number;
  totalCollected: number;
  totalDue: number;
  totalExpense: number;
  todayExpense: number;
  currentBalance: number;
  studentReceivablesTotal: number;
}

interface MessContextType {
  role: 'admin';
  activePeriodId: string;
  activePeriod: ManagementPeriod;
  periods: ManagementPeriod[];
  students: Student[];
  bookings: MealBooking[];
  attendance: MealAttendanceRecord[];
  guestMeals: GuestMeal[];
  feasts: Feast[];
  feastRegistrations: FeastRegistration[];
  expenses: Expense[];
  transactions: PaymentTransaction[];
  receivables: Receivable[];
  auditLogs: AuditLog[];
  settings: HallSettings;
  stats: MessStats;

  // Actions
  switchPeriod: (periodId: string) => void;
  createPeriod: (data: Omit<ManagementPeriod, 'id'>) => void;
  updatePeriod: (id: string, data: Partial<ManagementPeriod>) => void;
  
  // Student Actions
  addStudent: (data: Omit<Student, 'id' | 'balanceDue' | 'balanceReceivable'>) => Student;
  importStudents: (dataList: Array<Omit<Student, 'id' | 'balanceDue' | 'balanceReceivable'>>) => number;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  // Booking Actions
  createBooking: (data: {
    studentId: string;
    startDate: string;
    endDate: string;
    selectedMeals: DayMealSelection[];
    paidAmount: number;
    paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Due';
    notes?: string;
  }) => MealBooking;
  cancelBooking: (bookingId: string) => void;

  // Attendance Actions
  markAttendance: (
    attendanceId: string,
    isTaken: boolean,
    paymentCollected?: number,
    paymentMethod?: 'Cash' | 'bKash' | 'Nagad' | 'Rocket'
  ) => void;
  quickTakeMeal: (
    studentId: string,
    date: string,
    mealType: 'lunch' | 'dinner',
    onSpotPayment?: number,
    paymentMethod?: 'Cash' | 'bKash' | 'Nagad' | 'Rocket'
  ) => void;

  // Guest Meal Actions
  addGuestMeal: (data: {
    guestName: string;
    hostStudentName: string;
    block: Student['block'];
    room: string;
    mealType: 'lunch' | 'dinner';
    date: string;
    quantity: number;
    unitPrice: number;
    paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Due';
    note?: string;
  }) => GuestMeal;
  markGuestMealPaid: (id: string, paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Rocket') => void;

  // Expense Actions
  addExpense: (data: Omit<Expense, 'id' | 'createdAt' | 'periodId'>) => Expense;
  editExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Finance Actions
  recordManualPayment: (data: {
    studentId: string;
    amount: number;
    paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Rocket';
    note?: string;
  }) => void;
  createReceivable: (studentId: string, amount: number, reason: string) => void;
  settleReceivable: (receivableId: string, method: 'Cash' | 'bKash' | 'Nagad' | 'Rocket', note?: string) => void;

  // Feast Actions
  createFeast: (data: Omit<Feast, 'id' | 'createdAt' | 'registeredCount' | 'periodId'>) => Feast;
  registerFeast: (data: {
    feastId: string;
    studentId: string;
    isGuest: boolean;
    guestCount: number;
    paidAmount: number;
    paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Due';
  }) => FeastRegistration;

  // Settings & Reset
  updateSettings: (settings: Partial<HallSettings>) => void;
  resetToDefaultData: () => void;
}

const MessContext = createContext<MessContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'gau_female_hall_residents_v2';

export function MessProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activePeriodId, setActivePeriodId] = useState<string>('period-01');
  const [periods, setPeriods] = useState<ManagementPeriod[]>(INITIAL_MANAGEMENT_PERIODS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [bookings, setBookings] = useState<MealBooking[]>(INITIAL_BOOKINGS);
  const [attendance, setAttendance] = useState<MealAttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [guestMeals, setGuestMeals] = useState<GuestMeal[]>(INITIAL_GUEST_MEALS);
  const [feasts, setFeasts] = useState<Feast[]>(INITIAL_FEASTS);
  const [feastRegistrations, setFeastRegistrations] = useState<FeastRegistration[]>(INITIAL_FEAST_REGISTRATIONS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(INITIAL_TRANSACTIONS);
  const [receivables, setReceivables] = useState<Receivable[]>(INITIAL_RECEIVABLES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [settings, setSettings] = useState<HallSettings>(INITIAL_HALL_SETTINGS);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.periods) setPeriods(parsed.periods);
        if (parsed.activePeriodId) setActivePeriodId(parsed.activePeriodId);
        if (parsed.students) setStudents(parsed.students);
        if (parsed.bookings) setBookings(parsed.bookings);
        if (parsed.attendance) setAttendance(parsed.attendance);
        if (parsed.guestMeals) setGuestMeals(parsed.guestMeals);
        if (parsed.feasts) setFeasts(parsed.feasts);
        if (parsed.feastRegistrations) setFeastRegistrations(parsed.feastRegistrations);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.receivables) setReceivables(parsed.receivables);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.settings) setSettings(parsed.settings);
      }
    } catch (e) {
      console.error('Failed to load mess data', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const stateToSave = {
        activePeriodId,
        periods,
        students,
        bookings,
        attendance,
        guestMeals,
        feasts,
        feastRegistrations,
        expenses,
        transactions,
        receivables,
        auditLogs,
        settings,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save', e);
    }
  }, [
    isLoaded,
    activePeriodId,
    periods,
    students,
    bookings,
    attendance,
    guestMeals,
    feasts,
    feastRegistrations,
    expenses,
    transactions,
    receivables,
    auditLogs,
    settings,
  ]);

  const activePeriod = periods.find((p) => p.id === activePeriodId) || periods[0];

  const logAudit = (action: string, details: string, entityType?: AuditLog['entityType'], entityId?: string) => {
    const newLog: AuditLog = {
      id: generateId('log'),
      periodId: activePeriodId,
      user: 'Admin',
      role: 'admin',
      action,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      entityType,
      entityId,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const refreshStudentBalances = (
    currentStudents: Student[],
    currentBookings: MealBooking[],
    currentReceivables: Receivable[]
  ) => {
    return currentStudents.map((std) => {
      const studentBookings = currentBookings.filter(
        (b) => b.studentId === std.id && b.periodId === activePeriodId
      );
      const totalDue = studentBookings.reduce((sum, b) => sum + (b.dueAmount || 0), 0);
      const studentRecs = currentReceivables.filter(
        (r) => r.studentId === std.id && r.periodId === activePeriodId && r.status === 'pending'
      );
      const totalReceivable = studentRecs.reduce((sum, r) => sum + r.amount, 0);

      return {
        ...std,
        balanceDue: totalDue,
        balanceReceivable: totalReceivable,
      };
    });
  };

  const switchPeriod = (periodId: string) => {
    setActivePeriodId(periodId);
    logAudit('SWITCH_PERIOD', `Switched active period to ${periodId}`, 'Period', periodId);
  };

  const createPeriod = (data: Omit<ManagementPeriod, 'id'>) => {
    const newPeriod: ManagementPeriod = {
      ...data,
      id: generateId('period'),
    };
    setPeriods((prev) => [newPeriod, ...prev]);
    setActivePeriodId(newPeriod.id);
    logAudit('CREATE_PERIOD', `Created new period ${newPeriod.name}`, 'Period', newPeriod.id);
  };

  const updatePeriod = (id: string, data: Partial<ManagementPeriod>) => {
    setPeriods((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    logAudit('UPDATE_PERIOD', `Updated period configuration for ${id}`, 'Period', id);
  };

  const addStudent = (data: Omit<Student, 'id' | 'balanceDue' | 'balanceReceivable'>) => {
    const newStudent: Student = {
      ...data,
      id: generateId('std'),
      balanceDue: 0,
      balanceReceivable: 0,
    };
    setStudents((prev) => [...prev, newStudent]);
    logAudit('ADD_STUDENT', `Added student ${newStudent.name} (${newStudent.room})`, undefined, newStudent.id);
    return newStudent;
  };

  const importStudents = (dataList: Array<Omit<Student, 'id' | 'balanceDue' | 'balanceReceivable'>>) => {
    const newStudents: Student[] = dataList.map((item) => ({
      ...item,
      id: generateId('std'),
      balanceDue: 0,
      balanceReceivable: 0,
    }));

    setStudents((prev) => [...prev, ...newStudents]);
    logAudit('IMPORT_STUDENTS', `Bulk imported ${newStudents.length} students via CSV upload`);
    return newStudents.length;
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    logAudit('UPDATE_STUDENT', `Updated student profile ${id}`, undefined, id);
  };

  const deleteStudent = (id: string) => {
    const std = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    logAudit('DELETE_STUDENT', `Deleted student ${std?.name || id}`, undefined, id);
  };

  const createBooking = (data: {
    studentId: string;
    startDate: string;
    endDate: string;
    selectedMeals: DayMealSelection[];
    paidAmount: number;
    paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Due';
    notes?: string;
  }) => {
    const student = students.find((s) => s.id === data.studentId);
    if (!student) throw new Error('Student not found');

    let totalLunch = 0;
    let totalDinner = 0;
    data.selectedMeals.forEach((m) => {
      if (m.lunch) totalLunch += 1;
      if (m.dinner) totalDinner += 1;
    });

    const totalCost = totalLunch * activePeriod.lunchPrice + totalDinner * activePeriod.dinnerPrice;
    const paid = data.paymentMethod === 'Due' ? 0 : data.paidAmount;
    const due = Math.max(0, totalCost - paid);

    const newBooking: MealBooking = {
      id: generateId('book'),
      periodId: activePeriodId,
      studentId: student.id,
      studentName: student.name,
      block: student.block,
      room: student.room,
      startDate: data.startDate,
      endDate: data.endDate,
      selectedMeals: data.selectedMeals,
      totalLunchCount: totalLunch,
      totalDinnerCount: totalDinner,
      totalMealsCount: totalLunch + totalDinner,
      totalAmount: totalCost,
      paidAmount: paid,
      dueAmount: due,
      paymentMethod: data.paymentMethod,
      paymentStatus: due === 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Due',
      bookedBy: 'Admin',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      notes: data.notes,
    };

    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);

    if (paid > 0 && data.paymentMethod !== 'Due') {
      const newTxn: PaymentTransaction = {
        id: generateId('txn'),
        periodId: activePeriodId,
        date: getTodayDateString(),
        amount: paid,
        flow: 'inflow',
        type: 'Meal Booking',
        studentId: student.id,
        studentName: student.name,
        block: student.block,
        room: student.room,
        paymentMethod: data.paymentMethod as any,
        referenceId: newBooking.id,
        recordedBy: 'Admin',
        note: `Booking ${data.startDate} to ${data.endDate} (${totalLunch + totalDinner} meals)`,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };
      setTransactions((prev) => [newTxn, ...prev]);
    }

    const newAttendanceRecords: MealAttendanceRecord[] = [];
    data.selectedMeals.forEach((m) => {
      if (m.lunch) {
        newAttendanceRecords.push({
          id: generateId('att'),
          periodId: activePeriodId,
          date: m.date,
          mealType: 'lunch',
          studentId: student.id,
          studentName: student.name,
          block: student.block,
          room: student.room,
          isBooked: true,
          isTaken: false,
          hasDue: due > 0,
          dueAmount: due,
        });
      }
      if (m.dinner) {
        newAttendanceRecords.push({
          id: generateId('att'),
          periodId: activePeriodId,
          date: m.date,
          mealType: 'dinner',
          studentId: student.id,
          studentName: student.name,
          block: student.block,
          room: student.room,
          isBooked: true,
          isTaken: false,
          hasDue: due > 0,
          dueAmount: due,
        });
      }
    });

    setAttendance((prev) => [...newAttendanceRecords, ...prev]);
    setStudents((prev) => refreshStudentBalances(prev, updatedBookings, receivables));

    logAudit(
      'CREATE_BOOKING',
      `Booked ${totalLunch + totalDinner} meals for ${student.name} (${student.room}). Total: ৳${totalCost}, Paid: ৳${paid}`,
      'Booking',
      newBooking.id
    );

    return newBooking;
  };

  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    setAttendance((prev) =>
      prev.filter(
        (a) => !(a.studentId === booking.studentId && a.periodId === booking.periodId && !a.isTaken)
      )
    );

    if (booking.paidAmount > 0) {
      createReceivable(
        booking.studentId,
        booking.paidAmount,
        `Refund for cancelled booking #${booking.id.slice(-5)} (${booking.startDate} to ${booking.endDate})`
      );
    }

    logAudit('CANCEL_BOOKING', `Cancelled booking for ${booking.studentName}`, 'Booking', bookingId);
  };

  const markAttendance = (
    attendanceId: string,
    isTaken: boolean,
    paymentCollected?: number,
    paymentMethod?: 'Cash' | 'bKash' | 'Nagad' | 'Rocket'
  ) => {
    setAttendance((prev) =>
      prev.map((att) => {
        if (att.id !== attendanceId) return att;
        return {
          ...att,
          isTaken,
          takenAt: isTaken ? new Date().toISOString().replace('T', ' ').substring(0, 16) : undefined,
          paymentCollectedOnSpot: paymentCollected || att.paymentCollectedOnSpot,
          paymentMethodOnSpot: paymentMethod || att.paymentMethodOnSpot,
          markedBy: 'Admin',
        };
      })
    );

    if (paymentCollected && paymentCollected > 0 && paymentMethod) {
      const attRecord = attendance.find((a) => a.id === attendanceId);
      if (attRecord) {
        const newTxn: PaymentTransaction = {
          id: generateId('txn'),
          periodId: activePeriodId,
          date: getTodayDateString(),
          amount: paymentCollected,
          flow: 'inflow',
          type: 'Due Clearance',
          studentId: attRecord.studentId,
          studentName: attRecord.studentName,
          block: attRecord.block,
          room: attRecord.room,
          paymentMethod,
          referenceId: attendanceId,
          recordedBy: 'Admin',
          note: `On-spot payment at dining token counter (${attRecord.mealType})`,
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
        setTransactions((prev) => [newTxn, ...prev]);

        setBookings((prev) => {
          let rem = paymentCollected;
          return prev.map((b) => {
            if (b.studentId === attRecord.studentId && b.dueAmount > 0 && rem > 0) {
              const pay = Math.min(b.dueAmount, rem);
              rem -= pay;
              return {
                ...b,
                paidAmount: b.paidAmount + pay,
                dueAmount: b.dueAmount - pay,
                paymentStatus: b.dueAmount - pay === 0 ? 'Paid' : 'Partial',
              };
            }
            return b;
          });
        });
      }
    }

    logAudit(
      'MARK_ATTENDANCE',
      `Marked attendance ${isTaken ? 'Taken' : 'Unmarked'} for token ID ${attendanceId.slice(-6)}`,
      'Attendance',
      attendanceId
    );
  };

  const quickTakeMeal = (
    studentId: string,
    date: string,
    mealType: 'lunch' | 'dinner',
    onSpotPayment?: number,
    paymentMethod?: 'Cash' | 'bKash' | 'Nagad' | 'Rocket'
  ) => {
    const existing = attendance.find(
      (a) => a.studentId === studentId && a.date === date && a.mealType === mealType
    );
    if (existing) {
      markAttendance(existing.id, true, onSpotPayment, paymentMethod);
    } else {
      const student = students.find((s) => s.id === studentId);
      if (!student) return;
      const newAtt: MealAttendanceRecord = {
        id: generateId('att'),
        periodId: activePeriodId,
        date,
        mealType,
        studentId: student.id,
        studentName: student.name,
        block: student.block,
        room: student.room,
        isBooked: false,
        isTaken: true,
        takenAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        hasDue: student.balanceDue > 0,
        dueAmount: student.balanceDue,
        paymentCollectedOnSpot: onSpotPayment,
        paymentMethodOnSpot: paymentMethod,
        markedBy: 'Admin',
      };
      setAttendance((prev) => [newAtt, ...prev]);
    }
  };

  const addGuestMeal = (data: {
    guestName: string;
    hostStudentName: string;
    block: Student['block'];
    room: string;
    mealType: 'lunch' | 'dinner';
    date: string;
    quantity: number;
    unitPrice: number;
    paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Due';
    note?: string;
  }) => {
    const total = data.quantity * data.unitPrice;
    const newGuestMeal: GuestMeal = {
      id: generateId('guest'),
      periodId: activePeriodId,
      guestName: data.guestName,
      hostStudentName: data.hostStudentName,
      block: data.block,
      room: data.room,
      mealType: data.mealType,
      date: data.date,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      totalPrice: total,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === 'Due' ? 'Due' : 'Paid',
      recordedBy: 'Admin',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      note: data.note,
    };

    setGuestMeals((prev) => [newGuestMeal, ...prev]);

    if (data.paymentMethod !== 'Due') {
      const newTxn: PaymentTransaction = {
        id: generateId('txn'),
        periodId: activePeriodId,
        date: data.date,
        amount: total,
        flow: 'inflow',
        type: 'Guest Meal',
        studentName: `${data.hostStudentName} (Guest: ${data.guestName})`,
        block: data.block,
        room: data.room,
        paymentMethod: data.paymentMethod as any,
        referenceId: newGuestMeal.id,
        recordedBy: 'Admin',
        note: `Guest meal (${data.quantity}x ${data.mealType})`,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };
      setTransactions((prev) => [newTxn, ...prev]);
    }

    logAudit(
      'ADD_GUEST_MEAL',
      `Added ${data.quantity} guest meal(s) for guest ${data.guestName}`,
      undefined,
      newGuestMeal.id
    );

    return newGuestMeal;
  };

  const markGuestMealPaid = (id: string, paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Rocket') => {
    const guestMeal = guestMeals.find((g) => g.id === id);
    if (!guestMeal) return;

    setGuestMeals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, paymentStatus: 'Paid', paymentMethod } : g))
    );

    const newTxn: PaymentTransaction = {
      id: generateId('txn'),
      periodId: activePeriodId,
      date: getTodayDateString(),
      amount: guestMeal.totalPrice,
      flow: 'inflow',
      type: 'Guest Meal',
      studentName: `${guestMeal.hostStudentName} (Guest: ${guestMeal.guestName})`,
      block: guestMeal.block,
      room: guestMeal.room,
      paymentMethod,
      referenceId: guestMeal.id,
      recordedBy: 'Admin',
      note: `Cleared due for guest meal (${guestMeal.guestName})`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setTransactions((prev) => [newTxn, ...prev]);

    logAudit('MARK_GUEST_PAID', `Collected ৳${guestMeal.totalPrice} for guest meal #${id.slice(-5)}`, undefined, id);
  };

  const addExpense = (data: Omit<Expense, 'id' | 'createdAt' | 'periodId'>) => {
    const newExpense: Expense = {
      ...data,
      id: generateId('exp'),
      periodId: activePeriodId,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setExpenses((prev) => [newExpense, ...prev]);

    const newTxn: PaymentTransaction = {
      id: generateId('txn'),
      periodId: activePeriodId,
      date: data.date,
      amount: data.totalCost,
      flow: 'outflow',
      type: 'Expense Payout',
      paymentMethod: 'Cash',
      referenceId: newExpense.id,
      recordedBy: data.purchasedBy,
      note: `${data.item} (${data.quantity} ${data.unit || ''}) - ${data.category}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setTransactions((prev) => [newTxn, ...prev]);

    logAudit(
      'ADD_EXPENSE',
      `Recorded expense: ${data.item} (৳${data.totalCost}) by ${data.purchasedBy}`,
      'Expense',
      newExpense.id
    );

    return newExpense;
  };

  const editExpense = (id: string, data: Partial<Expense>) => {
    const old = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));

    if (data.totalCost !== undefined && old && data.totalCost !== old.totalCost) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.referenceId === id
            ? { ...t, amount: data.totalCost!, note: `${data.item || old.item} (Updated)` }
            : t
        )
      );
    }

    logAudit('EDIT_EXPENSE', `Edited expense #${id.slice(-5)}`, 'Expense', id);
  };

  const deleteExpense = (id: string) => {
    const exp = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setTransactions((prev) => prev.filter((t) => t.referenceId !== id));
    logAudit('DELETE_EXPENSE', `Deleted expense: ${exp?.item} (৳${exp?.totalCost})`, 'Expense', id);
  };

  const recordManualPayment = (data: {
    studentId: string;
    amount: number;
    paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Rocket';
    note?: string;
  }) => {
    const student = students.find((s) => s.id === data.studentId);
    if (!student) return;

    const newTxn: PaymentTransaction = {
      id: generateId('txn'),
      periodId: activePeriodId,
      date: getTodayDateString(),
      amount: data.amount,
      flow: 'inflow',
      type: 'Due Clearance',
      studentId: student.id,
      studentName: student.name,
      block: student.block,
      room: student.room,
      paymentMethod: data.paymentMethod,
      recordedBy: 'Admin',
      note: data.note || `Manual due payment by ${student.name}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setTransactions((prev) => [newTxn, ...prev]);

    let remainingPayment = data.amount;
    const updatedBookings = bookings.map((b) => {
      if (b.studentId === student.id && b.dueAmount > 0 && remainingPayment > 0) {
        const pay = Math.min(b.dueAmount, remainingPayment);
        remainingPayment -= pay;
        return {
          ...b,
          paidAmount: b.paidAmount + pay,
          dueAmount: b.dueAmount - pay,
          paymentStatus: (b.dueAmount - pay === 0 ? 'Paid' : 'Partial') as any,
        };
      }
      return b;
    });

    setBookings(updatedBookings);
    setStudents((prev) => refreshStudentBalances(prev, updatedBookings, receivables));

    logAudit(
      'MANUAL_PAYMENT',
      `Recorded payment of ৳${data.amount} for ${student.name} (${student.room})`,
      'Payment',
      newTxn.id
    );
  };

  const createReceivable = (studentId: string, amount: number, reason: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const newRec: Receivable = {
      id: generateId('rec'),
      periodId: activePeriodId,
      studentId: student.id,
      studentName: student.name,
      block: student.block,
      room: student.room,
      amount,
      reason,
      date: getTodayDateString(),
      status: 'pending',
    };

    const updatedRecs = [newRec, ...receivables];
    setReceivables(updatedRecs);
    setStudents((prev) => refreshStudentBalances(prev, bookings, updatedRecs));

    logAudit('CREATE_RECEIVABLE', `Added change receivable: ৳${amount} for ${student.name}`, 'Receivable', newRec.id);
  };

  const settleReceivable = (
    receivableId: string,
    method: 'Cash' | 'bKash' | 'Nagad' | 'Rocket',
    note?: string
  ) => {
    const rec = receivables.find((r) => r.id === receivableId);
    if (!rec) return;

    const updatedRecs = receivables.map((r) =>
      r.id === receivableId
        ? {
            ...r,
            status: 'settled' as const,
            settledAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            settledBy: 'Admin',
            settledMethod: method,
            settleNote: note,
          }
        : r
    );

    setReceivables(updatedRecs);

    const newTxn: PaymentTransaction = {
      id: generateId('txn'),
      periodId: activePeriodId,
      date: getTodayDateString(),
      amount: rec.amount,
      flow: 'outflow',
      type: 'Student Refund',
      studentId: rec.studentId,
      studentName: rec.studentName,
      block: rec.block,
      room: rec.room,
      paymentMethod: method,
      referenceId: receivableId,
      recordedBy: 'Admin',
      note: `Settled receivable change refund for ${rec.studentName}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setTransactions((prev) => [newTxn, ...prev]);
    setStudents((prev) => refreshStudentBalances(prev, bookings, updatedRecs));

    logAudit('SETTLE_RECEIVABLE', `Settled refund of ৳${rec.amount} to ${rec.studentName}`, 'Receivable', receivableId);
  };

  const createFeast = (data: Omit<Feast, 'id' | 'createdAt' | 'registeredCount' | 'periodId'>) => {
    const newFeast: Feast = {
      ...data,
      id: generateId('feast'),
      periodId: activePeriodId,
      registeredCount: 0,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setFeasts((prev) => [newFeast, ...prev]);
    logAudit('CREATE_FEAST', `Created feast: ${data.title}`, undefined, newFeast.id);
    return newFeast;
  };

  const registerFeast = (data: {
    feastId: string;
    studentId: string;
    isGuest: boolean;
    guestCount: number;
    paidAmount: number;
    paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Due';
  }) => {
    const student = students.find((s) => s.id === data.studentId);
    const feast = feasts.find((f) => f.id === data.feastId);
    if (!student || !feast) throw new Error('Student or Feast not found');

    const regularCost = feast.regularPrice;
    const guestCost = (data.guestCount || 0) * feast.guestPrice;
    const total = regularCost + guestCost;
    const paid = data.paymentMethod === 'Due' ? 0 : data.paidAmount;
    const due = Math.max(0, total - paid);

    const tokenNumber = (feast.registeredCount || 0) + 101;

    const newReg: FeastRegistration = {
      id: generateId('freg'),
      feastId: feast.id,
      periodId: activePeriodId,
      studentId: student.id,
      studentName: student.name,
      block: student.block,
      room: student.room,
      isGuest: data.isGuest,
      guestCount: data.guestCount,
      totalAmount: total,
      paidAmount: paid,
      dueAmount: due,
      paymentMethod: data.paymentMethod,
      status: 'confirmed',
      tokenNumber,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setFeastRegistrations((prev) => [newReg, ...prev]);
    setFeasts((prev) =>
      prev.map((f) =>
        f.id === feast.id ? { ...f, registeredCount: f.registeredCount + 1 + (data.guestCount || 0) } : f
      )
    );

    if (paid > 0 && data.paymentMethod !== 'Due') {
      const newTxn: PaymentTransaction = {
        id: generateId('txn'),
        periodId: activePeriodId,
        date: getTodayDateString(),
        amount: paid,
        flow: 'inflow',
        type: 'Feast Registration',
        studentId: student.id,
        studentName: `${student.name} (Feast Token #${tokenNumber})`,
        block: student.block,
        room: student.room,
        paymentMethod: data.paymentMethod as any,
        referenceId: newReg.id,
        recordedBy: 'Admin',
        note: `Feast registration for ${feast.title}`,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };
      setTransactions((prev) => [newTxn, ...prev]);
    }

    logAudit('REGISTER_FEAST', `Registered ${student.name} for ${feast.title}`, undefined, newReg.id);
    return newReg;
  };

  const updateSettings = (newSettings: Partial<HallSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    logAudit('UPDATE_SETTINGS', 'Updated dining hall operational settings');
  };

  const resetToDefaultData = () => {
    setPeriods(INITIAL_MANAGEMENT_PERIODS);
    setActivePeriodId('period-01');
    setStudents(INITIAL_STUDENTS);
    setBookings(INITIAL_BOOKINGS);
    setAttendance(INITIAL_ATTENDANCE);
    setGuestMeals(INITIAL_GUEST_MEALS);
    setFeasts(INITIAL_FEASTS);
    setFeastRegistrations(INITIAL_FEAST_REGISTRATIONS);
    setExpenses(INITIAL_EXPENSES);
    setTransactions(INITIAL_TRANSACTIONS);
    setReceivables(INITIAL_RECEIVABLES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSettings(INITIAL_HALL_SETTINGS);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const todayStr = getTodayDateString();

  const activeBookings = bookings.filter((b) => b.periodId === activePeriodId);
  const activeAttendance = attendance.filter((a) => a.periodId === activePeriodId);
  const activeGuestMeals = guestMeals.filter((g) => g.periodId === activePeriodId);
  const activeExpenses = expenses.filter((e) => e.periodId === activePeriodId);
  const activeReceivables = receivables.filter((r) => r.periodId === activePeriodId);

  const todayAtt = activeAttendance.filter((a) => a.date === todayStr);
  const todayLunch = todayAtt.filter((a) => a.mealType === 'lunch');
  const todayDinner = todayAtt.filter((a) => a.mealType === 'dinner');
  const todayTakenLunch = todayLunch.filter((a) => a.isTaken).length;
  const todayTakenDinner = todayDinner.filter((a) => a.isTaken).length;

  const todayGuestCount = activeGuestMeals
    .filter((g) => g.date === todayStr)
    .reduce((sum, g) => sum + g.quantity, 0);

  const bookingTotalAmount = activeBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const bookingCollected = activeBookings.reduce((sum, b) => sum + b.paidAmount, 0);
  const bookingDue = activeBookings.reduce((sum, b) => sum + b.dueAmount, 0);

  const guestCollected = activeGuestMeals
    .filter((g) => g.paymentStatus === 'Paid')
    .reduce((sum, g) => sum + g.totalPrice, 0);
  const guestDue = activeGuestMeals
    .filter((g) => g.paymentStatus === 'Due')
    .reduce((sum, g) => sum + g.totalPrice, 0);

  const feastCollected = feastRegistrations
    .filter((f) => f.periodId === activePeriodId)
    .reduce((sum, f) => sum + f.paidAmount, 0);
  const feastDue = feastRegistrations
    .filter((f) => f.periodId === activePeriodId)
    .reduce((sum, f) => sum + f.dueAmount, 0);

  const totalExpectedCollection = bookingTotalAmount + (guestCollected + guestDue) + (feastCollected + feastDue);
  const totalCollected = bookingCollected + guestCollected + feastCollected;
  const totalDue = bookingDue + guestDue + feastDue;

  const totalExpense = activeExpenses.reduce((sum, e) => sum + e.totalCost, 0);
  const todayExpense = activeExpenses
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + e.totalCost, 0);

  const studentReceivablesTotal = activeReceivables
    .filter((r) => r.status === 'pending')
    .reduce((sum, r) => sum + r.amount, 0);

  const settledRefunds = activeReceivables
    .filter((r) => r.status === 'settled')
    .reduce((sum, r) => sum + r.amount, 0);

  const openingBal = activePeriod?.openingBalance || 0;
  const currentBalance = openingBal + totalCollected - totalExpense - settledRefunds;

  const stats: MessStats = {
    todayTotalMeals: todayLunch.length + todayDinner.length,
    todayLunchMeals: todayLunch.length,
    todayDinnerMeals: todayDinner.length,
    todayTakenLunch,
    todayTakenDinner,
    todayGuestMeals: todayGuestCount,
    registeredStudentsCount: students.filter((s) => s.status === 'active').length,
    totalExpectedCollection,
    totalCollected,
    totalDue,
    totalExpense,
    todayExpense,
    currentBalance,
    studentReceivablesTotal,
  };

  return (
    <MessContext.Provider
      value={{
        role: 'admin',
        activePeriodId,
        activePeriod,
        periods,
        students,
        bookings,
        attendance,
        guestMeals,
        feasts,
        feastRegistrations,
        expenses,
        transactions,
        receivables,
        auditLogs,
        settings,
        stats,
        switchPeriod,
        createPeriod,
        updatePeriod,
        addStudent,
        importStudents,
        updateStudent,
        deleteStudent,
        createBooking,
        cancelBooking,
        markAttendance,
        quickTakeMeal,
        addGuestMeal,
        markGuestMealPaid,
        addExpense,
        editExpense,
        deleteExpense,
        recordManualPayment,
        createReceivable,
        settleReceivable,
        createFeast,
        registerFeast,
        updateSettings,
        resetToDefaultData,
      }}
    >
      {children}
    </MessContext.Provider>
  );
}

export function useMess() {
  const context = useContext(MessContext);
  if (!context) {
    throw new Error('useMess must be used within a MessProvider');
  }
  return context;
}
