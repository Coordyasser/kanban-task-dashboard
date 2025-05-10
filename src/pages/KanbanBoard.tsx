
import { useState, useEffect } from "react";
import { useTasks } from "@/contexts/task";
import { TaskStatus, Task } from "@/types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import TaskCard from "@/components/kanban/TaskCard";
import KanbanColumn from "@/components/kanban/KanbanColumn";
import TaskDetailDialog from "@/components/kanban/TaskDetailDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

const KanbanBoard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getUserTasksByStatus, updateTaskStatus, updateTask, deleteTask, loading, tasks } = useTasks();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [observation, setObservation] = useState("");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const todoTasks = getUserTasksByStatus("todo");
  const progressTasks = getUserTasksByStatus("progress");
  const completedTasks = getUserTasksByStatus("completed");
  
  // Verificar conexão com o Supabase
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('profiles').select('count').limit(1);
        if (error) {
          setConnectionError(`Erro de conexão com o banco de dados: ${error.message}`);
        } else {
          setConnectionError(null);
        }
      } catch (err: any) {
        setConnectionError(`Falha na conexão: ${err.message || 'Erro desconhecido'}`);
      }
    };
    
    checkConnection();
  }, []);

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (status: TaskStatus) => {
    if (draggedTask && draggedTask.status !== status) {
      updateTaskStatus(draggedTask.id, status);
      setDraggedTask(null);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setObservation(task.observations || "");
  };

  const handleSaveObservation = () => {
    if (selectedTask) {
      updateTask(selectedTask.id, { observations: observation });
      setSelectedTask(null);
      toast.success("Observações salvas");
    }
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    // Se a tarefa excluída estiver selecionada, fecha o diálogo de detalhes
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(null);
    }
    toast.success("Tarefa excluída");
  };

  // Navega para a página de Adicionar Tarefa
  const handleNavigateToAddTask = () => {
    navigate('/tasks/new');
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full w-full pt-6">
        <div className="space-y-6 w-full">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((column) => (
              <div key={column} className="bg-background/50 rounded-lg p-4 border border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
                
                <div className="space-y-3">
                  {[1, 2, 3].map((task) => (
                    <Skeleton key={task} className="h-32 w-full rounded-md" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Função auxiliar para renderizar cartões de tarefas com botão de excluir
  const renderTaskCard = (task: Task) => (
    <TaskCard 
      key={task.id}
      task={task}
      onDragStart={handleDragStart}
      onClick={handleTaskClick}
      onDelete={handleDeleteTask}
    />
  );

  return (
    <div className="flex flex-col h-full w-full pt-4">
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">DPGEtask Kanban</h1>
          {currentUser?.role === 'admin' && (
            <Button 
              className="glassmorphism bg-primary/80 hover:bg-primary/90 rounded-full h-12 w-12 p-0 fixed bottom-6 right-6 md:static md:h-10 md:w-auto md:px-4 md:py-2 shadow-lg hover:shadow-xl transition-all duration-300 z-10"
              onClick={handleNavigateToAddTask}
            >
              <Plus className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Criar Tarefa</span>
            </Button>
          )}
        </div>
        
        {connectionError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Problema de conexão</AlertTitle>
            <AlertDescription>{connectionError}</AlertDescription>
          </Alert>
        )}
        
        {tasks.length === 0 && !loading && !connectionError && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Nenhuma tarefa encontrada</AlertTitle>
            <AlertDescription>
              {currentUser?.role === 'admin' 
                ? 'Você não possui tarefas criadas. Clique em "Criar Tarefa" para adicionar uma nova tarefa.' 
                : 'Você não possui tarefas atribuídas. Entre em contato com um administrador.'}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="kanban-board">
          <KanbanColumn
            title="A Fazer"
            tasks={getUserTasksByStatus("todo")}
            status="todo"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onTaskDragStart={handleDragStart}
            onTaskClick={handleTaskClick}
            onTaskDelete={handleDeleteTask}
            emptyStateMessage={<p className="text-sm text-gray-500 text-center my-4">Nenhuma tarefa a fazer</p>}
            renderTask={renderTaskCard}
          />
          
          <KanbanColumn
            title="Em Progresso"
            tasks={getUserTasksByStatus("progress")}
            status="progress"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onTaskDragStart={handleDragStart}
            onTaskClick={handleTaskClick}
            onTaskDelete={handleDeleteTask}
            emptyStateMessage={<p className="text-sm text-gray-500 text-center my-4">Nenhuma tarefa em progresso</p>}
            renderTask={renderTaskCard}
          />
          
          <KanbanColumn
            title="Concluído"
            tasks={getUserTasksByStatus("completed")}
            status="completed"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onTaskDragStart={handleDragStart}
            onTaskClick={handleTaskClick}
            onTaskDelete={handleDeleteTask}
            emptyStateMessage={<p className="text-sm text-gray-500 text-center my-4">Nenhuma tarefa concluída</p>}
            renderTask={renderTaskCard}
          />
        </div>
        
        {/* Diálogo de Detalhes da Tarefa */}
        <TaskDetailDialog
          task={selectedTask}
          observation={observation}
          setObservation={setObservation}
          onClose={() => setSelectedTask(null)}
          onSave={handleSaveObservation}
          onDelete={handleDeleteTask}
        />
        
        {/* Informações de Depuração */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-8 p-4 border border-dashed border-gray-300 rounded-md">
            <h3 className="text-sm font-semibold mb-2">Informações de Depuração:</h3>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>Usuário: {currentUser?.name} ({currentUser?.role})</li>
              <li>Total de tarefas carregadas: {tasks.length}</li>
              <li>A Fazer: {todoTasks.length} | Em Progresso: {progressTasks.length} | Concluído: {completedTasks.length}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;
