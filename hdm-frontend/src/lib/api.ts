/**
 * Centralized API Client for FastAPI Backend Communication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('hdm_auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}: ${res.statusText}`;
    try {
      const errData = await res.json();
      if (errData && errData.detail) {
        errorMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Authentication
  async login(email: string, pass: string) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });
    return handleResponse<{ access_token: string; user: any }>(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Dashboard Stats
  async getDashboardStats(periodId?: string) {
    const url = periodId ? `${API_BASE_URL}/dashboard/stats?period_id=${periodId}` : `${API_BASE_URL}/dashboard/stats`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },

  // Management Periods
  async getPeriods() {
    const res = await fetch(`${API_BASE_URL}/periods`, { headers: getAuthHeaders() });
    return handleResponse<any[]>(res);
  },

  async createPeriod(data: any) {
    const res = await fetch(`${API_BASE_URL}/periods`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async updatePeriod(id: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/periods/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async activatePeriod(id: string) {
    const res = await fetch(`${API_BASE_URL}/periods/${id}/activate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  async resetPeriodPassword(id: string, newPassword: string) {
    const res = await fetch(`${API_BASE_URL}/periods/${id}/reset-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newPassword }),
    });
    return handleResponse<any>(res);
  },

  // Students
  async getStudents(search?: string, block?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (block) params.append('block', block);
    const res = await fetch(`${API_BASE_URL}/students?${params.toString()}`, { headers: getAuthHeaders() });
    return handleResponse<any[]>(res);
  },

  async getStudent(id: string) {
    const res = await fetch(`${API_BASE_URL}/students/${id}`, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },

  async addStudent(data: any) {
    const res = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async updateStudent(id: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async deleteStudent(id: string) {
    const res = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async importStudentsCsv(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const token = typeof window !== 'undefined' ? localStorage.getItem('hdm_auth_token') : null;
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/students/import-csv`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse<{ success: boolean; importedCount: number }>(res);
  },

  // Bookings
  async getBookings(periodId?: string, studentId?: string) {
    const params = new URLSearchParams();
    if (periodId) params.append('period_id', periodId);
    if (studentId) params.append('student_id', studentId);
    const res = await fetch(`${API_BASE_URL}/bookings?${params.toString()}`, { headers: getAuthHeaders() });
    return handleResponse<any[]>(res);
  },

  async createBooking(data: any, periodId?: string) {
    const url = periodId ? `${API_BASE_URL}/bookings?period_id=${periodId}` : `${API_BASE_URL}/bookings`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async cancelBooking(id: string) {
    const res = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Attendance
  async getAttendance(date?: string, mealType?: string, periodId?: string) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (mealType) params.append('meal_type', mealType);
    if (periodId) params.append('period_id', periodId);
    const res = await fetch(`${API_BASE_URL}/attendance?${params.toString()}`, { headers: getAuthHeaders() });
    return handleResponse<any[]>(res);
  },

  async markAttendance(id: string, isTaken: boolean, paymentCollected?: number, paymentMethod?: string) {
    const res = await fetch(`${API_BASE_URL}/attendance/${id}/mark`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isTaken, paymentCollected, paymentMethod }),
    });
    return handleResponse<any>(res);
  },

  async quickTakeMeal(data: { studentId: string; date: string; mealType: string; onSpotPayment?: number; paymentMethod?: string }, periodId?: string) {
    const url = periodId ? `${API_BASE_URL}/attendance/quick-take?period_id=${periodId}` : `${API_BASE_URL}/attendance/quick-take`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  // Guest Meals
  async getGuestMeals(periodId?: string, date?: string) {
    const params = new URLSearchParams();
    if (periodId) params.append('period_id', periodId);
    if (date) params.append('date', date);
    const res = await fetch(`${API_BASE_URL}/guest-meals?${params.toString()}`, { headers: getAuthHeaders() });
    return handleResponse<any[]>(res);
  },

  async addGuestMeal(data: any, periodId?: string) {
    const url = periodId ? `${API_BASE_URL}/guest-meals?period_id=${periodId}` : `${API_BASE_URL}/guest-meals`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async payGuestMeal(id: string, paymentMethod: string) {
    const res = await fetch(`${API_BASE_URL}/guest-meals/${id}/pay`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ paymentMethod }),
    });
    return handleResponse<any>(res);
  },

  // Feasts
  async getFeasts(periodId?: string) {
    const url = periodId ? `${API_BASE_URL}/feasts?period_id=${periodId}` : `${API_BASE_URL}/feasts`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse<any[]>(res);
  },

  async createFeast(data: any, periodId?: string) {
    const url = periodId ? `${API_BASE_URL}/feasts?period_id=${periodId}` : `${API_BASE_URL}/feasts`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async getFeastRegistrations(periodId?: string, feastId?: string) {
    const params = new URLSearchParams();
    if (periodId) params.append('period_id', periodId);
    if (feastId) params.append('feast_id', feastId);
    const res = await fetch(`${API_BASE_URL}/feasts/registrations?${params.toString()}`, { headers: getAuthHeaders() });
    return handleResponse<any[]>(res);
  },

  async registerFeast(feastId: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/feasts/${feastId}/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  // Expenses
  async getExpenses(periodId?: string, category?: string, date?: string) {
    const params = new URLSearchParams();
    if (periodId) params.append('period_id', periodId);
    if (category) params.append('category', category);
    if (date) params.append('date', date);
    const res = await fetch(`${API_BASE_URL}/expenses?${params.toString()}`, { headers: getAuthHeaders() });
    return handleResponse<any[]>(res);
  },

  async addExpense(data: any, periodId?: string) {
    const url = periodId ? `${API_BASE_URL}/expenses?period_id=${periodId}` : `${API_BASE_URL}/expenses`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async updateExpense(id: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async deleteExpense(id: string) {
    const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Finance & Transactions
  async getTransactions(periodId?: string, flow?: string, type?: string, studentId?: string) {
    const params = new URLSearchParams();
    if (periodId) params.append('period_id', periodId);
    if (flow) params.append('flow', flow);
    if (type) params.append('type', type);
    if (studentId) params.append('student_id', studentId);
    const res = await fetch(`${API_BASE_URL}/finance/transactions?${params.toString()}`, { headers: getAuthHeaders() });
    return handleResponse<any[]>(res);
  },

  async recordManualPayment(data: { studentId: string; amount: number; paymentMethod: string; note?: string }, periodId?: string) {
    const url = periodId ? `${API_BASE_URL}/finance/payments?period_id=${periodId}` : `${API_BASE_URL}/finance/payments`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async getReceivables(periodId?: string, status?: string, studentId?: string) {
    const params = new URLSearchParams();
    if (periodId) params.append('period_id', periodId);
    if (status) params.append('status', status);
    if (studentId) params.append('student_id', studentId);
    const res = await fetch(`${API_BASE_URL}/finance/receivables?${params.toString()}`, { headers: getAuthHeaders() });
    return handleResponse<any[]>(res);
  },

  async createReceivable(data: { studentId: string; amount: number; reason: string; date?: string }, periodId?: string) {
    const url = periodId ? `${API_BASE_URL}/finance/receivables?period_id=${periodId}` : `${API_BASE_URL}/finance/receivables`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async settleReceivable(id: string, method: string, note?: string) {
    const res = await fetch(`${API_BASE_URL}/finance/receivables/${id}/settle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ method, note }),
    });
    return handleResponse<any>(res);
  },

  // Audit Logs
  async getAuditLogs(periodId?: string, limit: number = 100) {
    const params = new URLSearchParams();
    if (periodId) params.append('period_id', periodId);
    params.append('limit', limit.toString());
    const res = await fetch(`${API_BASE_URL}/audit-logs?${params.toString()}`, { headers: getAuthHeaders() });
    return handleResponse<any[]>(res);
  },

  // Operational Settings
  async getSettings() {
    const res = await fetch(`${API_BASE_URL}/settings`, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },

  async updateSettings(data: any) {
    const res = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  // Reports
  async getFinancialSummary(periodId?: string) {
    const url = periodId ? `${API_BASE_URL}/reports/financial-summary?period_id=${periodId}` : `${API_BASE_URL}/reports/financial-summary`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },
};
