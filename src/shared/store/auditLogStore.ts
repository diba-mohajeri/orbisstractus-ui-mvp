import { create } from 'zustand';
import { useAuthStore } from './authStore';

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
}

interface AuditLogState {
  events: AuditEvent[];
  logEvent: (action: string, detail: string) => void;
}

export const useAuditLogStore = create<AuditLogState>((set) => ({
  events: [],
  logEvent: (action, detail) =>
    set((state) => {
      const actor = useAuthStore.getState().session?.user.email ?? 'Unknown user';
      return {
        events: [
          { id: `EVT-${Date.now()}`, timestamp: new Date().toISOString(), actor, action, detail },
          ...state.events,
        ].slice(0, 50),
      };
    }),
}));
