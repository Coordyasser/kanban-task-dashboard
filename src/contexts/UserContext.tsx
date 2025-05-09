
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { mockUsers } from '../services/mockData';

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
    // In a real app, we would fetch users from an API
    setUsers(mockUsers);
    setLoading(false);
  }, []);

  const getUser = (id: string): User | undefined => {
    return users.find(user => user.id === id);
  };

  const getUsersByIds = (ids: string[]): User[] => {
    return users.filter(user => ids.includes(user.id));
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
