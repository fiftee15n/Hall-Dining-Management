export type Role = 'admin';

export type BlockName = 'A' | 'B' | 'C' | 'D' | 'Main' | 'Ext';

export interface Student {
  id: string;
  studentId: string;
  name: string;
  block: BlockName;
  room: string;
  phone: string;
  department: string;
  batch: string;
  status: 'active' | 'inactive';
  balanceDue: number; // Amount student owes to the mess (৳)
  balanceReceivable: number; // Excess amount mess owes back to student (৳)
  email?: string;
}

export interface ManagementPeriod {
  id: string;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  managedByTeam: string;
  teamLead: string;
  contactNumber: string;
  lunchPrice: number;
  dinnerPrice: number;
  feastRegularPrice: number;
  feastGuestPrice: number;
  minBookingDays: number;
  openingBalance: number;
  status: 'active' | 'completed' | 'upcoming';
  notes?: string;
}

export interface DayMealSelection {
  date: string;
  lunch: boolean;
  dinner: boolean;
}

export interface MealBooking {
  id: string;
  periodId: string;
  studentId: string;
  studentName: string;
  block: BlockName;
  room: string;
  startDate: string;
  endDate: string;
  selectedMeals: DayMealSelection[];
  totalLunchCount: number;
  totalDinnerCount: number;
  totalMealsCount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Due';
  paymentStatus: 'Paid' | 'Partial' | 'Due';
  bookedBy: string;
  createdAt: string;
  notes?: string;
}

export interface MealAttendanceRecord {
  id: string;
  periodId: string;
  date: string;
  mealType: 'lunch' | 'dinner';
  studentId: string;
  studentName: string;
  block: BlockName;
  room: string;
  isBooked: boolean;
  isTaken: boolean;
  takenAt?: string;
  hasDue: boolean;
  dueAmount: number;
  paymentCollectedOnSpot?: number;
  paymentMethodOnSpot?: 'Cash' | 'bKash' | 'Nagad' | 'Rocket';
  markedBy?: string;
}

export interface GuestMeal {
  id: string;
  periodId: string;
  guestName: string;
  hostStudentId?: string;
  hostStudentName: string;
  block: BlockName;
  room: string;
  mealType: 'lunch' | 'dinner';
  date: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Due';
  paymentStatus: 'Paid' | 'Due';
  recordedBy: string;
  createdAt: string;
  note?: string;
}

export interface Feast {
  id: string;
  periodId: string;
  title: string;
  date: string;
  mealType: 'lunch' | 'dinner';
  regularPrice: number;
  guestPrice: number;
  menuDescription: string;
  maxCapacity: number;
  registeredCount: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  createdAt: string;
}

export interface FeastRegistration {
  id: string;
  feastId: string;
  periodId: string;
  studentId: string;
  studentName: string;
  block: BlockName;
  room: string;
  isGuest: boolean;
  guestCount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Due';
  status: 'confirmed' | 'attended' | 'cancelled';
  tokenNumber: number;
  createdAt: string;
}

export type ExpenseCategory = 
  | 'Grocery'
  | 'Meat'
  | 'Fish'
  | 'Vegetable'
  | 'Spices & Oil'
  | 'Gas & Utility'
  | 'Labor & Cook'
  | 'Feast Special'
  | 'Others';

export interface Expense {
  id: string;
  periodId: string;
  item: string;
  quantity: string;
  unit?: string;
  totalCost: number;
  date: string;
  category: ExpenseCategory;
  purchasedBy: string;
  vendor?: string;
  memoNo?: string;
  note?: string;
  createdAt: string;
}

export type TransactionType = 
  | 'Meal Booking'
  | 'Due Clearance'
  | 'Guest Meal'
  | 'Feast Registration'
  | 'Expense Payout'
  | 'Student Refund'
  | 'Opening Balance';

export interface PaymentTransaction {
  id: string;
  periodId: string;
  date: string;
  amount: number;
  flow: 'inflow' | 'outflow';
  type: TransactionType;
  studentId?: string;
  studentName?: string;
  block?: BlockName;
  room?: string;
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Rocket';
  transactionId?: string;
  referenceId?: string;
  recordedBy: string;
  note?: string;
  createdAt: string;
}

export interface Receivable {
  id: string;
  periodId: string;
  studentId: string;
  studentName: string;
  block: BlockName;
  room: string;
  amount: number;
  reason: string;
  date: string;
  status: 'pending' | 'settled';
  settledAt?: string;
  settledBy?: string;
  settledMethod?: 'Cash' | 'bKash' | 'Nagad' | 'Rocket';
  settleNote?: string;
}

export interface AuditLog {
  id: string;
  periodId: string;
  user: string;
  role: 'admin';
  action: string;
  details: string;
  timestamp: string;
  entityType?: 'Expense' | 'Booking' | 'Payment' | 'Period' | 'Attendance' | 'Receivable';
  entityId?: string;
}

export interface HallSettings {
  hallName: string;
  universityName: string;
  currencySymbol: string;
  lunchTime: string;
  dinnerTime: string;
  contactEmergency: string;
}
