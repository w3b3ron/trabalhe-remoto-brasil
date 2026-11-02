-- ============================================================
-- TrabalheRemotoBrasil.com - Migration: Detalhes da Vaga e Empresa
-- Data: 2026-11
-- ============================================================

-- 1. Novos campos em jobs
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS stack TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS responsibilities TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS benefits TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS apply_url TEXT;

-- published_at já existe no schema base; garantir índice
CREATE INDEX IF NOT EXISTS idx_jobs_published_at_desc ON public.jobs (published_at DESC);

-- slug único (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'jobs_slug_unique'
  ) THEN
    ALTER TABLE public.jobs ADD CONSTRAINT jobs_slug_unique UNIQUE (slug);
  END IF;
END $$;

-- 2. Novos campos em companies
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS about TEXT,
  ADD COLUMN IF NOT EXISTS sector TEXT,
  ADD COLUMN IF NOT EXISTS size TEXT,
  ADD COLUMN IF NOT EXISTS headquarters TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT;

-- 3. Backfill de slug para vagas existentes (empresa-titulo-id curto)
UPDATE public.jobs j
SET slug = LOWER(REGEXP_REPLACE(c.name || '-' || j.title, '[^a-z0-9]+', '-', 'g')) || '-' || SUBSTRING(j.id::text, 1, 8)
FROM public.companies c
WHERE j.company_id = c.id
  AND (j.slug IS NULL OR j.slug = '');

-- 4. Backfill de apply_url (usa link atual da vaga se existir, senão placeholder)
UPDATE public.jobs
SET apply_url = COALESCE(apply_url, 'https://exemplo.com/candidatura')
WHERE apply_url IS NULL;

-- 5. Atualizar seed de empresas com novos campos (upsert)
INSERT INTO public.companies (id, name, slug, logo_url, website, about, sector, size, headquarters)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Nubank', 'nubank',
   'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
   'https://nubank.com.br',
   'O Nubank é uma plataforma de serviços financeiros que nasceu para devolver às pessoas o controle sobre o seu dinheiro. Somos uma das maiores plataformas digitais do mundo.',
   'Fintech', '1000+', 'São Paulo, SP'),
  ('22222222-2222-2222-2222-222222222222', 'iFood', 'ifood',
   'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=120&h=120&q=80',
   'https://ifood.com.br',
   'O iFood é a maior plataforma de delivery da América Latina, conectando restaurantes, mercados e consumidores.',
   'Foodtech', '1000+', 'Osasco, SP'),
  ('33333333-3333-3333-3333-333333333333', 'VTEX', 'vtex',
   'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=120&h=120&q=80',
   'https://vtex.com',
   'A VTEX é uma plataforma de comércio digital para empresas globais, permitindo comércio unificado em múltiplos canais.',
   'SaaS / E-commerce', '1000+', 'Rio de Janeiro, RJ')
ON CONFLICT (id) DO UPDATE SET
  website = EXCLUDED.website,
  about = EXCLUDED.about,
  sector = EXCLUDED.sector,
  size = EXCLUDED.size,
  headquarters = EXCLUDED.headquarters;

-- 6. Atualizar seed de vagas com novos campos
UPDATE public.jobs SET
  stack = ARRAY['React', 'Node.js', 'TypeScript', 'GraphQL'],
  responsibilities = ARRAY['Desenvolver e manter aplicações web de alta performance', 'Colaborar com times de produto e design', 'Revisar código e garantir qualidade'],
  benefits = ARRAY['Vale refeição', 'Plano de saúde', 'Auxílio home office', 'Horário flexível'],
  apply_url = 'https://nubank.com.br/careers'
WHERE slug LIKE 'desenvolvedor-full-stack-react-node-nubank%';

UPDATE public.jobs SET
  stack = ARRAY['Python', 'Airflow', 'Spark', 'SQL'],
  responsibilities = ARRAY['Construir e manter pipelines de dados', 'Otimizar processos de ETL', 'Garantir qualidade e observabilidade dos dados'],
  benefits = ARRAY['Vale refeição', 'Plano de saúde', 'Auxílio educação', 'Day off no aniversário'],
  apply_url = 'https://ifood.com.br/careers'
WHERE slug LIKE 'engenheiro-de-dados-python-ifood%';

UPDATE public.jobs SET
  stack = ARRAY['Figma', 'Design Systems', 'UI/UX', 'Apple HIG'],
  responsibilities = ARRAY['Projetar interfaces acessíveis e elegantes', 'Manter e evoluir o Design System', 'Realizar testes de usabilidade'],
  benefits = ARRAY['Vale refeição', 'Plano de saúde', 'Orçamento para conferências', 'Equipamento de ponta'],
  apply_url = 'https://vtex.com/careers'
WHERE slug LIKE 'product-designer-vtex%';

-- 7. Comentários nas colunas
COMMENT ON COLUMN public.jobs.stack IS 'Tecnologias e ferramentas requeridas';
COMMENT ON COLUMN public.jobs.responsibilities IS 'Principais responsabilidades da vaga';
COMMENT ON COLUMN public.jobs.benefits IS 'Benefícios oferecidos';
COMMENT ON COLUMN public.jobs.apply_url IS 'URL direta para candidatura no site da empresa';
COMMENT ON COLUMN public.companies.about IS 'Descrição institucional da empresa';
COMMENT ON COLUMN public.companies.sector IS 'Setor de atuação';
COMMENT ON COLUMN public.companies.size IS 'Porte da empresa (ex.: 1000+)';
COMMENT ON COLUMN public.companies.headquarters IS 'Sede (cidade, estado)';
COMMENT ON COLUMN public.companies.website IS 'Site corporativo';