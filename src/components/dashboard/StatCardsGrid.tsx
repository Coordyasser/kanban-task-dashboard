
import { Task } from "@/types";
import StatCard from "./StatCard";

interface StatCardsGridProps {
  userTasks: Task[];
  isAdmin: boolean;
}

const StatCardsGrid = ({ userTasks, isAdmin }: StatCardsGridProps) => {
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
      <StatCard
        title="Total Tasks"
        value={userTasks.length}
        description={`Tasks assigned to ${isAdmin ? "all users" : "you"}`}
      />
      
      <StatCard
        title="In Progress"
        value={userTasks.filter(task => task.status === "progress").length}
        description="Tasks currently being worked on"
      />
      
      <StatCard
        title="Completed"
        value={userTasks.filter(task => task.status === "completed").length}
        description="Tasks completed successfully"
      />
    </div>
  );
};

export default StatCardsGrid;
