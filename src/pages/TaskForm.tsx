
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTasks } from "@/contexts/task";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { TaskStatus, User } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TaskForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addTask, getTaskById, updateTask } = useTasks();
  const { currentUser } = useAuth();
  const isEditing = !!id;
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [observations, setObservations] = useState("");
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
  
  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      toast.error("Apenas administradores podem criar ou editar tarefas");
      navigate("/dashboard");
      return;
    }
    
    if (isEditing) {
      const task = getTaskById(id);
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setUnit(task.unit);
        setSelectedAssignees(task.assignees);
        setStartDate(task.startDate);
        setEndDate(task.endDate);
        setStatus(task.status);
        setObservations(task.observations || "");
      } else {
        toast.error("Tarefa não encontrada");
        navigate("/tasks");
      }
    }
  }, [id, isEditing, getTaskById, navigate, currentUser]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedAssignees.length === 0) {
      toast.error("Por favor, atribua a tarefa a pelo menos um usuário");
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("A data final não pode ser anterior à data inicial");
      return;
    }
    
    const taskData = {
      title,
      description,
      unit,
      assignees: selectedAssignees,
      startDate,
      endDate,
      status,
      observations,
    };
    
    if (isEditing) {
      updateTask(id, taskData);
      toast.success("Tarefa atualizada com sucesso");
    } else {
      addTask(taskData);
      toast.success("Tarefa criada com sucesso");
    }
    
    navigate("/tasks");
  };
  
  const toggleAssignee = (userId: string) => {
    setSelectedAssignees(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Editar Tarefa" : "Criar Nova Tarefa"}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Digite um título conciso para a tarefa"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Forneça uma descrição detalhada da tarefa"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unidade/Departamento</Label>
                <Input
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  required
                  placeholder="ex. Marketing, TI, RH"
                />
              </div>
              
              {isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">A Fazer</SelectItem>
                      <SelectItem value="progress">Em Andamento</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            
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
            
            {isEditing && (
              <div className="space-y-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Adicione quaisquer observações ou notas sobre a tarefa"
                  rows={3}
                />
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? "Atualizar Tarefa" : "Criar Tarefa"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default TaskForm;
