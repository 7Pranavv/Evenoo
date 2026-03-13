import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getDocument, setDocument, updateDocument } from '@/lib/db';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
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
  firebaseUser: null,
  initialized: false,
  loading: false,

  initialize: () => {
    onAuthStateChanged(auth, (firebaseUser) => {
      (async () => {
        set({ firebaseUser });
        if (firebaseUser) {
          await get().fetchUser(firebaseUser.uid);
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
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await get().fetchUser(cred.user.uid);
      set({ firebaseUser: cred.user, loading: false });
      return { error: null };
    } catch (error: any) {
      set({ loading: false });
      const msg = error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password'
        ? 'Invalid email or password'
        : error.message;
      return { error: msg };
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    set({ loading: true });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
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
      await setDocument('users', cred.user.uid, profile);
      await get().fetchUser(cred.user.uid);
      set({ firebaseUser: cred.user, loading: false });
      return { error: null };
    } catch (error: any) {
      set({ loading: false });
      const msg = error.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists'
        : error.message;
      return { error: msg };
    }
  },

  setRole: async (role: string) => {
    set({ loading: true });
    const { firebaseUser, user } = get();
    if (!firebaseUser) { set({ loading: false }); return { error: 'Not authenticated' }; }
    try {
      await updateDocument('users', firebaseUser.uid, { role });
      if (user) set({ user: { ...user, role: role as any } });
      else await get().fetchUser(firebaseUser.uid);
      set({ loading: false });
      return { error: null };
    } catch (error: any) {
      set({ loading: false });
      return { error: error.message };
    }
  },

  signOut: async () => {
    await firebaseSignOut(auth);
    set({ user: null, firebaseUser: null });
  },
}));
