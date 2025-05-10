
import { useEffect, Suspense, lazy } from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load the DebugPanel to improve initial render performance
const DebugPanel = lazy(() => 
  process.env.NODE_ENV !== 'production' 
    ? import("@/components/Debug/DebugPanel")
    : Promise.resolve({ default: () => null })
);

// Loading component to improve user experience
const LoadingSkeleton = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4">Carregando...</p>
    </div>
  </div>
);

const AppLayout = () => {
  const { currentUser, loading, authInitialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If authentication is initialized and user is not authenticated, redirect to login
    if (authInitialized && !loading && !currentUser) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [currentUser, loading, authInitialized, navigate]);

  // If still loading authentication state, show loading state
  if (loading || !authInitialized) {
    return <LoadingSkeleton />;
  }

  // If user is not authenticated after authentication is initialized, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col w-full relative">
        <Header />
        <main className="flex-1 p-2 sm:p-4 md:p-6 overflow-y-auto flex flex-col h-[calc(100vh-64px)]">
          {process.env.NODE_ENV !== 'production' && (
            <Suspense fallback={<div className="h-8 bg-gray-100 animate-pulse rounded mb-4" />}>
              <DebugPanel />
            </Suspense>
          )}
          <Suspense fallback={<LoadingSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
