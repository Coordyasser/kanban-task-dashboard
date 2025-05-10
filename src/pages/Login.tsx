
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!email || !password) {
        toast.error("Por favor, informe email e senha");
        setIsSubmitting(false);
        return;
      }
      
      console.log("Tentando login...");
      const success = await login(email, password);
      console.log("Resultado do login:", success);
      
      if (success) {
        toast.success("Login realizado com sucesso");
        // Redirect is now handled in the AuthGuard component
      } else {
        // Login failed, show error
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error("Erro de login:", error);
      toast.error(`Falha no login: ${error.message || "Erro desconhecido"}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Bem-vindo ao DPGEtask</CardTitle>
          <CardDescription>Informe suas credenciais para acessar</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                disabled={isSubmitting || loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting || loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
              {isSubmitting || loading ? "Entrando..." : "Entrar"}
            </Button>
            <div className="text-center text-sm">
              Não tem uma conta?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Registre-se
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>

      <div className="fixed bottom-4 right-4">
        <div className="text-xs text-gray-400">
          Credenciais demo:
          <br />
          Admin: john@example.com (qualquer senha)
          <br />
          Usuário: jane@example.com (qualquer senha)
        </div>
      </div>
    </div>
  );
};

export default Login;
