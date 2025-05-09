
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, TaskStatus, User } from '../types';
import { mockTasks } from '../services/mockData';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

interface TaskContextType {
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

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    // In a real app, we would fetch tasks from an API
    setTasks(mockTasks);
    setLoading(false);
  }, []);

  // Filter tasks for the current user
  const userTasks = currentUser
    ? tasks.filter(task => 
        currentUser.role === 'admin' || 
        task.assignees.includes(currentUser.id)
      )
    : [];

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!currentUser || currentUser.role !== 'admin') {
      toast.error('Only admins can create tasks');
      return;
    }

    const newTask: Task = {
      ...taskData,
      id: `${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: currentUser.id,
    };

    setTasks([...tasks, newTask]);
    toast.success('Task created successfully');
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], ...updates };
    setTasks(updatedTasks);
    toast.success('Task updated successfully');
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    updateTask(id, { status });
  };

  const deleteTask = (id: string) => {
    if (!currentUser || currentUser.role !== 'admin') {
      toast.error('Only admins can delete tasks');
      return;
    }

    setTasks(tasks.filter(task => task.id !== id));
    toast.success('Task deleted');
  };

  const getTaskById = (id: string) => {
    return tasks.find(task => task.id === id);
  };

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    return tasks.filter(task => task.status === status);
  };

  const getUserTasksByStatus = (status: TaskStatus): Task[] => {
    if (!currentUser) return [];
    
    if (currentUser.role === 'admin') {
      return tasks.filter(task => task.status === status);
    }
    
    return tasks.filter(
      task => task.status === status && task.assignees.includes(currentUser.id)
    );
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        userTasks,
        addTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        getTaskById,
        getTasksByStatus,
        getUserTasksByStatus,
        loading
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
