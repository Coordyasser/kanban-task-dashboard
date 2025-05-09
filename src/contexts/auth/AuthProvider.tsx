
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

  // Check session on initial load
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      
      try {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Session found:", session.user.id);
          
          const user = await fetchUserProfile(session.user.id);
          if (user) {
            setCurrentUser(user);
          } else {
            console.warn("No profile found for authenticated user");
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        toast.error('Error checking authentication session');
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session) {
        // Fetch profile data using a timeout to avoid deadlocks
        setTimeout(async () => {
          try {
            const user = await fetchUserProfile(session.user.id);
            if (user) {
              console.log("Profile updated after sign in:", user);
              setCurrentUser(user);
            } else {
              console.warn("No profile found for authenticated user");
            }
          } catch (error) {
            console.error('Error processing auth state change:', error);
          }
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
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
      const success = await performLogin(email, password);
      return success;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await performLogout();
      setCurrentUser(null);
    } catch (error) {
      console.error("Error in logout:", error);
    }
  };

  const register = async (name: string, email: string, password: string, role: 'admin' | 'user'): Promise<boolean> => {
    setLoading(true);
    try {
      const success = await performRegister(name, email, password, role);
      return success;
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
