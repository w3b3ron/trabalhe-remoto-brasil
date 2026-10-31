# TrabalheRemotoBrasil.com — Plano de Arquitetura, Design e Execução

---

## 1. Resumo Executivo & Análise de Negócios

O **TrabalheRemotoBrasil.com** é uma plataforma centralizada de agregação, curadoria e busca de vagas 100% remotas para profissionais brasileiros. O modelo de negócios apoia-se em um ecossistema de receita de três pilares:

1. **Agregação e Busca de Vagas (Core)**: Ingestão contínua e gratuita de vagas remotas para atração massiva de tráfego orgânico (SEO).
2. **Monetização por Cursos e Afiliados**: Recomendação contextualizada de cursos de qualificação (Udemy, Hotmart, Alura) baseada nos requisitos técnicos das vagas listadas.
3. **Loja Virtual (Store)**: Comercialização de produtos físicos e digitais voltados a profissionais de trabalho remoto (acessórios para home office, e-books, templates de currículo e portfólio).

---

## 2. Arquitetura de Software & Estratégia de Hospedagem

### 2.1 Fase 1: Validação de Viabilidade (Vercel + Supabase)
- **Frontend / SSR / SEO**: **Next.js 14+ (App Router)** hospedado na **Vercel**.
  - Aproveitamento do Server-Side Rendering (SSR) e Incremental Static Regeneration (ISR) para garantir indexação rápida no Google e performance Lighthouse próxima de 100.
- **Backend & Banco de Dados**: **Supabase (PostgreSQL Serverless)**.
  - Oferece banco de dados relacional robusto, autenticação, armazenamento de arquivos (logos de empresas) e API REST/GraphQL automática.
- **Automação de Scrapers**: **GitHub Actions Cron Jobs** + Scripts Python (`scrapers/`).
  - Execução periódica automatizada sem necessidade de servidor Celery/Redis dedicado na fase inicial.

### 2.2 Fase 2: Estratégia de Migração Futura (Hostgator VPS)
- Para migrar da Vercel/Supabase para a **Hostgator** mantendo alta performance:
  - **Ambiente Recomendado**: Hostgator VPS com Docker e Nginx Reverse Proxy.
  - **Desacoplamento de Banco**: Uso de ORM (Prisma/Drizzle) com suporte a PostgreSQL standard.
  - **Build Standalone**: Next.js configurado com `output: 'standalone'` para execução leve em container Docker.

---

## 3. Diretrizes de Design (Apple Human Interface Guidelines - HIG)

O design da plataforma adota rigorosamente os princípios da Apple HIG:

1. **Clareza (Clarity)**: Tipografia limpa baseada no sistema (`Inter` / `SF Pro`). Leitura rápida de informações críticas em cards.
2. **Deferência (Deference)**: Cores neutras no plano de fundo para destacar o conteúdo. Uso de superfícies translúcidas com `backdrop-blur`.
---

## 4. Esquema do Banco de Dados (Supabase PostgreSQL)

```sql
-- Tabela de Empresas
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo_url TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Vagas (Jobs)
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
| Data | Etapa | Descrição | Status |
|---|---|---|---|
| 31/10/2026 | Arquitetura | Definição da stack (Next.js, Supabase, Tailwind, Vercel) e plano de migração Hostgator | **Concluído** |
| 31/10/2026 | Documentação | Criação da documentação consolidada em `/docs` | **Concluído** |
| 31/10/2026 | Banco de Dados | Criação do script SQL do Supabase em `/docs/database_schema.sql` | **Concluído** |
| 31/10/2026 | Frontend Base | Configuração de Next.js, Tailwind CSS, TypeScript e Supabase Client | **Concluído** |
| 31/10/2026 | Componentes HIG | Desenvolvimento de Header, Hero, JobCards, JobFilters e ThemeProvider | **Concluído** |
| 31/10/2026 | Rotas do App | Implementação de todas as páginas: `/`, `/vaga/[slug]`, `/loja`, `/cursos`, `/sobre`, `/contato`, `/privacidade`, `/termos` | **Concluído** |
| 31/10/2026 | Scraper Pipeline | Implementação dos scripts Python em `/scrapers` e GitHub Workflow | **Concluído** |
| 31/10/2026 | Docker & Infra | Dockerfile standalone + docker-compose.yml para migração futura | **Concluído** |
| 31/10/2026 | Instalação & Teste | `npm install` e `npm run dev` no `/frontend` | **Pendente** |
| 31/10/2026 | Deploy Vercel | Conexão com Git e deploy automático | **Pendente** |
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  views_count INT DEFAULT 0,
  source_site VARCHAR(100),
  external_id VARCHAR(255),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Cursos Recomendados
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

-- Tabela da Loja Virtual (Produtos)
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
```

---

## 5. Log de Execução e Status do Projeto

| Data | Etapa | Descrição | Status |
|---|---|---|---|
| 31/10/2026 | Arquitetura | Definição da stack (Next.js, Supabase, Tailwind, Vercel) e plano de migração Hostgator | **Concluído** |
| 31/10/2026 | Documentação | Criação da documentação consolidada em `/docs` | **Concluído** |
| 31/10/2026 | Banco de Dados | Criação do script SQL do Supabase em `/docs/database_schema.sql` | **Concluído** |
| 31/10/2026 | Frontend Base | Configuração de Next.js, Tailwind CSS, TypeScript e Supabase Client | **Em Andamento** |
| 31/10/2026 | Componentes HIG | Desenvolvimento de Header, Hero, JobCards, JobFilters e CommandPalette | **Em Andamento** |
| 31/10/2026 | Scraper Pipeline | Implementação dos scripts Python em `/scrapers` e GitHub Workflow | **Pendente** |

3. **Profundidade (Depth)**: Sombras suaves e elevações discretas. Atrevimento tátil com atalho global de busca (`Cmd + K` / `Ctrl + K`).
4. **Micro-interações e Feedback**: Resposta imediata ao toque/clique (`active:scale-[0.98]`). Componentes Skeleton screens.
5. **Acessibilidade & Modos de Cor**: Suporte nativo a Tema Claro e Escuro (Dark/Light Mode). Botões com área mínima de 44x44px.
