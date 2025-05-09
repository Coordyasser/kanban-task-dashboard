
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, TaskStatus, User } from '../types';
import { mockTasks } from '../services/mockData';
import { toast } from 'sonner';
import { useAuth } from './auth';
import { supabase } from '@/integrations/supabase/client';

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
    // Skip fetching if no user is logged in
    if (!currentUser) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      setLoading(true);
      try {
        let query;
        
        if (currentUser.role === 'admin') {
          // Admins see tasks they created
          query = supabase
            .from('tasks')
            .select(`
              *,
              task_assignments(user_id)
            `)
            .eq('created_by', currentUser.id);
        } else {
          // Regular users see tasks they are assigned to
          query = supabase
            .from('tasks')
            .select(`
              *,
              task_assignments!inner(user_id)
            `)
            .eq('task_assignments.user_id', currentUser.id);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching tasks:", error);
          toast.error('Failed to load tasks');
          // Fall back to mock data
          setTasks(mockTasks);
        } else if (data) {
          // Transform the data to match our Task type
          const formattedTasks: Task[] = data.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            unit: task.unit,
            assignees: task.task_assignments.map((assignment: any) => assignment.user_id),
            startDate: task.start_date,
            endDate: task.end_date,
            status: task.status,
            createdBy: task.created_by,
            observations: task.observations || "",
            createdAt: task.created_at.split('T')[0]
          }));
          
          setTasks(formattedTasks);
        }
      } catch (error) {
        console.error("Error in task fetching:", error);
        toast.error('Error loading tasks');
        // Fall back to mock data
        setTasks(mockTasks);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [currentUser]);

  // Filter tasks for the current user
  const userTasks = tasks;

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!currentUser || currentUser.role !== 'admin') {
      toast.error('Apenas administradores podem criar tarefas');
      return;
    }

    try {
      // First, insert the task
      const taskToInsert = {
        title: taskData.title,
        description: taskData.description,
        unit: taskData.unit,
        start_date: taskData.startDate,
        end_date: taskData.endDate,
        status: taskData.status,
        created_by: currentUser.id
      };
      
      const { data: insertedTask, error: taskError } = await supabase
        .from('tasks')
        .insert(taskToInsert)
        .select()
        .single();

      if (taskError) throw taskError;

      // Then, create the assignments
      const assignments = taskData.assignees.map((userId: string) => ({
        task_id: insertedTask.id,
        user_id: userId
      }));

      const { error: assignmentError } = await supabase
        .from('task_assignments')
        .insert(assignments);

      if (assignmentError) throw assignmentError;

      // Refetch tasks to get the updated list
      const { data: updatedTasks, error: fetchError } = await supabase
        .from('tasks')
        .select(`
          *,
          task_assignments(user_id)
        `)
        .eq('created_by', currentUser.id);

      if (fetchError) throw fetchError;

      // Transform the data to match our Task type
      const formattedTasks: Task[] = updatedTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        unit: task.unit,
        assignees: task.task_assignments.map((assignment: any) => assignment.user_id),
        startDate: task.start_date,
        endDate: task.end_date,
        status: task.status,
        createdBy: task.created_by,
        observations: task.observations || "",
        createdAt: task.created_at.split('T')[0]
      }));

      setTasks(formattedTasks);
      toast.success('Tarefa criada com sucesso');
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error('Failed to create task');
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const taskUpdates: any = {};
      if (updates.title) taskUpdates.title = updates.title;
      if (updates.description) taskUpdates.description = updates.description;
      if (updates.unit) taskUpdates.unit = updates.unit;
      if (updates.startDate) taskUpdates.start_date = updates.startDate;
      if (updates.endDate) taskUpdates.end_date = updates.endDate;
      if (updates.status) taskUpdates.status = updates.status;
      if (updates.observations !== undefined) taskUpdates.observations = updates.observations;

      if (Object.keys(taskUpdates).length > 0) {
        const { error } = await supabase
          .from('tasks')
          .update(taskUpdates)
          .eq('id', id);

        if (error) throw error;
      }

      if (updates.assignees) {
        // First delete existing assignments
        const { error: deleteError } = await supabase
          .from('task_assignments')
          .delete()
          .eq('task_id', id);

        if (deleteError) throw deleteError;

        // Then create new assignments
        const assignments = updates.assignees.map(userId => ({
          task_id: id,
          user_id: userId
        }));

        if (assignments.length > 0) {
          const { error: insertError } = await supabase
            .from('task_assignments')
            .insert(assignments);

          if (insertError) throw insertError;
        }
      }

      // Refetch tasks to get the updated list
      if (currentUser) {
        let query;
        
        if (currentUser.role === 'admin') {
          query = supabase
            .from('tasks')
            .select(`
              *,
              task_assignments(user_id)
            `)
            .eq('created_by', currentUser.id);
        } else {
          query = supabase
            .from('tasks')
            .select(`
              *,
              task_assignments!inner(user_id)
            `)
            .eq('task_assignments.user_id', currentUser.id);
        }

        const { data, error } = await query;

        if (error) throw error;

        const formattedTasks: Task[] = data.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          unit: task.unit,
          assignees: task.task_assignments.map((assignment: any) => assignment.user_id),
          startDate: task.start_date,
          endDate: task.end_date,
          status: task.status,
          createdBy: task.created_by,
          observations: task.observations || "",
          createdAt: task.created_at.split('T')[0]
        }));

        setTasks(formattedTasks);
      }

      toast.success('Tarefa atualizada com sucesso');
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error('Failed to update task');
    }
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    await updateTask(id, { status });
  };

  const deleteTask = async (id: string) => {
    if (!currentUser || currentUser.role !== 'admin') {
      toast.error('Apenas administradores podem excluir tarefas');
      return;
    }

    try {
      // Delete assignments first (due to foreign key constraints)
      const { error: assignmentError } = await supabase
        .from('task_assignments')
        .delete()
        .eq('task_id', id);

      if (assignmentError) throw assignmentError;

      // Then delete the task
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setTasks(tasks.filter(task => task.id !== id));
      toast.success('Tarefa excluída');
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error('Failed to delete task');
    }
  };

  const getTaskById = (id: string) => {
    return tasks.find(task => task.id === id);
  };

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    return tasks.filter(task => task.status === status);
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
