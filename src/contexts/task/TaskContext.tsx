
import { createContext, useContext, useState, useEffect } from 'react';
import { Task, TaskStatus } from '@/types';
import { useAuth } from '../auth';
import { TaskContextType, TaskProviderProps } from './types';
import { fetchTasks, getTaskById, getTasksByStatus } from './taskQueries';
import { addTask as addTaskMutation, updateTask as updateTaskMutation, updateTaskStatus as updateTaskStatusMutation, deleteTask as deleteTaskMutation } from './taskMutations';
import { toast } from 'sonner';

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: TaskProviderProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadTasks = async () => {
      if (!currentUser) {
        setTasks([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const fetchedTasks = await fetchTasks(currentUser);
        setTasks(fetchedTasks);
      } catch (error) {
        console.error("Erro ao carregar tarefas:", error);
        toast.error('Falha ao carregar tarefas');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [currentUser]);

  // Filtra tarefas para o usuário atual
  const userTasks = tasks;

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'createdBy'>) => {
    const updatedTasks = await addTaskMutation(taskData, currentUser);
    if (updatedTasks) {
      setTasks(updatedTasks);
      toast.success('Tarefa criada com sucesso');
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const updatedTasks = await updateTaskMutation(id, updates, currentUser);
    if (updatedTasks) {
      setTasks(updatedTasks);
      toast.success('Tarefa atualizada com sucesso');
    }
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    const updatedTasks = await updateTaskStatusMutation(id, status, currentUser);
    if (updatedTasks) {
      setTasks(updatedTasks);
    }
  };

  const deleteTask = async (id: string) => {
    const deletedId = await deleteTaskMutation(id, currentUser);
    if (deletedId) {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  const getUserTasksByStatus = (status: TaskStatus): Task[] => {
    return userTasks.filter(task => task.status === status);
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
        getTaskById: (id: string) => getTaskById(tasks, id),
        getTasksByStatus: (status: TaskStatus) => getTasksByStatus(tasks, status),
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
    throw new Error('useTasks deve ser usado dentro de um TaskProvider');
  }
  return context;
}
