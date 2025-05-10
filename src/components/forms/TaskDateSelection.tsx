
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TaskDateSelectionProps {
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
}

const TaskDateSelection = ({ 
  startDate, 
  setStartDate, 
  endDate, 
  setEndDate 
}: TaskDateSelectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="startDate">Data Inicial</Label>
        <Input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="endDate">Data Final</Label>
        <Input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
      </div>
    </div>
  );
};

export default TaskDateSelection;
