
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useTasks } from "@/contexts/TaskContext";
import { useUsers } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart, PieChart, Legend, ResponsiveContainer, Bar, Pie, Cell, Tooltip } from "recharts";

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">DPGEtask Dashboard</h1>
        {isAdmin && (
          <Button asChild className="glassmorphism bg-primary/80 hover:bg-primary/90">
            <Link to="/tasks/new">Create New Task</Link>
          </Button>
        )}
      </div>
      
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="glassmorphism">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tasks assigned to {isAdmin ? "all users" : "you"}
            </p>
          </CardContent>
        </Card>
        
        <Card className="glassmorphism">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {userTasks.filter(task => task.status === "progress").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tasks currently being worked on
            </p>
          </CardContent>
        </Card>
        
        <Card className="glassmorphism">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {userTasks.filter(task => task.status === "completed").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tasks completed successfully
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
            <CardDescription>Breakdown of tasks by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} tasks`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {isAdmin && (
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle>User Task Progress</CardTitle>
              <CardDescription>Task completion rate by user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userTaskData} layout="vertical">
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tasks" name="Total Tasks" stackId="a" fill="#1EAEDB" />
                    <Bar dataKey="completed" name="Completed" stackId="a" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div>
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Your most recent tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userTasks.slice(0, 5).map((task) => (
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
              {userTasks.length === 0 && (
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
      </div>
    </div>
  );
};

export default Dashboard;
