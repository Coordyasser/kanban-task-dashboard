
import { Task, TaskStatus } from "@/types";
import TaskCard from "./TaskCard";
import { ReactNode } from "react";

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  status: TaskStatus;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (status: TaskStatus) => void;
  onTaskDragStart: (task: Task) => void;
  onTaskClick: (task: Task) => void;
  emptyStateMessage: ReactNode;
}

const KanbanColumn = ({
  title,
  tasks,
  status,
  onDragOver,
  onDrop,
  onTaskDragStart,
  onTaskClick,
  emptyStateMessage
}: KanbanColumnProps) => {
  return (
    <div
      className="kanban-column"
      onDragOver={onDragOver}
      onDrop={() => onDrop(status)}
    >
      <div className="column-header">
        <span>{title}</span>
        <span className="header-count">{tasks.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onDragStart={onTaskDragStart} 
            onClick={onTaskClick} 
          />
        ))}
        {tasks.length === 0 && emptyStateMessage}
      </div>
    </div>
  );
};

export default KanbanColumn;
