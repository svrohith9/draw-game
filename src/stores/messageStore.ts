import { create } from 'zustand';
import { supabase } from '../lib/supabase/client';
import { fetchSessionMessages, sendSessionMessage } from '../lib/supabase/messages';
import type { Message } from '../types';

interface MessageState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  subscribeToMessages: (sessionId: string) => void;
  unsubscribeFromMessages: () => void;
  sendMessage: (content: string, sessionId: string) => Promise<void>;
}

export const useMessageStore = create<MessageState>((set) => ({
  messages: [],
  loading: false,
  error: null,
  subscribeToMessages: (sessionId: string) => {
    set({ loading: true, error: null });

    fetchSessionMessages(sessionId)
      .then((messages) => set({ messages, loading: false }))
      .catch((err) => set({ 
        error: err instanceof Error ? err.message : 'Failed to fetch messages',
        loading: false 
      }));

    const subscription = supabase
      .channel(`messages:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `session_id=eq.${sessionId}`,
        },
        async (payload) => {
          const { data: message } = await supabase
            .from('messages')
            .select(`
              *,
              profiles (
                username
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (message) {
            set((state) => ({
              messages: [...state.messages, message],
            }));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },
  unsubscribeFromMessages: () => {
    set({ messages: [], error: null });
  },
  sendMessage: async (content: string, sessionId: string) => {
    set({ error: null });
    try {
      await sendSessionMessage(content, sessionId);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to send message' });
      throw err;
    }
  },
}));