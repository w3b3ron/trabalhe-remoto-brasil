-- ============================================================
-- Migration: dados opcionais para o card e a página da vaga
-- Execute no SQL Editor do Supabase. É idempotente (pode rodar mais de uma vez).
-- Todos os campos são opcionais: a interface esconde o que estiver vazio.
-- ============================================================

-- Empresa: bloco "Sobre a empresa"
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS about        TEXT,
  ADD COLUMN IF NOT EXISTS sector       TEXT,
  ADD COLUMN IF NOT EXISTS size         TEXT,
  ADD COLUMN IF NOT EXISTS headquarters TEXT;

-- Vaga: seções "Responsabilidades" e "Benefícios" da página de detalhe
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS responsibilities TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS benefits         TEXT[] DEFAULT '{}';
