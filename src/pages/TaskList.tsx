
import { useState, useEffect } from "react";
import { useTasks } from "@/contexts/task";
import { useUsers } from "@/contexts/UserContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Task } from "@/types";
import { Edit, MoreHorizontal, Plus, Trash, Users, AlertCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

const TaskList = () => {
  const { tasks, deleteTask } = useTasks();
  const { getUsersByIds, users } = useUsers();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Verificar conexão com o Supabase
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('profiles').select('count').limit(1);
        if (error) {
          setConnectionError(`Erro de conexão com o banco de dados: ${error.message}`);
        } else {
          setConnectionError(null);
        }
      } catch (err: any) {
        setConnectionError(`Falha na conexão: ${err.message || 'Erro desconhecido'}`);
      }
    };
    
    checkConnection();
  }, []);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "todo":
        return <Badge variant="outline" className="bg-kanban-todo-light text-kanban-todo border-kanban-todo">A Fazer</Badge>;
      case "progress":
        return <Badge variant="outline" className="bg-kanban-progress-light text-kanban-progress border-kanban-progress">Em Progresso</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-kanban-completed-light text-kanban-completed border-kanban-completed">Concluído</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };
  
  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Recarregar a página para atualizar os dados
      window.location.reload();
    } catch (error: any) {
      toast.error('Erro ao atualizar: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };
  
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Você precisa estar logado para visualizar esta página</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciamento de Tarefas</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button asChild>
            <Link to="/tasks/new">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Tarefa
            </Link>
          </Button>
        </div>
      </div>
      
      {connectionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Problema de conexão</AlertTitle>
          <AlertDescription>{connectionError}</AlertDescription>
        </Alert>
      )}
      
      {!connectionError && tasks.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nenhuma tarefa encontrada</AlertTitle>
          <AlertDescription>
            {currentUser?.role === 'admin' 
              ? 'Você não possui tarefas criadas. Clique em "Adicionar Tarefa" para criar uma nova.' 
              : 'Você não possui tarefas atribuídas. Entre em contato com um administrador.'}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center mb-4">
        <Input
          placeholder="Pesquisar tarefas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Atribuídas para</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data Limite</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>{task.unit}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <div className="flex -space-x-2">
                        {task.assignees && getUsersByIds(task.assignees).map((user) => (
                          <Tooltip key={user.id}>
                            <TooltipTrigger asChild>
                              <Avatar className="h-7 w-7 border-2 border-background">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{user.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                        {(!task.assignees || task.assignees.length === 0) && (
                          <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Sem atribuições
                          </span>
                        )}
                      </div>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>{task.endDate}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/tasks/edit/${task.id}`} className="flex items-center">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteTask(task.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  Nenhuma tarefa encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Informações de Depuração */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-md">
          <h3 className="text-sm font-semibold mb-2">Informações de Depuração:</h3>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>Usuário: {currentUser?.name} ({currentUser?.role})</li>
            <li>Total de tarefas: {tasks.length}</li>
            <li>Total de usuários: {users.length}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default TaskList;
