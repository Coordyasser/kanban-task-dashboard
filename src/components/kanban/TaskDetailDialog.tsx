
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
      <DialogContent className="sm:max-w-md md:max-w-lg glassmorphism max-h-[80vh] overflow-y-auto w-[95%] mx-auto">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription className="overflow-hidden text-ellipsis">{task.description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Unit</Label>
              <p className="font-medium">{task.unit}</p>
            </div>
            <div>
              <Label className="text-sm">Status</Label>
              <p className="font-medium capitalize">{task.status}</p>
            </div>
            <div>
              <Label className="text-sm">Start Date</Label>
              <p className="font-medium">{task.startDate}</p>
            </div>
            <div>
              <Label className="text-sm">End Date</Label>
              <p className="font-medium">{task.endDate}</p>
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
              rows={3}
            />
          </div>
          
          <div>
            <Label className="text-sm">Assignees</Label>
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
        
        <DialogFooter className="sm:justify-between">
          {isAdmin && (
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash className="h-4 w-4 mr-1" />
              Delete Task
            </Button>
          )}
          <Button onClick={onSave}>
            <Pencil className="h-4 w-4 mr-1" />
            Save Observations
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailDialog;
