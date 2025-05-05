import { writable } from 'svelte/store';

interface User {
  user_id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    isAuthenticated: false
  });

  // Initialize from localStorage if available
  if (typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      set({
        user: JSON.parse(storedUser),
        isAuthenticated: true
      });
    }
  }

  return {
    subscribe,
    login: (user: User) => {
      localStorage.setItem('user', JSON.stringify(user));
      set({
        user,
        isAuthenticated: true
      });
    },
    logout: () => {
      localStorage.removeItem('user');
      set({
        user: null,
        isAuthenticated: false
      });
    }
  };
}

export const auth = createAuthStore(); 