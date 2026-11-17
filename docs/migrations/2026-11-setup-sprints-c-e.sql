-- ============================================================
-- Migration: objetos usados pelas Sprints B, C, D e E
-- Execute no SQL Editor do Supabase. É idempotente (pode rodar mais de uma vez).
-- Pré-requisitos: docs/database_schema.sql e docs/migrations/2026-11-admin-rls.sql
-- ============================================================

-- ------------------------------------------------------------
-- 1. Contador de visualizações atômico (usado por incrementViewsCount)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_views(job_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.jobs
     SET views_count = COALESCE(views_count, 0) + 1
   WHERE id = job_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_views(uuid) TO anon, authenticated;

-- ------------------------------------------------------------
-- 2. Upsert de vagas vindas dos scrapers: (source_site, external_id) único
--    NULLs são distintos no Postgres, então as vagas de exemplo (sem external_id) não conflitam.
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'jobs_source_external_unique'
  ) THEN
    ALTER TABLE public.jobs
      ADD CONSTRAINT jobs_source_external_unique UNIQUE (source_site, external_id);
  END IF;
END $$;

-- ------------------------------------------------------------
-- 3. Fontes de scraping (usada por /admin/scraping)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scraping_sources (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  type        TEXT NOT NULL,
  url         TEXT NOT NULL,
  api_key     TEXT,
  description TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.scraping_sources ENABLE ROW LEVEL SECURITY;

-- Somente usuários autenticados (proprietário) leem e escrevem; anon não vê nada
-- (a coluna api_key é sensível).
DROP POLICY IF EXISTS "admin_all_scraping" ON public.scraping_sources;
CREATE POLICY "admin_all_scraping" ON public.scraping_sources
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ------------------------------------------------------------
-- 4. Leitura pública x admin
--    Público: cursos e produtos disponíveis. Admin: vê tudo (inclusive indisponíveis).
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "public_read_products" ON public.products;
CREATE POLICY "public_read_products" ON public.products
  FOR SELECT TO anon, authenticated USING (is_available = true);

DROP POLICY IF EXISTS "admin_read_all_products" ON public.products;
CREATE POLICY "admin_read_all_products" ON public.products
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow public read access to courses" ON public.courses;
DROP POLICY IF EXISTS "public_read_courses" ON public.courses;
CREATE POLICY "public_read_courses" ON public.courses
  FOR SELECT TO anon, authenticated USING (true);
