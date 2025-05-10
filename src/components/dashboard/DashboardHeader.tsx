
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface DashboardHeaderProps {
  isAdmin: boolean;
}

const DashboardHeader = ({ isAdmin }: DashboardHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">DPGEtask Dashboard</h1>
      {isAdmin && (
        <Button asChild className="glassmorphism bg-primary/80 hover:bg-primary/90">
          <Link to="/tasks/new">Create New Task</Link>
        </Button>
      )}
    </div>
  );
};

export default DashboardHeader;
