
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, role: 'admin' | 'user') => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
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
          
          // Fetch user profile data
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            throw profileError;
          }
          
          if (profileData) {
            console.log("Profile found:", profileData);
            const user: User = {
              id: profileData.id,
              name: profileData.name,
              email: profileData.email,
              role: profileData.role as 'admin' | 'user',
              avatar: profileData.avatar || undefined
            };
            
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
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();
            
            if (profileError) {
              console.error('Error fetching profile after sign in:', profileError);
              return;
            }
            
            if (profileData) {
              console.log("Profile updated after sign in:", profileData);
              const user: User = {
                id: profileData.id,
                name: profileData.name,
                email: profileData.email,
                role: profileData.role as 'admin' | 'user',
                avatar: profileData.avatar || undefined
              };
              
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
      console.log("Attempting login with:", email);
      
      // Clear any previous session first to prevent conflicts
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error);
        toast.error(error.message || 'Failed to login');
        return false;
      }
      
      if (data.user) {
        toast.success('Successfully logged in');
        return true;
      } else {
        toast.error('Login failed');
        return false;
      }
    } catch (error: any) {
      console.error("Exception during login:", error);
      toast.error('Login error: ' + (error.message || 'Unknown error'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      toast.info('You have been signed out');
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error('Error signing out: ' + (error.message || 'Unknown error'));
    }
  };

  const register = async (name: string, email: string, password: string, role: 'admin' | 'user'): Promise<boolean> => {
    setLoading(true);
    
    try {
      console.log("Attempting to register:", email, "as", role);
      
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
        console.error("Registration error:", error);
        toast.error(error.message || 'Failed to create account');
        return false;
      }
      
      if (data.user) {
        toast.success('Account created successfully');
        return true;
      } else {
        toast.error('Failed to create account');
        return false;
      }
    } catch (error: any) {
      console.error("Exception during registration:", error);
      toast.error('Registration error: ' + (error.message || 'Unknown error'));
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
