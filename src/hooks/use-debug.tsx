
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
          return;
        }
        
        // Busca informações adicionais do banco de dados usando a função SQL get_simple_table_info
        // Esta função está definida no arquivo debug_functions.sql
        let tablesInfo = null;
        
        try {
          // Use a type cast to avoid TypeScript errors with RPC functions not in the type definitions
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
