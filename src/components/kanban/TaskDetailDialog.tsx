
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Task } from "@/types";

interface TaskDetailDialogProps {
  task: Task | null;
  observation: string;
  setObservation: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: (taskId: string) => void;
}

const TaskDetailDialog = ({
  task,
  observation,
  setObservation,
  onClose,
  onSave,
  onDelete,
}: TaskDetailDialogProps) => {
  if (!task) return null;

  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Description</p>
            <p className="text-sm">{task.description}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Unit</p>
            <p className="text-sm">{task.unit}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Time Period</p>
            <p className="text-sm">
              {task.startDate} to {task.endDate}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Observations</p>
            <Textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Add your observations here..."
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button 
            variant="destructive" 
            onClick={() => onDelete(task.id)}
          >
            Delete Task
          </Button>
          <Button type="button" onClick={onSave}>
            Save Observations
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailDialog;
