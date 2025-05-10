
import { Task } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useUsers } from "@/contexts/UserContext";
import { Trash, Users } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TaskCardProps {
  task: Task;
  onDragStart: (task: Task) => void;
  onClick: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

const TaskCard = ({ task, onDragStart, onClick, onDelete }: TaskCardProps) => {
  const { getUsersByIds } = useUsers();
  const { currentUser } = useAuth();
  const assignedUsers = getUsersByIds(task.assignees);
  
  // Verifica se o usuário atual é um admin e criou esta tarefa
  const canDelete = currentUser?.role === 'admin' && currentUser?.id === task.createdBy;
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita acionar o onClick do cartão
    if (onDelete) {
      onDelete(task.id);
    }
  };
  
  // Log para debug - verificar se task.assignees contém dados
  console.log(`Tarefa ${task.id} - Assignees:`, task.assignees);
  console.log(`Usuários atribuídos encontrados:`, assignedUsers);
  
  return (
    <Card
      className={`task-card ${task.status} hover:shadow-md transition-shadow duration-200 cursor-pointer`}
      draggable="true"
      onDragStart={() => onDragStart(task)}
      onClick={() => onClick(task)}
    >
      <div className="task-header p-3 pb-2 flex justify-between items-start">
        <div>
          <h4 className="task-title font-medium">{task.title}</h4>
          <Badge variant="outline" className="bg-white mt-1">
            {task.unit}
          </Badge>
        </div>
        
        {canDelete && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full text-red-500 hover:text-red-700 hover:bg-red-100" 
            onClick={handleDelete}
          >
            <Trash className="h-4 w-4" />
            <span className="sr-only">Excluir tarefa</span>
          </Button>
        )}
      </div>
      <div className="p-3 pt-0">
        <p className="task-description text-sm text-muted-foreground line-clamp-2">
          {task.description}
        </p>
        
        <div className="task-meta text-xs text-muted-foreground mt-2">
          <div>
            {task.startDate} até {task.endDate}
          </div>
        </div>
        
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Atribuída para:</span>
          </div>
          
          <div className="mt-1 flex flex-wrap gap-1">
            {assignedUsers && assignedUsers.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {assignedUsers.map((user) => (
                  <TooltipProvider key={user.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="text-xs">
                          {user.name.split(' ')[0]}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{user.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground italic">Sem atribuições</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;
