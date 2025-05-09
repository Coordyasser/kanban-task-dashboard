
import { Task } from "@/types";
import { useUsers } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/auth";
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
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TaskDetailDialogProps {
  task: Task | null;
  observation: string;
  setObservation: (observation: string) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
}

const TaskDetailDialog = ({ 
  task, 
  observation, 
  setObservation, 
  onClose, 
  onSave, 
  onDelete 
}: TaskDetailDialogProps) => {
  const { currentUser } = useAuth();
  const { getUsersByIds } = useUsers();
  const isAdmin = currentUser?.role === "admin";

  if (!task) return null;

  const assignedUsers = getUsersByIds(task.assignees);

  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      <DialogContent className="w-[95%] sm:w-[90%] md:w-[85%] lg:max-w-2xl glassmorphism max-h-[80vh] overflow-y-auto fixed top-[10%] z-[60]">
        <DialogHeader>
          <DialogTitle className="mb-1 line-clamp-2">{task.title}</DialogTitle>
          <DialogDescription className="line-clamp-3">{task.description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">Unit</Label>
              <p className="mt-1 text-sm">{task.unit}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <p className="mt-1 text-sm capitalize">{task.status}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Start Date</Label>
              <p className="mt-1 text-sm">{task.startDate}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">End Date</Label>
              <p className="mt-1 text-sm">{task.endDate}</p>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium" htmlFor="observation">Observations</Label>
            <Textarea
              id="observation"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              className="mt-1"
              placeholder="Add your observations here..."
              rows={3}
            />
          </div>
          
          <div>
            <Label className="text-sm font-medium">Assignees</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {assignedUsers.length > 0 ? assignedUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{user.name}</span>
                </div>
              )) : (
                <span className="text-sm text-muted-foreground">No assignees</span>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:justify-between">
          {isAdmin && (
            <Button variant="destructive" size="sm" onClick={onDelete} className="w-full sm:w-auto">
              <Trash className="h-4 w-4 mr-1" />
              Delete Task
            </Button>
          )}
          <Button onClick={onSave} className="w-full sm:w-auto">
            <Pencil className="h-4 w-4 mr-1" />
            Save Observations
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailDialog;
