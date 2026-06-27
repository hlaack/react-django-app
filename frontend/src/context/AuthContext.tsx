import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError, ensureCsrfToken } from '../lib/api';
import type { User } from '../types';

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  password: string;
  email?: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isStaff: boolean;
  isSuperuser: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (credentials: RegisterCredentials) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Shared query key for the current-user query.
const CURRENT_USER_KEY = ['auth', 'currentUser'] as const;

/**
 * Fetch the logged-in user. The backend returns 401 when no session exists;
 * we translate that into `null` rather than an error so "logged out" is a
 * normal, non-erroring state.
 */
async function fetchCurrentUser(): Promise<User | null> {
  try {
    return await apiFetch<User>('/auth/me/');
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: fetchCurrentUser,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      // Make sure we hold a CSRF token before the POST.
      await ensureCsrfToken();
      return apiFetch<User>('/auth/login/', { method: 'POST', json: credentials });
    },
    onSuccess: (loggedInUser) => {
      // Seed the cache so the UI updates immediately, no refetch needed.
      queryClient.setQueryData(CURRENT_USER_KEY, loggedInUser);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      await ensureCsrfToken();
      return apiFetch<User>('/auth/register/', { method: 'POST', json: credentials });
    },
    onSuccess: (newUser) => {
      // Registration signs the user in, so seed the cache like login does.
      queryClient.setQueryData(CURRENT_USER_KEY, newUser);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiFetch<void>('/auth/logout/', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.setQueryData(CURRENT_USER_KEY, null);
      // Drop any data that was scoped to the logged-in user (e.g. notes).
      queryClient.invalidateQueries();
    },
  });

  const value: AuthContextValue = {
    user: user ?? null,
    isAuthenticated: !!user,
    isStaff: !!user?.is_staff,
    isSuperuser: !!user?.is_superuser,
    isLoading,
    login: (credentials) => loginMutation.mutateAsync(credentials),
    register: (credentials) => registerMutation.mutateAsync(credentials),
    logout: () => logoutMutation.mutateAsync(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
