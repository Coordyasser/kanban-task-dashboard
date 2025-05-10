
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useDebugInfo() {
  const [debugInfo, setDebugInfo] = useState({
    connectionStatus: 'checking',
    databaseInfo: null as any,
    error: null as string | null
  });

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Verifica a conexão com o banco de dados
        const start = Date.now();
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        const end = Date.now();
        
        if (error) {
          setDebugInfo({
            connectionStatus: 'error',
            databaseInfo: null,
            error: `Erro de conexão: ${error.message}`
          });
        } else {
          // Busca informações adicionais do banco de dados
          const { data: tables } = await supabase
            .rpc('get_table_info')
            .catch(() => ({ data: null }));
          
          setDebugInfo({
            connectionStatus: 'connected',
            databaseInfo: {
              responseTime: end - start,
              tables: tables || 'Não disponível',
              lastChecked: new Date().toISOString()
            },
            error: null
          });
        }
      } catch (err: any) {
        setDebugInfo({
          connectionStatus: 'error',
          databaseInfo: null,
          error: `Erro: ${err.message || 'Desconhecido'}`
        });
      }
    };
    
    checkConnection();
    
    // Verifica a conexão periodicamente
    const interval = setInterval(checkConnection, 60000); // a cada minuto
    
    return () => clearInterval(interval);
  }, []);

  return debugInfo;
}
