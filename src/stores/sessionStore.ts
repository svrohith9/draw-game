import { create } from 'zustand';
import { 
  fetchUserSessions, 
  createUserSession, 
  joinUserSession, 
  leaveUserSession 
} from '../lib/supabase/sessions';
import type { Session } from '../types';

interface SessionState {
  sessions: Session[];
  currentSession: Session | null;
  loading: boolean;
  error: string | null;
  fetchSessions: () => Promise<void>;
  createSession: (name: string) => Promise<void>;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: (sessionId: string) => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  currentSession: null,
  loading: false,
  error: null,
  fetchSessions: async () => {
    set({ loading: true, error: null });
    try {
      const sessions = await fetchUserSessions();
      set({ sessions, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch sessions', loading: false });
      throw err;
    }
  },
  createSession: async (name: string) => {
    set({ error: null });
    try {
      const session = await createUserSession(name);
      set((state) => ({
        sessions: [session, ...state.sessions],
        currentSession: session,
      }));
      await joinUserSession(session.id);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to create session' });
      throw err;
    }
  },
  joinSession: async (sessionId: string) => {
    set({ error: null });
    try {
      const session = await joinUserSession(sessionId);
      set({ currentSession: session });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to join session' });
      throw err;
    }
  },
  leaveSession: async (sessionId: string) => {
    set({ error: null });
    try {
      await leaveUserSession(sessionId);
      set({ currentSession: null });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to leave session' });
      throw err;
    }
  },
}));