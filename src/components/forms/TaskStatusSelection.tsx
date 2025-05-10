
import { Label } from "@/components/ui/label";
import { TaskStatus } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskStatusSelectionProps {
  status: TaskStatus;
  setStatus: (value: TaskStatus) => void;
}

const TaskStatusSelection = ({ status, setStatus }: TaskStatusSelectionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="status">Status</Label>
      <Select 
        value={status} 
        onValueChange={(value) => setStatus(value as TaskStatus)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione o status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todo">A Fazer</SelectItem>
          <SelectItem value="progress">Em Andamento</SelectItem>
          <SelectItem value="completed">Concluída</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TaskStatusSelection;
