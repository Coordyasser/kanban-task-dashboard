
import { User } from '@/types';

export interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, role: 'admin' | 'user') => Promise<boolean>;
  loading: boolean;
  authInitialized: boolean;
}
