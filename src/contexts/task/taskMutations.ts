
import { Task, TaskStatus, User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { fetchTasks } from './taskQueries';

export const addTask = async (
  taskData: Omit<Task, 'id' | 'createdAt' | 'createdBy'>, 
  currentUser: User | null
) => {
  if (!currentUser || currentUser.role !== 'admin') {
    toast.error('Apenas administradores podem criar tarefas');
    return null;
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

    // Retorna as tarefas atualizadas
    return await fetchTasks(currentUser);
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    toast.error('Falha ao criar tarefa');
    return null;
  }
};

export const updateTask = async (
  id: string, 
  updates: Partial<Task>, 
  currentUser: User | null
) => {
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

    // Retorna as tarefas atualizadas
    if (currentUser) {
      return await fetchTasks(currentUser);
    }

    toast.success('Tarefa atualizada com sucesso');
    return null;
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    toast.error('Falha ao atualizar tarefa');
    return null;
  }
};

export const updateTaskStatus = async (
  id: string, 
  status: TaskStatus, 
  currentUser: User | null
) => {
  return await updateTask(id, { status }, currentUser);
};

export const deleteTask = async (id: string, currentUser: User | null) => {
  if (!currentUser || currentUser.role !== 'admin') {
    toast.error('Apenas administradores podem excluir tarefas');
    return null;
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

    toast.success('Tarefa excluída');
    return id;
  } catch (error) {
    console.error("Erro ao excluir tarefa:", error);
    toast.error('Falha ao excluir tarefa');
    return null;
  }
};
