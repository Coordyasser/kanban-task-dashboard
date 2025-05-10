
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/auth";
import { TaskProvider } from "./contexts/task";
import { UserProvider } from "./contexts/UserContext";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import KanbanBoard from "./pages/KanbanBoard";
import TaskList from "./pages/TaskList";
import TaskForm from "./pages/TaskForm";
import UserList from "./pages/UserList";
import AppLayout from "./components/layout/AppLayout";
import NotFound from "./pages/NotFound";

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <UserProvider>
        <TaskProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes wrapped in AppLayout */}
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/kanban" element={<KanbanBoard />} />
                  <Route path="/tasks" element={<TaskList />} />
                  <Route path="/tasks/new" element={<TaskForm />} />
                  <Route path="/tasks/edit/:id" element={<TaskForm />} />
                  <Route path="/users" element={<UserList />} />
                </Route>
                
                {/* Fallback route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </TaskProvider>
      </UserProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
