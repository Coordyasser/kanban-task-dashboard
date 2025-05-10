
import { useEffect, Suspense } from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import Sidebar from "./Sidebar";
import Header from "./Header";
import DebugPanel from "@/components/Debug/DebugPanel";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not authenticated after loading, redirect to login
    if (!loading && !currentUser) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [currentUser, loading, navigate]);

  // If loading, show loading state
  if (loading) {
    return <LoadingSkeleton />;
  }

  // If user is not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col w-full relative">
        <Header />
        <main className="flex-1 p-2 sm:p-4 md:p-6 overflow-y-auto flex flex-col h-[calc(100vh-64px)]">
          {process.env.NODE_ENV !== 'production' && <DebugPanel />}
          <Suspense fallback={<LoadingSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
