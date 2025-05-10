
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TaskObservationsFieldProps {
  observations: string;
  setObservations: (value: string) => void;
}

const TaskObservationsField = ({ observations, setObservations }: TaskObservationsFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="observations">Observações</Label>
      <Textarea
        id="observations"
        value={observations}
        onChange={(e) => setObservations(e.target.value)}
        placeholder="Adicione quaisquer observações ou notas sobre a tarefa"
        rows={3}
      />
    </div>
  );
};

export default TaskObservationsField;
