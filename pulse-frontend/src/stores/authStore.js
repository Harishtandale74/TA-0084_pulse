import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,

      login: (userData, token) => {
        set({
          user: userData,
          token: token,
          role: userData.role,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          role: null,
          isAuthenticated: false,
          isLoading: false,
        });
        localStorage.removeItem('pulse-auth');
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      initializeAuth: () => {
        const stored = localStorage.getItem('pulse-auth');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.state?.token && parsed.state?.user) {
              set({
                user: parsed.state.user,
                token: parsed.state.token,
                role: parsed.state.role,
                isAuthenticated: true,
              });
            }
          } catch (e) {
            console.error('Failed to parse auth state:', e);
          }
        }
      },

      hasRole: (roles) => {
        const { role } = get();
        if (!role) return false;
        if (Array.isArray(roles)) {
          return roles.includes(role);
        }
        return role === roles;
      },
    }),
    {
      name: 'pulse-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
