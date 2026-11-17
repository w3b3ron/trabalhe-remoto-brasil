# TrabalheRemotoBrasil

Plataforma de vagas remotas com automação de scraping, recomendação de cursos e loja virtual integrada.
Site: <https://www.trabalheremotobrasil.com>

---

## Estrutura do Projeto

```text
TrabalheRemotoBrasil/
├── .github/workflows/scrape-jobs.yml   # Scraping agendado (GitHub Actions)
├── docs/
│   ├── database_schema.sql             # Tabelas + RLS + seed (Supabase)
│   ├── migrations/                     # Migrações incrementais (rodar em ordem de data)
│   ├── PLANO_ARQUITETURA_E_EXECUCAO.md # Plano de sprints e status
│   └── plano-site-vagas-remotas.md
├── frontend/                           # Next.js 14 (App Router) + Tailwind CSS
│   ├── vercel.json                     # Build quando o Root Directory do Vercel é `frontend`
│   └── src/
│       ├── app/                        # Rotas públicas (/, /vaga, /cursos, /loja, /produto...) e /admin
│       ├── components/                 # home/Hero, jobs/(JobCard, JobRow, JobList, JobDetail...), layout/Header
│       ├── lib/supabase/               # Clientes browser + server
│       ├── services/                   # Consultas ao Supabase (vagas, cursos, produtos)
│       ├── middleware.ts               # Protege /admin/* (exceto /admin/login)
│       └── types/                      # Tipos do domínio
├── scrapers/                           # Scrapy (sem navegador) + pipelines + testes
│   ├── spiders/                        # remoteok_jobs, adzuna_jobs, jooble_jobs
│   ├── pipelines/cleaner.py            # Limpeza -> deduplicação -> persistência no Supabase
│   ├── check_result.py                 # Falha o workflow se nenhuma vaga foi persistida
│   └── tests/                          # pytest (unitários + crawl real contra servidor local)
├── vercel.json                         # Build quando o Root Directory do Vercel é a raiz
└── docker-compose.yml                  # Orquestração local (Next.js + Postgres)
```

---

## Stack

| Camada       | Tecnologia                                   |
|--------------|----------------------------------------------|
| **Frontend** | Next.js 14 (App Router) + React 18 + Tailwind |
| **Banco**    | Supabase (PostgreSQL + Auth + RLS)           |
| **Scraping** | Scrapy + GitHub Actions                      |
| **Deploy**   | Vercel (a partir de `main`)                  |

---

## Como Rodar

### 1. Banco de Dados (Supabase)
No SQL Editor, execute nesta ordem (todos os scripts de `migrations/` são idempotentes):
1. `docs/database_schema.sql`
2. `docs/migrations/2026-11-job-details.sql`
3. `docs/migrations/2026-11-admin-rls.sql`
4. `docs/migrations/2026-11-setup-sprints-c-e.sql` (`increment_views`, `scraping_sources`, RLS e unique de vagas)

Crie o usuário administrador em **Authentication → Users → Add user**.

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```
No Vercel, defina as duas variáveis para **Production e Preview**. O painel admin fica em `/admin/login`
(sem link no menu, de propósito).

### 3. Scrapers
```bash
cd scrapers
pip install -r requirements.txt pytest
python -m pytest -q                       # testes (inclui crawl real contra servidor local)

export SUPABASE_URL=...  SUPABASE_SERVICE_KEY=...   # service key: nunca no frontend
scrapy crawl remoteok_jobs                # sem chave de API
ADZUNA_APP_ID=... ADZUNA_APP_KEY=... scrapy crawl adzuna_jobs
JOOBLE_API_KEY=... scrapy crawl jooble_jobs
```
Sem a chave, os spiders Adzuna e Jooble avisam e não fazem nada.

**GitHub Actions** (`scrape-jobs.yml`, 08:00 e 20:00 UTC): configure os secrets `SUPABASE_URL` e
`SUPABASE_SERVICE_KEY` (obrigatórios) e `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, `JOOBLE_API_KEY` (opcionais).
O workflow falha, e o GitHub avisa por e-mail, se nenhuma vaga for persistida.

---

## Status (17/11/2026)

- [x] Site público: home com busca e filtros, página da vaga, cursos, loja, páginas institucionais
- [x] SEO (robots, sitemap, metadados, ISR) e busca avançada
- [x] Admin: login (Supabase Auth), CRUD de cursos, produtos e fontes de scraping
- [x] Scrapers: pipeline, Remote OK, Adzuna e Jooble, com testes e workflow que falha de verdade
- [ ] Rodar as migrações no Supabase de produção e configurar os secrets do GitHub
- [ ] Primeira execução real dos scrapers e validação das vagas no site
- [ ] Spiders Remotar/Trampos.co e reescrita do LinkedIn (Sprint E4/E5)
- [ ] Sprint F: testes do frontend, CI e área do candidato

Detalhes por sprint em `docs/PLANO_ARQUITETURA_E_EXECUCAO.md`.

---

## Licença

Proprietário — Uso interno do projeto TrabalheRemotoBrasil.
