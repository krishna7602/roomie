/**
 * AuthContext — real auth with token persistence.
 * Token is stored in localStorage (web) or expo-secure-store (native).
 */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { SafeUser } from '@roomie/shared';
import { RoomieApiClient } from '../services/api';

// ─── Token storage helpers (cross-platform) ───────────────────────────────────
const TOKEN_KEY = 'roomie_auth_token';

async function readToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(TOKEN_KEY);
    }
    const SecureStore = await import('expo-secure-store');
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function saveToken(token: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      const SecureStore = await import('expo-secure-store');
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  } catch (e) {
    console.warn('Failed to persist token', e);
  }
}

async function deleteToken(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(TOKEN_KEY);
    } else {
      const SecureStore = await import('expo-secure-store');
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch {}
}

// ─── Context type ─────────────────────────────────────────────────────────────
interface AuthContextType {
  user: SafeUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<SafeUser>) => Promise<void>;
  refresh: () => Promise<void>;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  age: number;
  gender: string;
  occupation: string;
  targetCity: string;
  budgetMin: number;
  budgetMax: number;
  bio?: string;
  lifestyle?: Record<string, any>;
  moveInDate?: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: async () => {},
  refresh: async () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: restore session from persisted token
  useEffect(() => {
    (async () => {
      try {
        const stored = await readToken();
        if (stored) {
          RoomieApiClient.setToken(stored);
          const me = await RoomieApiClient.getMe();
          setToken(stored);
          setUser(me);
        }
      } catch {
        // Token expired or invalid — clear it
        await deleteToken();
        RoomieApiClient.setToken(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await RoomieApiClient.login(email, password);
    if (res.token === 'offline-token') {
      // offline mode: still set user so the UI works
      setUser(res.user);
      setToken(res.token);
      return;
    }
    await saveToken(res.token);
    RoomieApiClient.setToken(res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (data: RegisterInput) => {
    const res = await RoomieApiClient.register(data);
    await saveToken(res.token);
    RoomieApiClient.setToken(res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    await deleteToken();
    RoomieApiClient.setToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback(async (data: Partial<SafeUser>) => {
    const res = await RoomieApiClient.updateProfile(data);
    setUser(res.user);
  }, []);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const me = await RoomieApiClient.getMe();
      setUser(me);
    } catch {
      await logout();
    }
  }, [token, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        refresh,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
