import { useState } from "react";
import { useTasks } from "@/contexts/TaskContext";
import { TaskStatus, Task } from "@/types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import TaskCard from "@/components/kanban/TaskCard";
import KanbanColumn from "@/components/kanban/KanbanColumn";
import TaskDetailDialog from "@/components/kanban/TaskDetailDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

const KanbanBoard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getUserTasksByStatus, updateTaskStatus, updateTask, deleteTask, loading } = useTasks();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [observation, setObservation] = useState("");
  const isMobile = useIsMobile();

  const todoTasks = getUserTasksByStatus("todo");
  const progressTasks = getUserTasksByStatus("progress");
  const completedTasks = getUserTasksByStatus("completed");
  
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
      toast.success("Observations saved");
    }
  };

  const handleDeleteTask = () => {
    if (selectedTask) {
      deleteTask(selectedTask.id);
      setSelectedTask(null);
      toast.success("Task deleted");
    }
  };

  // New function to navigate to the Add Task page
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
              <span className="hidden md:inline">Create Task</span>
            </Button>
          )}
        </div>
        
        <div className="kanban-board">
          <KanbanColumn
            title="To Do"
            tasks={todoTasks}
            status="todo"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onTaskDragStart={handleDragStart}
            onTaskClick={handleTaskClick}
            emptyStateMessage={<p className="text-sm text-gray-500 text-center my-4">No tasks to do</p>}
          />
          
          <KanbanColumn
            title="In Progress"
            tasks={progressTasks}
            status="progress"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onTaskDragStart={handleDragStart}
            onTaskClick={handleTaskClick}
            emptyStateMessage={<p className="text-sm text-gray-500 text-center my-4">No tasks in progress</p>}
          />
          
          <KanbanColumn
            title="Completed"
            tasks={completedTasks}
            status="completed"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onTaskDragStart={handleDragStart}
            onTaskClick={handleTaskClick}
            emptyStateMessage={<p className="text-sm text-gray-500 text-center my-4">No completed tasks</p>}
          />
        </div>
        
        {/* Task Detail Dialog - Keep this for viewing task details */}
        <TaskDetailDialog
          task={selectedTask}
          observation={observation}
          setObservation={setObservation}
          onClose={() => setSelectedTask(null)}
          onSave={handleSaveObservation}
          onDelete={handleDeleteTask}
        />
      </div>
    </div>
  );
};

export default KanbanBoard;
