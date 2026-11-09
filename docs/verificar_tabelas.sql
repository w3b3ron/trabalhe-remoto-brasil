-- ============================================================
-- TrabalheRemotoBrasil.com - Verificação de Tabelas no Supabase
-- Rode este script no SQL Editor do Supabase para verificar
-- se as tabelas necessárias existem e têm as colunas corretas
-- ============================================================

-- 1. Listar todas as tabelas públicas
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Verificar colunas da tabela companies
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'companies'
ORDER BY ordinal_position;

-- 3. Verificar colunas da tabela jobs
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'jobs'
ORDER BY ordinal_position;

-- 4. Verificar colunas da tabela courses
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'courses'
ORDER BY ordinal_position;

-- 5. Verificar colunas da tabela products
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'products'
ORDER BY ordinal_position;

-- 6. Verificar políticas RLS ativas
SELECT
  polname AS policy_name,
  polrelid::regclass AS table_name,
  pg_get_expr(polqual, polrelid) AS policy_expression
FROM pg_policy
WHERE polrelid::regclass::text LIKE 'public.%'
ORDER BY polrelid::regclass::text, polname;

-- 7. Contar registros em cada tabela
SELECT 'companies' AS tabela, COUNT(*) AS total FROM public.companies
UNION ALL
SELECT 'jobs', COUNT(*) FROM public.jobs
UNION ALL
SELECT 'courses', COUNT(*) FROM public.courses
UNION ALL
SELECT 'products', COUNT(*) FROM public.products;