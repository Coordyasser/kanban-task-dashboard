import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@/types';
import { Json } from '@/integrations/supabase/types';

// Helper function to check if a JSON value is a profile object
function isProfileObject(value: Json): value is {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
} {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.role === 'string'
  );
}

export async function fetchUserProfile(userId: string): Promise<User | null> {
  try {
    console.log(`Fetching profile for user: ${userId}`);
    
    // Direct profiles query as the primary method - more reliable
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (profileError) {
      console.error('Error in direct profile query:', profileError);
      
      // Try RPC function as fallback
      try {
        console.log('Trying RPC fallback...');
        const { data: rpcData, error: rpcError } = await (supabase.rpc as any)('fetchuserprofile', {
          userid: userId
        });
        
        if (rpcError) {
          console.error('Error in RPC fallback:', rpcError);
          toast.error('Erro ao buscar perfil do usuário');
          return null;
        }
        
        if (rpcData && isProfileObject(rpcData)) {
          console.log('Profile found via RPC function:', rpcData);
          const user: User = {
            id: rpcData.id,
            name: rpcData.name,
            email: rpcData.email,
            role: rpcData.role as 'admin' | 'user',
            avatar: rpcData.avatar || undefined
          };
          
          return user;
        }
      } catch (rpcErr) {
        console.error('Exception in RPC fallback:', rpcErr);
      }
      
      return null;
    }
    
    if (profileData) {
      console.log('Profile found via direct query:', profileData);
      const user: User = {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        role: profileData.role as 'admin' | 'user',
        avatar: profileData.avatar || undefined
      };
      
      return user;
    }
    
    console.warn(`No profile found for user ${userId}`);
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
