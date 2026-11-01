-- ============================================================
-- Migration: 2026-11-job-details.sql
-- Campos adicionais para JobCard em 3 níveis e página de detalhe
-- ============================================================

-- 1. Campos adicionais em companies
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS about TEXT,
  ADD COLUMN IF NOT EXISTS sector TEXT,
  ADD COLUMN IF NOT EXISTS size TEXT,
  ADD COLUMN IF NOT EXISTS headquarters TEXT;

-- 2. Campos adicionais em jobs
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS stack TEXT[],
  ADD COLUMN IF NOT EXISTS responsibilities TEXT[],
  ADD COLUMN IF NOT EXISTS benefits TEXT[];

-- 3. Atualizar published_at para usar created_at se NULL (backfill)
UPDATE public.jobs
SET published_at = created_at
WHERE published_at IS NULL;

-- 4. Criar índice para busca por stack (GIN)
CREATE INDEX IF NOT EXISTS idx_jobs_stack ON public.jobs USING GIN(stack);

-- 5. Atualizar seed com novos campos
-- A seed já existe em database_schema.sql, estes inserts são exemplos
-- Execute manualmente no Supabase se quiser dados de exemplo com os novos campos

-- Ex: atualizar uma vaga com stack, responsabilidades e benefícios
-- UPDATE public.jobs
-- SET stack = ARRAY['React', 'Node.js', 'TypeScript'],
--     responsibilities = ARRAY['Desenvolver features', 'Revisar código'],
--     benefits = ARRAY['Home office', 'Plano de saúde']
-- WHERE slug = 'desenvolvedor-full-stack-react-node-nubank';

-- 6. Atualizar empresas com informações adicionais
-- UPDATE public.companies
-- SET about = 'Empresa de tecnologia...',
--     sector = 'Tecnologia',
--     size = '501-1000 funcionários',
--     headquarters = 'São Paulo, SP'
-- WHERE slug = 'nubank';
