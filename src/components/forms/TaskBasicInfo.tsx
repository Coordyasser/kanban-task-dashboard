
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TaskBasicInfoProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  unit: string;
  setUnit: (value: string) => void;
}

const TaskBasicInfo = ({ 
  title, 
  setTitle, 
  description, 
  setDescription,
  unit,
  setUnit
}: TaskBasicInfoProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Digite um título conciso para a tarefa"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Forneça uma descrição detalhada da tarefa"
          rows={4}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="unit">Unidade/Departamento</Label>
        <Input
          id="unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          required
          placeholder="ex. Marketing, TI, RH"
        />
      </div>
    </>
  );
};

export default TaskBasicInfo;
