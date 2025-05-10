
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useTasks } from "@/contexts/task";
import { useUsers } from "@/contexts/UserContext";

// Import refactored components
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCardsGrid from "@/components/dashboard/StatCardsGrid";
import TaskStatusChart from "@/components/dashboard/TaskStatusChart";
import UserProgressChart from "@/components/dashboard/UserProgressChart";
import RecentTasksList from "@/components/dashboard/RecentTasksList";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { tasks, userTasks } = useTasks();
  const { users } = useUsers();
  const isAdmin = currentUser?.role === "admin";
  
  // Data for status distribution chart
  const statusData = [
    {
      name: "To Do",
      value: userTasks.filter(task => task.status === "todo").length,
      color: "#1EAEDB"
    },
    {
      name: "In Progress",
      value: userTasks.filter(task => task.status === "progress").length,
      color: "#0EA5E9"
    },
    {
      name: "Completed",
      value: userTasks.filter(task => task.status === "completed").length,
      color: "#10B981"
    }
  ];
  
  // Data for user tasks breakdown (admin only)
  const userTaskData = users
    .map(user => ({
      name: user.name,
      tasks: tasks.filter(task => task.assignees.includes(user.id)).length,
      completed: tasks.filter(task => task.assignees.includes(user.id) && task.status === "completed").length
    }))
    .filter(item => item.tasks > 0)
    .sort((a, b) => b.tasks - a.tasks);
  
  return (
    <div className="space-y-6">
      <DashboardHeader isAdmin={isAdmin} />
      <StatCardsGrid userTasks={userTasks} isAdmin={isAdmin} />
      
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <TaskStatusChart data={statusData} />
        {isAdmin && <UserProgressChart data={userTaskData} />}
      </div>
      
      <RecentTasksList tasks={userTasks} />
    </div>
  );
};

export default Dashboard;
