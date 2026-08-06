import { create } from 'zustand';
import type { AuthSession } from '../../domain/auth';

interface AuthState {
  session: AuthSession | null;
  setSession: (session: AuthSession) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  clear: () => set({ session: null }),
}));