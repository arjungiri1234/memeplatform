import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState, Profile } from '../lib/types'

interface AuthActions {
  setUser: (user: AuthState['user']) => void
  setProfile: (profile: Profile | null) => void
  setSession: (session: AuthState['session']) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  user: null,
  profile: null,
  session: null,
  loading: true,
  error: null,
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      reset: () => set({ ...initialState, loading: false }),
    }),
    {
      name: 'memeit-auth',
      partialize: (state) => ({
        session: state.session,
      }),
    },
  ),
)
