
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, Home, LayoutDashboard, Users, List, Plus, SquareKanban } from "lucide-react";

const Sidebar = () => {
  const { currentUser } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const isAdmin = currentUser?.role === "admin";

  return (
    <div
      className={cn(
        "border-r bg-sidebar p-4 flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between mb-6">
        {!collapsed && (
          <h1 className="text-xl font-bold">
            DPGE<span className="text-primary">task</span>
          </h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle sidebar"
          className="ml-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft
            className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")}
          />
        </Button>
      </div>

      <ScrollArea className="flex-1 -mr-4 pr-4">
        <nav className="space-y-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              cn(
                "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                collapsed && "justify-center px-0"
              )
            }
          >
            <LayoutDashboard className="h-5 w-5 mr-2" />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink
            to="/kanban"
            className={({ isActive }) =>
              cn(
                "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                collapsed && "justify-center px-0"
              )
            }
          >
            <SquareKanban className="h-5 w-5 mr-2" />
            {!collapsed && <span>Kanban Board</span>}
          </NavLink>

          {isAdmin && (
            <>
              <NavLink
                to="/tasks"
                className={({ isActive }) =>
                  cn(
                    "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                    collapsed && "justify-center px-0"
                  )
                }
              >
                <List className="h-5 w-5 mr-2" />
                {!collapsed && <span>All Tasks</span>}
              </NavLink>
              
              <NavLink
                to="/tasks/new"
                className={({ isActive }) =>
                  cn(
                    "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                    collapsed && "justify-center px-0"
                  )
                }
              >
                <Plus className="h-5 w-5 mr-2" />
                {!collapsed && <span>Add Task</span>}
              </NavLink>
              
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  cn(
                    "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                    collapsed && "justify-center px-0"
                  )
                }
              >
                <Users className="h-5 w-5 mr-2" />
                {!collapsed && <span>Users</span>}
              </NavLink>
            </>
          )}
        </nav>
      </ScrollArea>

      <div className="mt-auto pt-4 border-t">
        {!collapsed && (
          <div className="text-xs text-muted-foreground">
            {currentUser?.role === "admin" ? "Administrator" : "User"} Account
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
