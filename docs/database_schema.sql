-- ============================================================
-- TrabalheRemotoBrasil.com - Database Schema (Supabase PostgreSQL)
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANIES TABLE
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo_url TEXT,
  website TEXT,
  about TEXT,
  sector TEXT,
  size TEXT,
  headquarters TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. JOBS TABLE
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255) DEFAULT 'Remoto - Brasil',
  contract_type VARCHAR(50) DEFAULT 'CLT',
  experience_level VARCHAR(50) DEFAULT 'Pleno',
  salary_min NUMERIC(10, 2),
  salary_max NUMERIC(10, 2),
  salary_currency VARCHAR(10) DEFAULT 'BRL',
  apply_url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  responsibilities TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  views_count INT DEFAULT 0,
  source_site VARCHAR(100),
  external_id VARCHAR(255),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON public.jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_published_at ON public.jobs(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_tags ON public.jobs USING GIN(tags);

-- 3. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  provider VARCHAR(100) NOT NULL,
  description TEXT,
  affiliate_url TEXT NOT NULL,
  image_url TEXT,
  price NUMERIC(10, 2),
  rating NUMERIC(3, 2),
  related_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS TABLE (LOJA VIRTUAL)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  image_url TEXT NOT NULL,
  affiliate_or_buy_url TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'Home Office',
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Allow public read access to companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Allow public read access to active jobs" ON public.jobs FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);

-- SEED DATA FOR TESTING
INSERT INTO public.companies (id, name, slug, logo_url, website) VALUES
('11111111-1111-1111-1111-111111111111', 'Nubank', 'nubank', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80', 'https://nubank.com.br'),
('22222222-2222-2222-2222-222222222222', 'iFood', 'ifood', 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=120&h=120&q=80', 'https://ifood.com.br'),
('33333333-3333-3333-3333-333333333333', 'VTEX', 'vtex', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=120&h=120&q=80', 'https://vtex.com');

INSERT INTO public.jobs (id, company_id, title, slug, description, location, contract_type, experience_level, salary_min, salary_max, apply_url, tags, is_featured) VALUES
('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Desenvolvedor Full Stack React / Node.js', 'desenvolvedor-full-stack-react-node-nubank', 'Buscamos desenvolvedor(a) Full Stack para atuar em sistemas distribuídos de alta escala. Requisitos: React, Node.js, TypeScript e GraphQL.', '100% Remoto - Brasil', 'PJ', 'Senior', 12000.00, 16000.00, 'https://nubank.com.br/careers', ARRAY['React', 'Node.js', 'TypeScript', 'GraphQL'], true),
('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Engenheiro de Dados Python / Airflow', 'engenheiro-de-dados-python-ifood', 'Atue na construção de pipelines de ETL e processamento em lote e realtime. Requisitos: Python, Airflow, Spark e SQL.', '100% Remoto - Brasil', 'CLT', 'Pleno', 9000.00, 12500.00, 'https://ifood.com.br/careers', ARRAY['Python', 'Airflow', 'Spark', 'SQL'], true),
('a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Product Designer / UI/UX', 'product-designer-vtex', 'Projeta interfaces elegantes e acessíveis para plataformas e-commerce globais. Domínio de Figma e princípios Apple HIG.', '100% Remoto - Brasil', 'CLT', 'Senior', 10000.00, 14000.00, 'https://vtex.com/careers', ARRAY['Figma', 'UI/UX', 'Design Systems', 'Apple HIG'], false);

INSERT INTO public.courses (title, provider, description, affiliate_url, image_url, price, rating, related_tags) VALUES
('Formação React & Next.js do Zero ao Avançado', 'Udemy', 'Aprenda a construir aplicações modernas com SSR, Server Components e Tailwind CSS.', 'https://udemy.com', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=400&q=80', 89.90, 4.8, ARRAY['React', 'Next.js', 'TypeScript']),
('Python para Ciência e Engenharia de Dados', 'Alura', 'Domine Python, Pandas, Airflow e SQL para pipelines de alta performance.', 'https://alura.com.br', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80', 129.00, 4.9, ARRAY['Python', 'Airflow', 'SQL']);

INSERT INTO public.products (name, slug, description, price, image_url, affiliate_or_buy_url, category) VALUES
('Cadeira Ergonômica Mesh Pro Home Office', 'cadeira-ergonomica-mesh-pro', 'Ajuste lombar 3D, braços reguláveis e encosto respirável para longas jornadas de trabalho.', 899.00, 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=400&q=80', 'https://amazon.com.br', 'Ergonomia'),
('Teclado Mecânico Sem Fio Logitech MX Keys Mini', 'teclado-logitech-mx-keys-mini', 'Digite com conforto, teclas esféricas côncavas e iluminação inteligente.', 649.00, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80', 'https://amazon.com.br', 'Periféricos');
