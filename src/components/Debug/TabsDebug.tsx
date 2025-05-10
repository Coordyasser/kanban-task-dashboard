
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDebugInfo } from "@/hooks/use-debug";

export function TabsDebug() {
  const debugInfo = useDebugInfo();
  
  return (
    <Tabs defaultValue="status" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="status">Status</TabsTrigger>
        <TabsTrigger value="connection">Conexão</TabsTrigger>
        <TabsTrigger value="tables">Tabelas</TabsTrigger>
      </TabsList>
      
      <TabsContent value="status">
        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
            <CardDescription>
              Informações sobre o status atual do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={
                  debugInfo.connectionStatus === 'connected' ? 'text-green-600' : 
                  debugInfo.connectionStatus === 'error' ? 'text-red-600' : 
                  'text-yellow-600'
                }>
                  {debugInfo.connectionStatus === 'connected' ? 'Conectado' : 
                   debugInfo.connectionStatus === 'error' ? 'Erro' : 'Verificando'}
                </span>
              </div>
              {debugInfo.error && (
                <div className="text-red-600">
                  Erro: {debugInfo.error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="connection">
        <Card>
          <CardHeader>
            <CardTitle>Detalhes de Conexão</CardTitle>
            <CardDescription>
              Informações sobre a conexão com o banco de dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {debugInfo.connectionStatus === 'connected' && debugInfo.databaseInfo ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Tempo de Resposta:</span>
                  <span>{debugInfo.databaseInfo.responseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Última Verificação:</span>
                  <span>{new Date(debugInfo.databaseInfo.lastChecked).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <p>Dados de conexão não disponíveis.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="tables">
        <Card>
          <CardHeader>
            <CardTitle>Informações das Tabelas</CardTitle>
            <CardDescription>
              Detalhes sobre as tabelas do banco de dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {debugInfo.connectionStatus === 'connected' && 
             debugInfo.databaseInfo && 
             debugInfo.databaseInfo.tables && 
             typeof debugInfo.databaseInfo.tables === 'object' ? (
              <div className="space-y-1">
                {Object.entries(debugInfo.databaseInfo.tables)
                  .filter(([key]) => key !== 'time')
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1 border-b">
                      <span>{key.replace('_count', '')}</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p>Informações de tabelas não disponíveis.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default TabsDebug;
