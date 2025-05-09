
import { useState } from "react";
import { useTasks } from "@/contexts/TaskContext";
import { TaskStatus, Task } from "@/types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import TaskCard from "@/components/kanban/TaskCard";
import KanbanColumn from "@/components/kanban/KanbanColumn";
import TaskDetailDialog from "@/components/kanban/TaskDetailDialog";
import CreateTaskDialog, { NewTaskData } from "@/components/kanban/CreateTaskDialog";

const KanbanBoard = () => {
  const { currentUser } = useAuth();
  const { getUserTasksByStatus, updateTaskStatus, updateTask, deleteTask, addTask } = useTasks();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [observation, setObservation] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
    }
  };

  const handleDeleteTask = () => {
    if (selectedTask) {
      deleteTask(selectedTask.id);
      setSelectedTask(null);
    }
  };

  const handleCreateTask = (taskData: NewTaskData) => {
    try {
      addTask(taskData);
      setIsCreateModalOpen(false);
      toast.success("Task created successfully");
    } catch (error) {
      toast.error("Failed to create task");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">DPGEtask Kanban</h1>
        <Button 
          className="glassmorphism bg-primary/80 hover:bg-primary/90 rounded-full h-12 w-12 p-0 fixed bottom-6 right-6 md:static md:h-10 md:w-auto md:px-4 md:py-2 shadow-lg hover:shadow-xl transition-all duration-300 z-10"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-5 w-5 md:mr-2" />
          <span className="hidden md:inline">Create Task</span>
        </Button>
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
      
      <TaskDetailDialog
        task={selectedTask}
        observation={observation}
        setObservation={setObservation}
        onClose={() => setSelectedTask(null)}
        onSave={handleSaveObservation}
        onDelete={handleDeleteTask}
      />
      
      <CreateTaskDialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
};

export default KanbanBoard;
