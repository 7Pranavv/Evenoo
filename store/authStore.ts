import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { getDocument, setDocument, updateDocument } from '@/lib/db';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  initialized: boolean;
  loading: boolean;
  initialize: () => void;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  setRole: (role: string) => Promise<{ error: string | null }>;
  fetchUser: (uid: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  initialized: false,
  loading: false,

  initialize: () => {
    supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session?.user) {
          await get().fetchUser(session.user.id);
        } else {
          set({ user: null, initialized: true });
        }
      })();
    });
  },

  fetchUser: async (uid: string) => {
    try {
      const userData = await getDocument<User>('users', uid);
      set({ user: userData, initialized: true });
    } catch (error) {
      set({ user: null, initialized: true });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ loading: false });
        const msg =
          error.message === 'Invalid login credentials'
            ? 'Invalid email or password'
            : error.message;
        return { error: msg };
      }

      if (data.user) {
        await get().fetchUser(data.user.id);
      }
      set({ loading: false });
      return { error: null };
    } catch (error: any) {
      set({ loading: false });
      return { error: error.message };
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    set({ loading: true });
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        set({ loading: false });
        const msg = authError.message.includes('already registered')
          ? 'An account with this email already exists'
          : authError.message;
        return { error: msg };
      }

      if (authData.user) {
        const profile: Omit<User, 'id'> = {
          name,
          email,
          role: 'participant',
          avatar_url: null,
          wallet_balance: 0,
          organizer_verification_status: 'unverified',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: dbError } = await supabase.from('users').insert([
          {
            id: authData.user.id,
            ...profile,
          },
        ]);

        if (dbError) {
          set({ loading: false });
          return { error: dbError.message };
        }

        await get().fetchUser(authData.user.id);
      }
      set({ loading: false });
      return { error: null };
    } catch (error: any) {
      set({ loading: false });
      return { error: error.message };
    }
  },

  setRole: async (role: string) => {
    set({ loading: true });
    const { user } = get();
    if (!user) {
      set({ loading: false });
      return { error: 'Not authenticated' };
    }
    try {
      await updateDocument('users', user.id, { role });
      if (user) set({ user: { ...user, role: role as any } });
      else await get().fetchUser(user.id);
      set({ loading: false });
      return { error: null };
    } catch (error: any) {
      set({ loading: false });
      return { error: error.message };
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
