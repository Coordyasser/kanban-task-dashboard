
import { Task, TaskStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { mockTasks } from '@/services/mockData';
import { toast } from 'sonner';

export const fetchTasks = async (currentUser: User | null) => {
  if (!currentUser) {
    console.log("Não há usuário autenticado, retornando lista vazia de tarefas");
    return [];
  }

  try {
    console.log("Buscando tarefas para o usuário:", currentUser.id, "Função:", currentUser.role);
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
          task_assignments(user_id)
        `));
        
      console.log("Query de admin retornou:", data?.length || 0, "tarefas");
    } else {
      // Usuários regulares veem tarefas às quais foram atribuídos
      ({ data, error } = await supabase
        .from('task_assignments')
        .select(`
          task_id,
          tasks!inner (
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
            task_assignments(user_id)
          )
        `)
        .eq('user_id', currentUser.id));
        
      console.log("Query de usuário regular retornou:", data?.length || 0, "atribuições");
    }

    console.log("Resposta do Supabase:", data);

    if (error) {
      console.error("Erro ao buscar tarefas:", error);
      toast.error('Falha ao carregar tarefas: ' + error.message);
      return [];
    } else if (data) {
      // Transforma os dados para corresponder ao nosso tipo Task
      let formattedTasks: Task[] = [];

      if (currentUser.role === 'admin') {
        formattedTasks = data.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          unit: task.unit,
          assignees: task.task_assignments?.map((assignment: any) => assignment.user_id) || [],
          startDate: task.start_date,
          endDate: task.end_date,
          status: task.status,
          createdBy: task.created_by,
          observations: task.observations || "",
          createdAt: task.created_at ? task.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
        }));
      } else {
        // Para usuários regulares, as tarefas estão aninhadas
        formattedTasks = data
          .filter(item => item.tasks !== null)
          .map(assignment => ({
            id: assignment.tasks.id,
            title: assignment.tasks.title,
            description: assignment.tasks.description,
            unit: assignment.tasks.unit,
            assignees: assignment.tasks.task_assignments?.map((a: any) => a.user_id) || [],
            startDate: assignment.tasks.start_date,
            endDate: assignment.tasks.end_date,
            status: assignment.tasks.status,
            createdBy: assignment.tasks.created_by,
            observations: assignment.tasks.observations || "",
            createdAt: assignment.tasks.created_at ? assignment.tasks.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
          }));
      }
      
      console.log("Tarefas formatadas:", formattedTasks);
      return formattedTasks;
    }
    
    console.log("Nenhum dado retornado, retornando lista vazia");
    return [];
  } catch (error) {
    console.error("Erro na busca de tarefas:", error);
    toast.error('Erro ao carregar tarefas');
    return [];
  }
};

export const getTaskById = (tasks: Task[], id: string) => {
  return tasks.find(task => task.id === id);
};

export const getTasksByStatus = (tasks: Task[], status: TaskStatus) => {
  return tasks.filter(task => task.status === status);
};

