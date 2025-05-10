
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/auth";
import { TaskProvider } from "./contexts/task";
import { UserProvider } from "./contexts/UserContext";
import { useAuth } from "./contexts/auth";
import { useEffect } from "react";

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

// Authentication Guard Component
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading, authInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (authInitialized && !loading) {
      // Only redirect after authentication has fully initialized and is not loading
      if (!currentUser) {
        // If not logged in, redirect to login
        if (location.pathname !== "/login" && 
            location.pathname !== "/register" && 
            location.pathname !== "/") {
          console.log("User not authenticated, redirecting to login");
          navigate("/login", { replace: true });
        }
      } else {
        // If logged in and on auth pages, redirect to dashboard
        if (location.pathname === "/login" || 
            location.pathname === "/register" || 
            location.pathname === "/") {
          console.log("User already authenticated, redirecting to dashboard");
          navigate("/dashboard", { replace: true });
        }
      }
    }
  }, [currentUser, loading, authInitialized, navigate, location.pathname]);

  // Show loading state while authentication is initializing
  if (!authInitialized || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const AppContent = () => {
  return (
    <AuthGuard>
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
    </AuthGuard>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <TaskProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AppContent />
            </TooltipProvider>
          </TaskProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
