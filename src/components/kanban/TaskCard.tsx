
import { Task } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUsers } from "@/contexts/UserContext";

interface TaskCardProps {
  task: Task;
  onDragStart: (task: Task) => void;
  onClick: (task: Task) => void;
}

const TaskCard = ({ task, onDragStart, onClick }: TaskCardProps) => {
  const { getUsersByIds } = useUsers();
  const assignedUsers = getUsersByIds(task.assignees);
  
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
