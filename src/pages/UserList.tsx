
import { useEffect, useState } from "react";
import { useUsers } from "@/contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

const UserList = () => {
  const { users: contextUsers, loading: contextLoading } = useUsers();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        console.log("UserList: buscando usuários diretamente");
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
        
        if (error) {
          console.error('Erro ao buscar usuários:', error);
          toast.error('Falha ao carregar usuários: ' + error.message);
          
          // Fallback para dados do contexto se disponível
          if (contextUsers && contextUsers.length > 0) {
            console.log('Usando usuários do contexto como fallback:', contextUsers.length);
            setUsers(contextUsers);
          }
        } else if (data && data.length > 0) {
          console.log('Usuários carregados com sucesso:', data.length);
          
          // Map database profiles to our User type
          const mappedUsers = data.map(profile => ({
            id: profile.id,
            name: profile.name || 'Sem nome',
            email: profile.email || 'sem-email',
            role: profile.role || 'user',
            avatar: profile.avatar
          }));
          
          setUsers(mappedUsers);
        } else {
          console.warn('Nenhum usuário encontrado no banco de dados');
          setUsers([]);
        }
      } catch (error: any) {
        console.error('Erro na busca de usuários:', error);
        toast.error('Erro ao carregar usuários: ' + (error.message || 'Erro desconhecido'));
        
        // Fallback para dados do contexto
        if (contextUsers && contextUsers.length > 0) {
          setUsers(contextUsers);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [contextUsers]);
  
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Você precisa estar logado para visualizar esta página</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Usuários</h1>
        <p className="text-muted-foreground">Visualizar e gerenciar usuários do sistema</p>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {users.length > 0 ? users.map((user) => (
            <Card key={user.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant={user.role === "admin" ? "default" : "outline"}>
                    {user.role === "admin" ? "Administrador" : "Usuário"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-muted-foreground">Nenhum usuário encontrado</p>
            </div>
          )}
        </div>
      )}
      
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Status do sistema:</strong> {contextLoading ? 'Carregando contexto...' : `Contexto carregado: ${contextUsers.length} usuários`}
        </p>
      </div>
    </div>
  );
};

export default UserList;
