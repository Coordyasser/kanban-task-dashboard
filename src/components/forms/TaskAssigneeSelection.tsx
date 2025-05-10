
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TaskAssigneeSelectionProps {
  selectedAssignees: string[];
  setSelectedAssignees: (value: string[]) => void;
}

const TaskAssigneeSelection = ({ 
  selectedAssignees, 
  setSelectedAssignees 
}: TaskAssigneeSelectionProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
        
        if (error) {
          throw error;
        }

        if (data) {
          // Map database profiles to our User type
          const mappedUsers = data.map(profile => ({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            avatar: profile.avatar
          }));
          setUsers(mappedUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Falha ao carregar usuários');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const toggleAssignee = (userId: string) => {
    // Fix: Create a new array first, then pass it to setSelectedAssignees
    const newAssignees = selectedAssignees.includes(userId)
      ? selectedAssignees.filter(id => id !== userId)
      : [...selectedAssignees, userId];
    
    setSelectedAssignees(newAssignees);
  };

  return (
    <div className="space-y-2">
      <Label>Atribuir a</Label>
      {loading ? (
        <div className="flex items-center justify-center h-20">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-2">
          {users.map((user) => (
            <div key={user.id} className="flex items-center space-x-2">
              <Checkbox
                id={`user-${user.id}`}
                checked={selectedAssignees.includes(user.id)}
                onCheckedChange={() => toggleAssignee(user.id)}
              />
              <Label
                htmlFor={`user-${user.id}`}
                className="text-sm font-normal cursor-pointer flex items-center space-x-2"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{user.name} ({user.role === "admin" ? "Admin" : "Usuário"})</span>
              </Label>
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum usuário disponível</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskAssigneeSelection;
