
import { ReactNode } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TaskFormLayoutProps {
  title: string;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
}

const TaskFormLayout = ({ 
  title, 
  children, 
  onSubmit, 
  isSubmitting = false 
}: TaskFormLayoutProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            {children}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processando..." : title}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default TaskFormLayout;
