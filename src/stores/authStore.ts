import create from "zustand";
import { supabase } from "../lib/supabase/client"; // Adjust path if needed

interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      set({ user: data.user, loading: false, error: null });
      console.log("Sign-in successful:", data.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      set({ user: null, loading: false, error: errorMessage });
      console.error("Sign-in error:", err);
    }
  },
  signOut: async () => {
    console.log("Attempting to log out...");
    try {
      await supabase.auth.signOut(); // Logs the user out from Supabase
      console.log("Logout successful");
      set({ user: null }); // Clear the user state
    } catch (err) {
      console.error("Logout failed:", err);
    }
  },
  signUp: async (email: string, password: string, username: string) => {
    console.log("Attempting to sign up...");
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }, // Save additional metadata like username
        },
      });
      if (error) throw error;

      console.log("Sign-up successful:", data.user);
      set({ user: data.user, loading: false });
    } catch (err) {
      console.error("Sign-up failed:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Sign-up failed";
      set({ loading: false, error: errorMessage });
      throw err;
    }
  },

  initialize: async () => {
    console.log("Initializing user session...");
    const { data } = await supabase.auth.getUser();
    set({ user: data.user, loading: false, error: null });
    console.log("User initialized:", data.user);
  },
}));
