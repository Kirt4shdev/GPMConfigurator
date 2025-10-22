import { create } from 'zustand';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    const response = await api.login(email, password);
    console.log('Login response:', response);
    console.log('Usuario logueado:', response.user);
    api.setToken(response.token);
    set({ user: response.user, isAuthenticated: true });
  },

  logout: () => {
    api.setToken(null);
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const token = api.getToken();
      if (!token) {
        console.log('checkAuth: No hay token, usuario no autenticado');
        set({ isLoading: false });
        return;
      }

      const user = await api.me();
      console.log('checkAuth: Usuario obtenido:', user);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.log('checkAuth: Error al obtener usuario:', error);
      api.setToken(null);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

