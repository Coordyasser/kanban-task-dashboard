
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Task } from "@/types";

interface RecentTasksListProps {
  tasks: Task[];
}

const RecentTasksList = ({ tasks }: RecentTasksListProps) => {
  return (
    <Card className="glassmorphism">
      <CardHeader>
        <CardTitle>Recent Tasks</CardTitle>
        <CardDescription>Your most recent tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tasks.slice(0, 5).map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-sm text-muted-foreground">Due: {task.endDate}</p>
              </div>
              <div>
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    task.status === "todo"
                      ? "bg-kanban-todo-light text-kanban-todo"
                      : task.status === "progress"
                      ? "bg-kanban-progress-light text-kanban-progress"
                      : "bg-kanban-completed-light text-kanban-completed"
                  }`}
                >
                  {task.status === "todo"
                    ? "To Do"
                    : task.status === "progress"
                    ? "In Progress"
                    : "Completed"}
                </span>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-center py-4 text-muted-foreground">No tasks found</p>
          )}
        </div>
        
        <div className="mt-4">
          <Button asChild variant="outline" size="sm" className="glassmorphism">
            <Link to="/kanban">View All Tasks</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTasksList;
