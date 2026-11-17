import {
  Chore,
  Expense,
  ListingWithHost,
  RoommateCandidate,
  SafeUser,
  SwipeDirection,
} from '@roomie/shared';
import {
  FALLBACK_CANDIDATES,
  FALLBACK_CHORES,
  FALLBACK_EXPENSES,
  FALLBACK_USER,
} from './fallbackData';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

export class RoomieApiClient {
  private static token: string | null = null;
  public static isConnected = false;

  static setToken(token: string | null) {
    this.token = token;
  }

  static getBaseUrl() {
    return API_BASE_URL;
  }

  private static getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  static async checkHealth(): Promise<{ status: string; stats?: any }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error('Healthcheck failed');
      this.isConnected = true;
      return await res.json();
    } catch (err: any) {
      this.isConnected = false;
      return { status: 'offline' };
    }
  }

  static async register(data: {
    name: string;
    email: string;
    password: string;
    age: number;
    gender: string;
    occupation: string;
    targetCity: string;
    budgetMin: number;
    budgetMax: number;
    lifestyle?: Record<string, any>;
    bio?: string;
    moveInDate?: string;
  }): Promise<{ user: SafeUser; token: string }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || json.message || 'Registration failed');
    this.isConnected = true;
    this.setToken(json.token);
    return json;
  }

  static async updateProfile(updates: Partial<SafeUser> & { password?: string }): Promise<{ user: SafeUser }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Update failed');
    return json;
  }

  static async getMe(): Promise<SafeUser> {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: this.getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to get profile');
    return json.user;
  }

  static async login(email: string, password = 'password123'): Promise<{ user: SafeUser; token: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      this.isConnected = true;
      this.setToken(data.token);
      return data;
    } catch (err) {
      this.isConnected = false;
      this.setToken('offline-token');
      return {
        user: { ...FALLBACK_USER, email, name: email.split('@')[0].toUpperCase() },
        token: 'offline-token',
      };
    }
  }

  static async getCandidates(): Promise<RoommateCandidate[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${API_BASE_URL}/api/roommates/candidates`, {
        headers: this.getHeaders(),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch candidates');
      this.isConnected = true;
      return data.candidates && data.candidates.length > 0 ? data.candidates : FALLBACK_CANDIDATES;
    } catch (err) {
      this.isConnected = false;
      return FALLBACK_CANDIDATES;
    }
  }

  static async swipe(targetUserId: string, direction: SwipeDirection) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/roommates/swipe`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ targetUserId, direction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Swipe failed');
      return data;
    } catch (err) {
      return {
        success: true,
        direction,
        isMatch: direction === 'like',
      };
    }
  }

  static async getMatches() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/roommates/matches`, {
        headers: this.getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch matches');
      return data.matches || [];
    } catch (err) {
      return [];
    }
  }

  static async getListings(city?: string): Promise<ListingWithHost[]> {
    try {
      const query = city ? `?city=${encodeURIComponent(city)}` : '';
      const res = await fetch(`${API_BASE_URL}/api/listings${query}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch listings');
      return data.listings || [];
    } catch (err) {
      return [];
    }
  }

  static async getChores(): Promise<Chore[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${API_BASE_URL}/api/hub/chores`, {
        headers: this.getHeaders(),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch chores');
      return data.chores && data.chores.length > 0 ? data.chores : FALLBACK_CHORES;
    } catch (err) {
      return FALLBACK_CHORES;
    }
  }

  static async updateChoreStatus(choreId: string, status: 'pending' | 'completed'): Promise<Chore> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/hub/chores/${choreId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update chore');
      return data.chore;
    } catch (err) {
      const chore = FALLBACK_CHORES.find((c) => c.id === choreId);
      return chore ? { ...chore, status } : ({} as any);
    }
  }

  static async getExpenses(): Promise<{ expenses: Expense[]; balances: Record<string, number> }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${API_BASE_URL}/api/hub/expenses`, {
        headers: this.getHeaders(),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch expenses');
      return { expenses: data.expenses || [], balances: data.balances || {} };
    } catch (err) {
      return { expenses: FALLBACK_EXPENSES, balances: {} };
    }
  }

  static async settleExpense(expenseId: string): Promise<Expense> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/hub/expenses/${expenseId}/settle`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ settled: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to settle expense');
      return data.expense;
    } catch (err) {
      const exp = FALLBACK_EXPENSES.find((e) => e.id === expenseId);
      return exp ? { ...exp, settled: true } : ({} as any);
    }
  }
}
