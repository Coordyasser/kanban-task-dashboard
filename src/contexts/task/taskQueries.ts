
import { Task, TaskStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { mockTasks } from '@/services/mockData';
import { toast } from 'sonner';

export const fetchTasks = async (currentUser: User | null) => {
  if (!currentUser) {
    return [];
  }

  try {
    let { data, error } = { data: null, error: null };

    if (currentUser.role === 'admin') {
      // Admins veem tarefas que eles criaram
      ({ data, error } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          unit,
          start_date,
          end_date,
          status,
          created_by,
          observations,
          created_at,
          task_assignments!task_assignments_task_id_fkey (user_id)
        `)
        .eq('created_by', currentUser.id));
    } else {
      // Usuários regulares veem tarefas às quais foram atribuídos
      ({ data, error } = await supabase
        .from('task_assignments')
        .select(`
          task_id,
          tasks!task_assignments_task_id_fkey (
            id,
            title,
            description,
            unit, 
            start_date,
            end_date,
            status,
            created_by,
            observations,
            created_at,
            task_assignments!task_assignments_task_id_fkey (user_id)
          )
        `)
        .eq('user_id', currentUser.id));
    }

    console.log("Resposta do Supabase:", data);

    if (error) {
      console.error("Erro ao buscar tarefas:", error);
      toast.error('Falha ao carregar tarefas');
      // Usa dados simulados como fallback
      return mockTasks;
    } else if (data) {
      // Transforma os dados para corresponder ao nosso tipo Task
      let formattedTasks: Task[] = [];

      if (currentUser.role === 'admin') {
        formattedTasks = data.map(task => ({
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
      } else {
        // Para usuários regulares, as tarefas estão aninhadas
        formattedTasks = data.map(assignment => ({
          id: assignment.tasks.id,
          title: assignment.tasks.title,
          description: assignment.tasks.description,
          unit: assignment.tasks.unit,
          assignees: assignment.tasks.task_assignments.map((a: any) => a.user_id),
          startDate: assignment.tasks.start_date,
          endDate: assignment.tasks.end_date,
          status: assignment.tasks.status,
          createdBy: assignment.tasks.created_by,
          observations: assignment.tasks.observations || "",
          createdAt: assignment.tasks.created_at.split('T')[0]
        }));
      }
      
      console.log("Tarefas formatadas:", formattedTasks);
      return formattedTasks;
    }
    return [];
  } catch (error) {
    console.error("Erro na busca de tarefas:", error);
    toast.error('Erro ao carregar tarefas');
    // Usa dados simulados como fallback
    return mockTasks;
  }
};

export const getTaskById = (tasks: Task[], id: string) => {
  return tasks.find(task => task.id === id);
};

export const getTasksByStatus = (tasks: Task[], status: TaskStatus) => {
  return tasks.filter(task => task.status === status);
};
