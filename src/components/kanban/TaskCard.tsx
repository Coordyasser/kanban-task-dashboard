
import { Task } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUsers } from "@/contexts/UserContext";
import { Trash } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";

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
  
  // Check if the current user is an admin and created this task
  const canDelete = currentUser?.role === 'admin' && currentUser?.id === task.createdBy;
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card's onClick
    if (onDelete) {
      onDelete(task.id);
    }
  };
  
  return (
    <div
      className={`task-card ${task.status}`}
      draggable="true"
      onDragStart={() => onDragStart(task)}
      onClick={() => onClick(task)}
    >
      <div className="task-header">
        <div>
          <h4 className="task-title">{task.title}</h4>
          <Badge variant="outline" className="bg-white">
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
            <span className="sr-only">Delete task</span>
          </Button>
        )}
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

export default TaskCard;
