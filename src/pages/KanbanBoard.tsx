import { useState } from "react";
import { useTasks } from "@/contexts/TaskContext";
import { useUsers } from "@/contexts/UserContext";
import { TaskStatus, Task } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash, Plus, Calendar, Users as UsersIcon, ListChecks, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const KanbanBoard = () => {
  const { currentUser } = useAuth();
  const { getUserTasksByStatus, updateTaskStatus, updateTask, deleteTask, addTask } = useTasks();
  const { getUsersByIds, getAllUsers } = useUsers();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [observation, setObservation] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for new task
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    unit: "",
    assignees: [] as string[],
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    status: "todo" as TaskStatus
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  // Handle assignee selection
  const toggleAssignee = (userId: string) => {
    setNewTask(prev => ({
      ...prev,
      assignees: prev.assignees.includes(userId)
        ? prev.assignees.filter(id => id !== userId)
        : [...prev.assignees, userId]
    }));
  };

  // Handle new task submission
  const handleCreateTask = () => {
    if (!newTask.title || !newTask.description || newTask.assignees.length === 0) {
      toast.error("Please fill out all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      addTask(newTask);
      setIsCreateModalOpen(false);
      toast.success("Task created successfully");
      
      // Reset form
      setNewTask({
        title: "",
        description: "",
        unit: "",
        assignees: [],
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        status: "todo"
      });
    } catch (error) {
      toast.error("Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      
      {/* Existing Task Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        {selectedTask && (
          <DialogContent className="sm:max-w-lg glassmorphism">
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

      {/* Create Task Dialog */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-lg glassmorphism">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add a new task to the kanban board</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={newTask.title}
                onChange={handleInputChange}
                placeholder="Task title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={newTask.description}
                onChange={handleInputChange}
                placeholder="Describe the task"
                required
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unit/Department</Label>
              <Input
                id="unit"
                name="unit"
                value={newTask.unit}
                onChange={handleInputChange}
                placeholder="e.g. Marketing, IT, HR"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={newTask.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={newTask.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Assignees</Label>
              <Card className="p-2">
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {getAllUsers().map((user) => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        checked={newTask.assignees.includes(user.id)}
                        onChange={() => toggleAssignee(user.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label
                        htmlFor={`user-${user.id}`}
                        className="text-sm font-normal cursor-pointer flex items-center"
                      >
                        <Avatar className="h-5 w-5 mr-2">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {user.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCreateTask} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KanbanBoard;
