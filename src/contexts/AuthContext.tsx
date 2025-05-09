
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: 'admin' | 'user') => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar sessão atual ao iniciar
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      
      try {
        // Verificar se já existe uma sessão ativa
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Buscar dados do perfil do usuário
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.error('Erro ao buscar perfil:', profileError);
            throw profileError;
          }
          
          if (profileData) {
            const user: User = {
              id: profileData.id,
              name: profileData.name,
              email: profileData.email,
              role: profileData.role,
              avatar: profileData.avatar || undefined
            };
            
            setCurrentUser(user);
          }
        }
      } catch (error) {
        console.error('Erro na verificação da sessão:', error);
        toast.error('Erro ao verificar a sessão');
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();

    // Configurar listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Buscar dados do perfil do usuário
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (!profileError && profileData) {
          const user: User = {
            id: profileData.id,
            name: profileData.name,
            email: profileData.email,
            role: profileData.role,
            avatar: profileData.avatar || undefined
          };
          
          setCurrentUser(user);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast.error(error.message);
        return false;
      }
      
      if (data.user) {
        toast.success('Login realizado com sucesso');
        return true;
      } else {
        toast.error('Erro ao fazer login');
        return false;
      }
    } catch (error: any) {
      toast.error('Erro ao fazer login: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      toast.info('Você saiu da sua conta');
    } catch (error: any) {
      toast.error('Erro ao sair: ' + error.message);
    }
  };

  const register = async (name: string, email: string, password: string, role: 'admin' | 'user'): Promise<boolean> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });
      
      if (error) {
        toast.error(error.message);
        return false;
      }
      
      if (data.user) {
        toast.success('Cadastro realizado com sucesso');
        return true;
      } else {
        toast.error('Erro ao criar conta');
        return false;
      }
    } catch (error: any) {
      toast.error('Erro ao criar conta: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
