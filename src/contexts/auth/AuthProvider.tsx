
import React, { useState, useEffect, ReactNode } from 'react';
import { User } from '../../types';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';
import { AuthContext } from './AuthContext';
import { fetchUserProfile, performLogin, performLogout, performRegister } from './authUtils';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Check session on initial load
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      
      try {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Session found:", session.user.id);
          
          try {
            const user = await fetchUserProfile(session.user.id);
            if (user) {
              console.log("Profile loaded successfully:", user);
              setCurrentUser(user);
            } else {
              console.warn("No profile found for authenticated user");
              toast.error("Erro ao carregar perfil do usuário");
              // Force logout if profile can't be loaded
              await supabase.auth.signOut();
            }
          } catch (error) {
            console.error("Error fetching profile:", error);
            toast.error("Erro ao carregar perfil");
            await supabase.auth.signOut();
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        toast.error('Erro ao verificar sessão de autenticação');
      } finally {
        setLoading(false);
        setAuthInitialized(true);
      }
    };
    
    checkSession();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session) {
        setLoading(true);
        
        try {
          console.log("Attempting to fetch user profile after sign in");
          const user = await fetchUserProfile(session.user.id);
          
          if (user) {
            console.log("Profile updated after sign in:", user);
            setCurrentUser(user);
          } else {
            console.warn("No profile found for authenticated user after sign in");
            toast.error("Erro ao carregar perfil do usuário");
            // Force logout if profile can't be loaded
            await supabase.auth.signOut();
          }
        } catch (error) {
          console.error('Error processing auth state change:', error);
          toast.error("Erro ao processar alteração de autenticação");
        } finally {
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const success = await performLogin(email, password);
      return success;
    } finally {
      // Note: loading state will be handled by the auth state change listener
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await performLogout();
      setCurrentUser(null);
    } catch (error) {
      console.error("Error in logout:", error);
      toast.error("Erro ao fazer logout");
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: 'admin' | 'user'): Promise<boolean> => {
    setLoading(true);
    try {
      const success = await performRegister(name, email, password, role);
      return success;
    } finally {
      // Note: loading state will be handled by the auth state change listener
    }
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      login, 
      logout, 
      register, 
      loading,
      authInitialized 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
