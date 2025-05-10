
import { ReactNode } from 'react';
import { Task, TaskStatus } from '@/types';

export interface TaskContextType {
  tasks: Task[];
  userTasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'createdBy'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  getTaskById: (id: string) => Task | undefined;
  getTasksByStatus: (status: TaskStatus) => Task[];
  getUserTasksByStatus: (status: TaskStatus) => Task[];
  loading: boolean;
}

export interface TaskProviderProps {
  children: ReactNode;
}
