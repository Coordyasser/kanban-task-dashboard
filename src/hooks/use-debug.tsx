
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
        // Check database connection
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
          return;
        }
        
        // Fetch additional database information using the SQL function get_simple_table_info
        let tablesInfo = null;
        
        try {
          // Type assertion to bypass TypeScript type checking for custom RPC functions
          const rpc = supabase.rpc as any;
          const { data: tableData, error: tableError } = await rpc('get_simple_table_info');
            
          if (!tableError && tableData) {
            tablesInfo = tableData;
          } else if (tableError) {
            console.error('Erro ao buscar informações das tabelas:', tableError);
          }
        } catch (err) {
          console.error('Falha ao chamar get_simple_table_info:', err);
        }
        
        setDebugInfo({
          connectionStatus: 'connected',
          databaseInfo: {
            responseTime: end - start,
            tables: tablesInfo || 'Não disponível',
            lastChecked: new Date().toISOString()
          },
          error: null
        });
      } catch (err: any) {
        setDebugInfo({
          connectionStatus: 'error',
          databaseInfo: null,
          error: `Erro: ${err.message || 'Desconhecido'}`
        });
      }
    };
    
    checkConnection();
    
    // Periodic connection check
    const interval = setInterval(checkConnection, 60000); // every minute
    
    return () => clearInterval(interval);
  }, []);

  return debugInfo;
}
