
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@/types';

export async function fetchUserProfile(userId: string): Promise<User | null> {
  try {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw profileError;
    }
    
    if (profileData) {
      const user: User = {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        role: profileData.role as 'admin' | 'user',
        avatar: profileData.avatar || undefined
      };
      
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
}

export async function performLogin(email: string, password: string): Promise<boolean> {
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
      // Successfully authenticated
      console.log("Login successful, user ID:", data.user.id);
      return true;
    } else {
      console.error("No user returned from login attempt");
      toast.error('Login failed');
      return false;
    }
  } catch (error: any) {
    console.error("Exception during login:", error);
    toast.error('Login error: ' + (error.message || 'Unknown error'));
    return false;
  }
}

export async function performLogout(): Promise<void> {
  try {
    await supabase.auth.signOut();
    toast.info('You have been signed out');
  } catch (error: any) {
    console.error("Logout error:", error);
    toast.error('Error signing out: ' + (error.message || 'Unknown error'));
  }
}

export async function performRegister(
  name: string, 
  email: string, 
  password: string, 
  role: 'admin' | 'user'
): Promise<boolean> {
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
  }
}
