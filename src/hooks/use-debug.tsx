
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
          console.error('Database connection error:', error);
          setDebugInfo({
            connectionStatus: 'error',
            databaseInfo: null,
            error: `Erro de conexão: ${error.message}`
          });
          return;
        }
        
        // Fetch additional database information using the SQL function
        let tablesInfo = null;
        
        try {
          // Type assertion to bypass TypeScript type checking for custom RPC functions
          const { data: tableData, error: tableError } = await (supabase.rpc as any)('get_simple_table_info');
            
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
        console.error('Error in useDebugInfo:', err);
        setDebugInfo({
          connectionStatus: 'error',
          databaseInfo: null,
          error: `Erro: ${err.message || 'Desconhecido'}`
        });
      }
    };
    
    // Initial check
    checkConnection();
    
    // Periodic connection check with a reduced frequency to improve performance
    const interval = setInterval(checkConnection, 120000); // every 2 minutes instead of every minute
    
    return () => clearInterval(interval);
  }, []);

  return debugInfo;
}
