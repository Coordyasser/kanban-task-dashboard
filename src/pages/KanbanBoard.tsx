
import { useState } from "react";
import { useTasks } from "@/contexts/TaskContext";
import { useUsers } from "@/contexts/UserContext";
import { TaskStatus, Task } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash } from "lucide-react";

const KanbanBoard = () => {
  const { currentUser } = useAuth();
  const { getUserTasksByStatus, updateTaskStatus, updateTask, deleteTask } = useTasks();
  const { getUsersByIds } = useUsers();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [observation, setObservation] = useState("");

  const todoTasks = getUserTasksByStatus("todo");
  const progressTasks = getUserTasksByStatus("progress");
  const completedTasks = getUserTasksByStatus("completed");
  
  const isAdmin = currentUser?.role === "admin";

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

  const TaskCard = ({ task }: { task: Task }) => {
    const assignedUsers = getUsersByIds(task.assignees);
    
    return (
      <div
        className={`task-card ${task.status}`}
        draggable="true"
        onDragStart={() => handleDragStart(task)}
        onClick={() => handleTaskClick(task)}
      >
        <div className="task-header">
          <div>
            <h4 className="task-title">{task.title}</h4>
            <Badge variant="outline" className="bg-white">
              {task.unit}
            </Badge>
          </div>
        </div>
        <p className="task-description">{task.description}</p>
        
        <div className="task-meta">
          <div>
            {task.startDate} to {task.endDate}
          </div>
        </div>
        
        <div className="mt-2 flex -space-x-2 overflow-hidden">
          {assignedUsers.map((user) => (
            <Avatar key={user.id} className="border-2 border-white h-6 w-6">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Kanban Board</h1>
      </div>
      
      <div className="kanban-board">
        <div
          className="kanban-column"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop("todo")}
        >
          <div className="column-header">
            <span>To Do</span>
            <span className="header-count">{todoTasks.length}</span>
          </div>
          <div>
            {todoTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {todoTasks.length === 0 && (
              <p className="text-sm text-gray-500 text-center my-4">No tasks to do</p>
            )}
          </div>
        </div>
        
        <div
          className="kanban-column"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop("progress")}
        >
          <div className="column-header">
            <span>In Progress</span>
            <span className="header-count">{progressTasks.length}</span>
          </div>
          <div>
            {progressTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {progressTasks.length === 0 && (
              <p className="text-sm text-gray-500 text-center my-4">No tasks in progress</p>
            )}
          </div>
        </div>
        
        <div
          className="kanban-column"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop("completed")}
        >
          <div className="column-header">
            <span>Completed</span>
            <span className="header-count">{completedTasks.length}</span>
          </div>
          <div>
            {completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {completedTasks.length === 0 && (
              <p className="text-sm text-gray-500 text-center my-4">No completed tasks</p>
            )}
          </div>
        </div>
      </div>
      
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        {selectedTask && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedTask.title}</DialogTitle>
              <DialogDescription>{selectedTask.description}</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Unit</Label>
                  <p className="font-medium">{selectedTask.unit}</p>
                </div>
                <div>
                  <Label className="text-sm">Status</Label>
                  <p className="font-medium capitalize">{selectedTask.status}</p>
                </div>
                <div>
                  <Label className="text-sm">Start Date</Label>
                  <p className="font-medium">{selectedTask.startDate}</p>
                </div>
                <div>
                  <Label className="text-sm">End Date</Label>
                  <p className="font-medium">{selectedTask.endDate}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm" htmlFor="observation">Observations</Label>
                <Textarea
                  id="observation"
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className="mt-1"
                  placeholder="Add your observations here..."
                  rows={4}
                />
              </div>
              
              <div>
                <Label className="text-sm">Assignees</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {getUsersByIds(selectedTask.assignees).map((user) => (
                    <div key={user.id} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter className="sm:justify-between">
              {isAdmin && (
                <Button variant="destructive" size="sm" onClick={handleDeleteTask}>
                  <Trash className="h-4 w-4 mr-1" />
                  Delete Task
                </Button>
              )}
              <Button onClick={handleSaveObservation}>
                <Pencil className="h-4 w-4 mr-1" />
                Save Observations
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default KanbanBoard;
