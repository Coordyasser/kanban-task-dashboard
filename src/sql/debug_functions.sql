
-- Função que retorna informações sobre as tabelas do banco de dados
-- Esta função deve ser executada manualmente no SQL Editor do Supabase
CREATE OR REPLACE FUNCTION get_table_info()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT
    jsonb_object_agg(
      table_name,
      jsonb_build_object(
        'count', (SELECT count(*) FROM public.table_name),
        'last_updated', (SELECT max(updated_at) FROM public.table_name WHERE updated_at IS NOT NULL)
      )
    ) INTO result
  FROM
    information_schema.tables
  WHERE
    table_schema = 'public'
    AND table_type = 'BASE TABLE';
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'error', SQLERRM,
    'time', now()
  );
END;
$$;

-- Nota: Esta função precisa ser executada manualmente no Supabase SQL Editor
-- A função acima pode falhar porque tenta executar consultas dinâmicas de uma maneira não suportada
-- Uma versão alternativa e mais simples seria:

CREATE OR REPLACE FUNCTION get_simple_table_info()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT 
    jsonb_build_object(
      'profiles_count', (SELECT count(*) FROM public.profiles),
      'tasks_count', (SELECT count(*) FROM public.tasks),
      'task_assignments_count', (SELECT count(*) FROM public.task_assignments),
      'time', now()
    ) INTO result;
  
  RETURN result;
END;
$$;
