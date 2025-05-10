
import React, { useState } from 'react';
import { useDebugInfo } from '@/hooks/use-debug';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ChevronDown, ChevronRight, Database } from 'lucide-react';

export const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const debugInfo = useDebugInfo();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-300';
      case 'error': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };
  
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="bg-muted/30 rounded-lg p-2 mb-6 border border-dashed border-muted-foreground/30"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database size={16} />
          <h3 className="text-sm font-medium">Status do Sistema</h3>
          <Badge className={`text-xs ${getStatusColor(debugInfo.connectionStatus)}`}>
            {debugInfo.connectionStatus === 'connected' ? 'Conectado' : 
             debugInfo.connectionStatus === 'error' ? 'Erro' : 'Verificando'}
          </Badge>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-2 space-y-2">
        {debugInfo.error && (
          <div className="bg-red-50 p-2 rounded border border-red-200 text-red-800 text-xs flex items-start gap-2">
            <AlertCircle size={14} className="mt-0.5" />
            <div>{debugInfo.error}</div>
          </div>
        )}
        
        {debugInfo.connectionStatus === 'connected' && debugInfo.databaseInfo && (
          <div className="text-xs space-y-1">
            <div>Tempo de resposta: {debugInfo.databaseInfo.responseTime}ms</div>
            <div>Última verificação: {new Date(debugInfo.databaseInfo.lastChecked).toLocaleTimeString()}</div>
            {debugInfo.databaseInfo.tables && typeof debugInfo.databaseInfo.tables === 'object' && (
              <div>
                <div className="font-medium mt-1">Tabelas:</div>
                <ul className="list-disc list-inside pl-2">
                  {Object.keys(debugInfo.databaseInfo.tables).map((key) => {
                    if (key === 'time') return null;
                    return (
                      <li key={key}>
                        {key.replace('_count', '')}: {debugInfo.databaseInfo.tables[key]}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default DebugPanel;
