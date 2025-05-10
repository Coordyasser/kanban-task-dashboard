
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@/types';

export async function fetchUserProfile(userId: string): Promise<User | null> {
  try {
    console.log(`Fetching profile for user: ${userId}`);
    
    // Try up to 3 times with increasing delay to allow for profile creation
    for (let attempt = 1; attempt <= 3; attempt++) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileError) {
        console.error(`Error fetching profile (attempt ${attempt}):`, profileError);
        
        if (attempt < 3) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, attempt * 500));
          continue;
        }
        
        throw profileError;
      }
      
      if (profileData) {
        console.log(`Profile found on attempt ${attempt}:`, profileData);
        const user: User = {
          id: profileData.id,
          name: profileData.name,
          email: profileData.email,
          role: profileData.role as 'admin' | 'user',
          avatar: profileData.avatar || undefined
        };
        
        return user;
      } else if (attempt < 3) {
        console.log(`Profile not found on attempt ${attempt}, retrying...`);
        // Wait longer before retrying
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
    
    console.warn(`No profile found for user ${userId} after multiple attempts`);
    return null;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    toast.error('Erro ao buscar perfil do usuário');
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
      toast.error(error.message || 'Falha ao fazer login');
      return false;
    }
    
    if (data.user) {
      // Successfully authenticated
      console.log("Login successful, user ID:", data.user.id);
      toast.success('Login realizado com sucesso');
      return true;
    } else {
      console.error("No user returned from login attempt");
      toast.error('Login falhou');
      return false;
    }
  } catch (error: any) {
    console.error("Exception during login:", error);
    toast.error('Erro de login: ' + (error.message || 'Erro desconhecido'));
    return false;
  }
}

export async function performLogout(): Promise<void> {
  try {
    await supabase.auth.signOut();
    toast.info('Você foi desconectado');
  } catch (error: any) {
    console.error("Logout error:", error);
    toast.error('Erro ao desconectar: ' + (error.message || 'Erro desconhecido'));
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
      toast.error(error.message || 'Falha ao criar conta');
      return false;
    }
    
    if (data.user) {
      toast.success('Conta criada com sucesso');
      return true;
    } else {
      toast.error('Falha ao criar conta');
      return false;
    }
  } catch (error: any) {
    console.error("Exception during registration:", error);
    toast.error('Erro de registro: ' + (error.message || 'Erro desconhecido'));
    return false;
  }
}
