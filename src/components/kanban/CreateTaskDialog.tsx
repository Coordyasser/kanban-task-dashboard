
import { useState } from "react";
import { useUsers } from "@/contexts/UserContext";
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
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { TaskStatus } from "@/types";

interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (taskData: NewTaskData) => void;
}

export interface NewTaskData {
  title: string;
  description: string;
  unit: string;
  assignees: string[];
  startDate: string;
  endDate: string;
  status: TaskStatus;
}

const CreateTaskDialog = ({ isOpen, onClose, onCreateTask }: CreateTaskDialogProps) => {
  const { getAllUsers } = useUsers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newTask, setNewTask] = useState<NewTaskData>({
    title: "",
    description: "",
    unit: "",
    assignees: [],
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    status: "todo"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const toggleAssignee = (userId: string) => {
    setNewTask(prev => ({
      ...prev,
      assignees: prev.assignees.includes(userId)
        ? prev.assignees.filter(id => id !== userId)
        : [...prev.assignees, userId]
    }));
  };

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.description || newTask.assignees.length === 0) {
      toast.error("Please fill out all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      onCreateTask(newTask);
      
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          <Button type="button" variant="outline" onClick={onClose}>
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
  );
};

export default CreateTaskDialog;
