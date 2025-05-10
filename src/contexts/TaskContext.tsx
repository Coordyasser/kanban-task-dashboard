
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
    // Pula a busca se nenhum usuário estiver logado
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
          // Admins veem tarefas que eles criaram
          query = supabase
            .from('tasks')
            .select(`
              *,
              task_assignments(user_id)
            `)
            .eq('created_by', currentUser.id);
        } else {
          // Usuários regulares veem tarefas às quais foram atribuídos
          query = supabase
            .from('tasks')
            .select(`
              *,
              task_assignments(user_id)
            `)
            .eq('task_assignments.user_id', currentUser.id);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Erro ao buscar tarefas:", error);
          toast.error('Falha ao carregar tarefas');
          // Usa dados simulados como fallback
          setTasks(mockTasks);
        } else if (data) {
          console.log("Tarefas buscadas com sucesso:", data);
          // Transforma os dados para corresponder ao nosso tipo Task
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
          
          console.log("Tarefas formatadas:", formattedTasks);
          setTasks(formattedTasks);
        }
      } catch (error) {
        console.error("Erro na busca de tarefas:", error);
        toast.error('Erro ao carregar tarefas');
        // Usa dados simulados como fallback
        setTasks(mockTasks);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [currentUser]);

  // Filtra tarefas para o usuário atual
  const userTasks = tasks;

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!currentUser || currentUser.role !== 'admin') {
      toast.error('Apenas administradores podem criar tarefas');
      return;
    }

    try {
      // Primeiro, insere a tarefa
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

      // Então, cria as atribuições
      const assignments = taskData.assignees.map((userId: string) => ({
        task_id: insertedTask.id,
        user_id: userId
      }));

      const { error: assignmentError } = await supabase
        .from('task_assignments')
        .insert(assignments);

      if (assignmentError) throw assignmentError;

      // Recarrega as tarefas para obter a lista atualizada
      const { data: updatedTasks, error: fetchError } = await supabase
        .from('tasks')
        .select(`
          *,
          task_assignments(user_id)
        `)
        .eq('created_by', currentUser.id);

      if (fetchError) throw fetchError;

      // Transforma os dados para corresponder ao nosso tipo Task
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
      console.error("Erro ao criar tarefa:", error);
      toast.error('Falha ao criar tarefa');
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
        // Primeiro deleta as atribuições existentes
        const { error: deleteError } = await supabase
          .from('task_assignments')
          .delete()
          .eq('task_id', id);

        if (deleteError) throw deleteError;

        // Então cria as novas atribuições
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

      // Recarrega as tarefas para obter a lista atualizada
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
      console.error("Erro ao atualizar tarefa:", error);
      toast.error('Falha ao atualizar tarefa');
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
      // Deleta as atribuições primeiro (devido às restrições de chave estrangeira)
      const { error: assignmentError } = await supabase
        .from('task_assignments')
        .delete()
        .eq('task_id', id);

      if (assignmentError) throw assignmentError;

      // Então deleta a tarefa
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Atualiza o estado local
      setTasks(tasks.filter(task => task.id !== id));
      toast.success('Tarefa excluída');
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      toast.error('Falha ao excluir tarefa');
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
    throw new Error('useTasks deve ser usado dentro de um TaskProvider');
  }
  return context;
}
