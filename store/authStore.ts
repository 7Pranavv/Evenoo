import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  session: any | null;
  initialized: boolean;
  loading: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  setRole: (role: string) => Promise<{ error: string | null }>;
  fetchUser: (uid: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  initialized: false,
  loading: false,

  initialize: async () => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth timeout')), 3000)
      );

      const sessionPromise = supabase.auth.getSession();
      const result = await Promise.race([sessionPromise, timeoutPromise]);
      const { data: { session } } = result as any;

      set({ session });
      if (session?.user) {
        await get().fetchUser(session.user.id);
      } else {
        set({ user: null });
      }
    } catch (error) {
      console.error('Auth init error:', error);
      set({ user: null, session: null });
    } finally {
      set({ initialized: true });
    }

    supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        set({ session });
        if (session?.user) {
          await get().fetchUser(session.user.id);
        } else {
          set({ user: null });
        }
      })();
    });
  },

  fetchUser: async (uid: string) => {
    try {
      const { data } = await supabase.from('users').select('*').eq('id', uid).maybeSingle();
      set({ user: data as User | null });
    } catch (error) {
      console.error('Error fetching user:', error);
      set({ user: null });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { set({ loading: false }); return { error: error.message }; }
    if (data.user) await get().fetchUser(data.user.id);
    set({ session: data.session, loading: false });
    return { error: null };
  },

  signUp: async (email: string, password: string, name: string) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { set({ loading: false }); return { error: error.message }; }
    if (!data.user) { set({ loading: false }); return { error: 'Signup failed' }; }
    const { error: profileError } = await supabase.from('users').insert({
      id: data.user.id,
      name,
      email,
      role: 'participant',
      wallet_balance: 0,
      organizer_verification_status: 'unverified',
    });
    if (profileError) { set({ loading: false }); return { error: profileError.message }; }
    await get().fetchUser(data.user.id);
    set({ session: data.session, loading: false });
    return { error: null };
  },

  setRole: async (role: string) => {
    set({ loading: true });
    const { user } = get();
    if (!user) { set({ loading: false }); return { error: 'Not authenticated' }; }
    const { error } = await supabase.from('users').update({ role, updated_at: new Date().toISOString() }).eq('id', user.id);
    if (error) { set({ loading: false }); return { error: error.message }; }
    set({ user: { ...user, role: role as any }, loading: false });
    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));
