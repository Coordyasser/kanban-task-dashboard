
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { mockUsers } from '../services/mockData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserContextType {
  users: User[];
  getUser: (id: string) => User | undefined;
  getUsersByIds: (ids: string[]) => User[];
  getAllUsers: () => User[];
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        console.log("Buscando todos os usuários/perfis");
        // Tenta buscar usuários do Supabase
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*');
        
        if (error) {
          console.error("Erro ao buscar perfis de usuário:", error);
          toast.error('Erro ao carregar perfis de usuários: ' + error.message);
          // Fallback para dados simulados
          setUsers(mockUsers);
        } else if (profiles && profiles.length > 0) {
          console.log("Perfis de usuários carregados:", profiles.length, "perfis encontrados");
          
          // Converte perfis para o formato User
          const formattedUsers: User[] = profiles.map(profile => ({
            id: profile.id,
            name: profile.name || 'Usuário sem nome',
            email: profile.email || 'sem-email',
            role: profile.role || 'user',
            avatar: profile.avatar
          }));
          
          console.log("Usuários formatados:", formattedUsers);
          setUsers(formattedUsers);
        } else {
          console.warn("Nenhum perfil encontrado no banco de dados");
          setUsers([]);
        }
      } catch (error: any) {
        console.error("Erro ao buscar usuários:", error);
        toast.error('Erro ao carregar usuários: ' + (error.message || 'Erro desconhecido'));
        // Usa dados simulados como fallback
        setUsers(mockUsers);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getUser = (id: string): User | undefined => {
    return users.find(user => user.id === id);
  };

  const getUsersByIds = (ids: string[]): User[] => {
    if (!ids || ids.length === 0) return [];
    
    console.log("Buscando usuários com IDs:", ids);
    console.log("Usuários disponíveis:", users.map(u => ({id: u.id, name: u.name})));
    
    const foundUsers = users.filter(user => ids.includes(user.id));
    console.log("Usuários encontrados:", foundUsers.length);
    
    return foundUsers;
  };

  const getAllUsers = (): User[] => {
    return users;
  };

  return (
    <UserContext.Provider
      value={{
        users,
        getUser,
        getUsersByIds,
        getAllUsers,
        loading
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
}
