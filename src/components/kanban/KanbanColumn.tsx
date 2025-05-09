
import React, { ReactNode } from "react";
import { Task, TaskStatus } from "@/types";
import TaskCard from "./TaskCard";

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  status: TaskStatus;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (status: TaskStatus) => void;
  onTaskDragStart: (task: Task) => void;
  onTaskClick: (task: Task) => void;
  emptyStateMessage?: ReactNode;
  renderTask?: (task: Task) => ReactNode;
}

const KanbanColumn = ({
  title,
  tasks,
  status,
  onDragOver,
  onDrop,
  onTaskDragStart,
  onTaskClick,
  emptyStateMessage,
  renderTask,
}: KanbanColumnProps) => {
  return (
    <div 
      className={`kanban-column kanban-${status}`}
      onDragOver={onDragOver}
      onDrop={() => onDrop(status)}
    >
      <div className="kanban-column-header">
        <h3>{title}</h3>
        <span className="task-count">{tasks.length}</span>
      </div>
      <div className="kanban-tasks">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            renderTask ? renderTask(task) : (
              <TaskCard 
                key={task.id}
                task={task}
                onDragStart={onTaskDragStart}
                onClick={onTaskClick}
              />
            )
          ))
        ) : (
          emptyStateMessage
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
