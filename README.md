# TrabalheRemotoBrasil

Plataforma de vagas remotas com automação de scraping, recomendação de cursos e loja virtual integrada.

---

## Estrutura do Projeto

```text
TrabalheRemotoBrasil/
├── .github/workflows/scrape-jobs.yml   # Automação de scraping (GitHub Actions)
├── .gitignore
├── README.md
├── docker-compose.yml                  # Orquestração local (Next.js + Postgres)
├── docs/
│   ├── database_schema.sql             # Script SQL Supabase (tabelas + RLS + seed)
│   ├── plano-site-vagas-remotas.md     # Plano inicial do site
│   └── PLANO_ARQUITETURA_E_EXECUCAO.md # Plano consolidado de arquitetura e execução
├── assets/brand/                       # Logos e identidade visual
├── frontend/                           # Next.js 14 (App Router) + Tailwind CSS
│   ├── Dockerfile                      # Build standalone para Hostgator VPS
│   ├── public/
│   ├── src/
│   │   ├── app/                        # Rotas (App Router)
│   │   ├── components/                 # Header, Hero, JobCard, JobFilters, ThemeProvider
│   │   ├── lib/supabase/               # Clientes browser + server
│   │   ├── services/                   # fetchJobs, fetchJobBySlug, fetchRecommendedCourses
│   │   └── types/                      # Tipos do domínio (Job, Course, Product)
│   └── README.md
├── scrapers/                           # Web Scraping (Scrapy + Playwright)
│   ├── pipelines/                      # Deduplicação, limpeza e persistência Supabase
│   └── spiders/                        # Spiders por fonte (LinkedIn, Indeed)
└── backend/                            # (Futura) Django + DRF
```

---

## Stack Tecnológica (Fase 1 — Vercel + Supabase)

| Camada       | Tecnologia                          |
|--------------|-------------------------------------|
| **Frontend** | Next.js 14 (App Router) + React 18  |
| **Estilo**   | Tailwind CSS (Apple HIG inspired)   |
| **Banco**    | Supabase (PostgreSQL Serverless)    |
| **Scraping** | Scrapy / Playwright + GitHub Actions|
| **Deploy**   | Vercel (Fase 1) → Hostgator VPS (Fase 2) |
---

## Como Rodar

### 1. Frontend (desenvolvimento local)
```bash
cd frontend
npm install
cp .env.example .env.local   # Preencha com credenciais Supabase
npm run dev
```

### 2. Banco de Dados (Supabase)
1. Crie um projeto em [supabase.com](https://supabase.com).
2. Copie `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` no `.env.local`.
3. Execute o script `docs/database_schema.sql` no SQL Editor do Supabase.

### 3. Scrapers (atualização automática)
```bash
cd scrapers
pip install -r requirements.txt
scrapy crawl linkedin_jobs
```
Ou deixe rodando via **GitHub Actions** (`.github/workflows/scrape-jobs.yml`).

---

## Próximos Passos

- [x] Configurar Next.js + Tailwind + TypeScript no `/frontend`
- [x] Criar componentes Apple HIG (Header, Hero, JobCard, JobFilters, ThemeProvider)
- [x] Conectar ao Supabase (client e server)
- [x] Criar rotas: `/`, `/vaga/[slug]`, `/loja`, `/cursos`, `/sobre`, `/contato`, `/privacidade`, `/termos`
- [x] Banco de dados: script SQL com tabelas, RLS e seed data
- [x] Scrapers: spiders de exemplo (LinkedIn, Indeed) + pipelines de limpeza e persistência
- [x] Automação: GitHub Actions para execução periódica
- [x] Docker: Dockerfile + docker-compose para migração futura
- [ ] Instalar dependências e testar `npm run dev` no `/frontend`
- [ ] Configurar credenciais do Supabase em `.env.local`
- [ ] Deploy na Vercel e configurar domínio próprio
- [ ] Expandir spiders para mais fontes de vagas

---

## Licença

Proprietário — Uso interno do projeto TrabalheRemotoBrasil.