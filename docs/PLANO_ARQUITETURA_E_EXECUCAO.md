# TrabalheRemotoBrasil.com — Plano de Arquitetura, Design e Execução

---

## 1. Resumo Executivo & Análise de Negócios

> **Versão:** 2.0 | **Data:** 06/11/2026 | **Status:** Site em produção em `www.trabalheremotobrasil.com` (Vercel + Supabase)

O **TrabalheRemotoBrasil.com** é uma plataforma centralizada de agregação, curadoria e busca de vagas 100% remotas para profissionais brasileiros. O modelo de negócios apoia-se em um ecossistema de receita de três pilares:

1. **Agregação e Busca de Vagas (Core)**: Ingestão contínua e gratuita de vagas remotas para atração massiva de tráfego orgânico (SEO).
2. **Monetização por Cursos e Afiliados**: Recomendação contextualizada de cursos de qualificação baseada nos requisitos técnicos das vagas. **Preferência por cursos que pagam comissão por indicação (afiliado).** Quando não houver link de afiliado, exibir cursos de boa reputação (gratuitos ou pagos) como referência.
3. **Loja Virtual (Store)**: Comercialização de produtos voltados a profissionais de trabalho remoto (acessórios para home office, e-books, templates) **via links de afiliado** (Amazon, Magalu, etc.), sem checkout próprio. O proprietário recebe parte da receita gerada pela indicação.

### 1.1 Área de Administração

O proprietário precisa de uma área administrativa protegida (`/admin`) para:
- Cadastrar/editar cursos com `affiliate_url` (link de afiliado), preço, nota, tags relacionadas e status (ativo/inativo).
- Cadastrar/editar produtos com `affiliate_or_buy_url`, preço, categoria e disponibilidade.
- Definir se um curso é gratuito ou pago.
- Ativar/desativar exibição pública de cursos e produtos.

---

## 2. Estado Atual do Projeto (Site ao Vivo)

O site já está em produção em `www.trabalheremotobrasil.com` e espelha o repositório GitHub.

### ✅ Entregue e funcionando

| Área | Componente | Status |
|------|-----------|--------|
| Arquitetura | Next.js 14 App Router + Supabase + Vercel | Funcionando |
| Banco de dados | `companies`, `jobs`, `courses`, `products` com RLS e seed | 3 vagas (Nubank, iFood, VTEX) no ar |
| Frontend | Home, `/vaga/[slug]`, `/loja`, `/cursos`, `/sobre`, `/contato`, `/privacidade`, `/termos` | Navegação presente |
| Componentes | Hero, JobCard, JobFilters, ThemeProvider, CommandPalette | Busca, filtros contrato/nível, tags em alta |
| Serviços | `fetchJobs`, `fetchJobBySlug`, `fetchSimilarJobs`, `fetchRecommendedCourses`, `fetchProducts` | Vagas semelhantes exibidas |
| Scrapers | Spiders LinkedIn + Indeed (template), pipelines dedup/limpeza/upsert, GitHub Actions 2x/dia | Workflow configurado |
| Infra | Dockerfile standalone, docker-compose, brand assets | Preparado para Fase 2 |
| SEO parcial | Título e meta description na home | Presente |

### ⚠️ Gaps identificados (site ao vivo vs repositório)

| # | Gap | Impacto | Prioridade |
|---|-----|---------|------------|
| G1 | `robots.txt` e `sitemap.xml` retornam 404 | SEO | Alta |
| G2 | Cursos recomendados não renderizados na página de vaga | Conversão/afiliado | Alta |
| G3 | Sem área de admin para links de afiliado (cursos e produtos) | Monetização | Alta |
| G4 | Busca limitada apenas a `title`; filtro por `tags` não aplicado | UX | Alta |
| G5 | `views_count` não incrementado | Dados | Média |
| G6 | Metadados dinâmicos ausentes em `/vaga/[slug]` | SEO/CTR | Alta |
| G7 | Sem ISR/revalidate nas rotas públicas | Performance | Média |
| G8 | Loja sem redirecionamento de afiliado funcional | Receita | Alta |
| G9 | Scrapers dependem de LinkedIn (bloqueado); poucas fontes | Abastecimento | Alta |
| G10 | Sem autenticação/candidatura do usuário | Engajamento | Média |
| G11 | Referência quebrada a `docs/migrations/2026-11-job-details.sql` | Docs | Baixa |
| G12 | Sem testes nem CI de frontend | Qualidade | Média |

---

## 3. Arquitetura de Software & Estratégia de Hospedagem

### 3.1 Fase 1: Validação de Viabilidade (Vercel + Supabase) — EM PRODUÇÃO
- **Frontend / SSR / SEO**: Next.js 14+ (App Router) hospedado na Vercel.
- **Backend & Banco de Dados**: Supabase (PostgreSQL Serverless) com RLS.
- **Automação de Scrapers**: GitHub Actions Cron Jobs + Scripts Python (`scrapers/`).

### 3.2 Fase 2: Estratégia de Migração Futura (Hostgator VPS)
- Ambiente: Hostgator VPS com Docker e Nginx Reverse Proxy.
- Desacoplamento de Banco: ORM (Prisma/Drizzle) com PostgreSQL standard.
- Build Standalone: Next.js com `output: 'standalone'`.

---

## 4. Diretrizes de Design (Apple Human Interface Guidelines - HIG)

1. **Clareza (Clarity)**: Tipografia limpa baseada no sistema (`Inter` / `SF Pro`).
2. **Deferência (Deference)**: Cores neutras, superfícies translúcidas com `backdrop-blur`.
3. **Profundidade (Depth)**: Sombras suaves, atalho global de busca (`Cmd + K` / `Ctrl + K`).
4. **Micro-interações e Feedback**: `active:scale-[0.98]`, skeleton screens.
5. **Acessibilidade & Modos de Cor**: Tema Claro/Escuro, botões mínimos 44x44px.

## 5. Esquema do Banco de Dados (Supabase PostgreSQL)

Conforme `docs/database_schema.sql`. Tabelas: `companies`, `jobs`, `courses`, `products` com RLS habilitado e políticas de leitura pública.

**Campos de afiliado já mapeados:**
- `courses.affiliate_url` — link de afiliado do curso.
- `products.affiliate_or_buy_url` — link de afiliado/compra do produto.

---

## 5. Log de Execução e Status do Projeto (Resumo Histórico)

| Data | Etapa | Descrição | Status |
|---|---|---|---|
| 31/10/2026 | Arquitetura | Stack Next.js, Supabase, Tailwind, Vercel + migração Hostgator | **Concluído** |
| 31/10/2026 | Documentação | Documentação consolidada em `/docs` | **Concluído** |
| 31/10/2026 | Banco de Dados | Script SQL do Supabase em `/docs/database_schema.sql` | **Concluído** |
| 31/10/2026 | Frontend Base | Next.js, Tailwind CSS, TypeScript, Supabase Client | **Concluído** |
| 31/10/2026 | Componentes HIG | Header, Hero, JobCards, JobFilters, ThemeProvider | **Concluído** |
| 31/10/2026 | Rotas do App | `/`, `/vaga/[slug]`, `/loja`, `/cursos`, `/sobre`, `/contato`, `/privacidade`, `/termos` | **Concluído** |
| 31/10/2026 | Scraper Pipeline | Spiders LinkedIn/Indeed + pipelines + GitHub Workflow | **Concluído** |
| 31/10/2026 | Docker & Infra | Dockerfile standalone + docker-compose.yml | **Concluído** |
| 31/10/2026 | Deploy Vercel | Site em produção em `www.trabalheremotobrasil.com` | **Concluído** |
| 06/11/2026 | Planejamento v2 | Plano consolidado com afiliados, admin, novas fontes de scrape | **Em Andamento** |

## 6. Fontes Alternativas para Scraping de Vagas (além do LinkedIn)

O LinkedIn bloqueia scrap sem autenticação/Cloudflare. Ordem de implementação recomendada:

| Fonte | Tipo | API pública? | Viabilidade BR | Observações |
|-------|------|--------------|----------------|-------------|
| Adzuna | API | ✅ | Alta | API oficial, filtro por país (`br`). Requer app_id/app_key. |
| Jooble | API | ✅ | Alta | API oficial, boa cobertura no Brasil. Requer chave. |
| Remote OK | JSON | ✅ | Média | `remoteok.com/remote-jobs.json`, global, fácil de consumir. |
| We Work Remotely | RSS | ✅ | Média | Global, foco remoto. |
| Wellfound | API | ✅ | Média | Startups, API pública limitada. |
| Remotar | Site BR | ❌ (scrap) | Alta | Portal brasileiro focado em remoto. |
| Trampos.co | Site BR | ❌ (scrap) | Alta | Tech/criativo/marketing no Brasil. |
| Vagas.com | Portal BR | ❌ (scrap) | Média | Grande volume, possível anti-bot. |
| Indeed Brasil | Site | ⚠️ (parcial) | Média | Já tem spider template, tende a bloquear. |

## 7. Plano de Implementação por Sprints

### Sprint A — Fundamentos de produção (SEO e estabilidade)
**Objetivo:** Corrigir itens que impedem indexação e garantir solidez do site no ar.

| # | Tarefa | Área | Esforço | Prioridade |
|---|--------|------|---------|------------|
| A1 | Criar `robots.txt` dinâmico no Next.js | Frontend | 0.5 dia | Alta |
| A2 | Criar `sitemap.xml` dinâmico (vagas ativas + páginas estáticas) | Frontend | 1 dia | Alta |
| A3 | Metadados dinâmicos (title, description, Open Graph) em `/vaga/[slug]` | Frontend | 0.5 dia | Alta |
| A4 | Adicionar `revalidate` (ISR) nas rotas públicas | Frontend | 0.5 dia | Média |
| A5 | Criar `.env.example` e atualizar README | Docs/DevOps | 0.5 dia | Alta |
| A6 | Corrigir referência quebrada a `docs/migrations/...` | Docs | 0.25 dia | Baixa |

**Definition of Done:** `robots.txt` e `sitemap.xml` retornam 200; páginas de vaga têm meta tags únicas; `npm run build` passa.

---
### 📌 Status de Continuidade (atualizado em 07/11/2026)

| Tarefa | Status | Comando local | Commit/Push | Observações |
|--------|--------|---------------|-------------|-------------|
| A1 | ✅ Concluído (push) | `frontend/src/app/robots.ts` | ✅ `037df3b` | `robots.txt` dinâmico com `sitemap` e `host` apontando para `NEXT_PUBLIC_SITE_URL`; disallow de `/admin/`, `/api/`, `/_next/` |
| A2 | ✅ Concluído (push) | `frontend/src/app/sitemap.ts` | ✅ `b0c33ec` | `sitemap.xml` dinâmico com rotas estáticas + vagas ativas do Supabase (`fetchJobs`) |
| A3 | ⏳ Pendente | — | — | Metadados dinâmicos em `/vaga/[slug]` |
| A4 | ⏳ Pendente | — | — | ISR/revalidate nas rotas públicas |
| A5 | ✅ Concluído | `.env.example` já existe | — | Já presente no repositório |
| A6 | ⏳ Pendente | — | — | Corrigir referência quebrada a `docs/migrations/...` |

**Build Vercel:** commit `037df3b` enviado ao `main`. Novo build acionado automaticamente após correção do tipo `Robots` (Next.js 14 não exporta esse tipo). Aguardando resultado do deploy.

**Próximo passo:** confirmar deploy no Vercel e validar `/robots.txt` e `/sitemap.xml` em produção.

### Sprint B — Busca, experiência e cursos recomendados com afiliado
**Objetivo:** Melhorar relevância da busca e ativar recomendação de cursos com prioridade a links de afiliado.

| # | Tarefa | Área | Esforço | Prioridade |
|---|--------|------|---------|------------|
| B1 | Ampliar `fetchJobs`: busca `ilike` em `title`, `description`, `tags` e `company.name` | Frontend/Supabase | 1 dia | Alta |
| B2 | Aplicar filtro por `tags` na query de vagas | Frontend | 0.5 dia | Média |
| B3 | Renderizar cursos recomendados em `/vaga/[slug]`, ordenando primeiro os com `affiliate_url` | Frontend | 0.5 dia | Alta |
| B4 | Incrementar `views_count` ao carregar `/vaga/[slug]` | Frontend/Supabase | 0.5 dia | Média |
| B5 | Ordenação: mais recentes, maior salário, destaque | Frontend | 0.5 dia | Média |

**Definition of Done:** Busca retorna match em descrição/empresa/tags; página de vaga exibe cursos com links de afiliado no topo.

### Sprint C — Área de administração (links de afiliado)
**Objetivo:** Permitir ao proprietário cadastrar/editar links de afiliado para cursos e produtos.

| # | Tarefa | Área | Esforço | Prioridade |
|---|--------|------|---------|------------|
| C1 | Página `/admin/login` (Supabase Auth, e-mail/senha do proprietário) | Frontend/Auth | 1 dia | Alta |
| C2 | Página `/admin/cursos`: listar, criar, editar cursos (incluindo `affiliate_url`, gratuito/pago, ativo/inativo) | Frontend/Supabase | 1.5 dias | Alta |
| C3 | Página `/admin/produtos`: listar, criar, editar produtos (incluindo `affiliate_or_buy_url`) | Frontend/Supabase | 1.5 dias | Alta |
| C4 | RLS: apenas o proprietário pode escrever em `courses` e `products` | Supabase | 0.5 dia | Alta |
| C5 | Botão de afiliado na vitrine pública usando URLs cadastradas no admin | Frontend | 0.5 dia | Alta |

**Definition of Done:** Proprietário acessa `/admin`, cadastra link de afiliado, e o link aparece na vitrine pública.

### Sprint D — Loja virtual (modelo afiliado)
**Objetivo:** Ativar loja com redirecionamento para links de afiliado (sem checkout próprio).

| # | Tarefa | Área | Esforço | Prioridade |
|---|--------|------|---------|------------|
| D1 | Validar listagem de produtos em `/loja` (imagens, preço, categoria, link de afiliado) | Frontend | 0.5 dia | Alta |
| D2 | Página de detalhe do produto `/produto/[slug]` | Frontend | 0.5 dia | Média |
| D3 | Botão "Comprar na [Loja]" com redirecionamento para `affiliate_or_buy_url` | Frontend | 0.5 dia | Alta |
| D4 | (Opcional) Carrinho de desejos/salvar produto (estado local) | Frontend | 1 dia | Baixa |

**Definition of Done:** Usuário clica em produto e é redirecionado para o link de afiliado cadastrado pelo admin.

### Sprint E — Scraping robusto e novas fontes
**Objetivo:** Abastecimento contínuo de vagas com fontes além do LinkedIn.

| # | Tarefa | Área | Esforço | Prioridade |
|---|--------|------|---------|------------|
| E1 | Spider/fonte via **Adzuna API** | Scrapers | 1 dia | Alta |
| E2 | Spider/fonte via **Jooble API** | Scrapers | 1 dia | Alta |
| E3 | Spider via **Remote OK** (JSON público) | Scrapers | 0.5 dia | Alta |
| E4 | Spider via **Remotar** e/ou **Trampos.co** (scrap direto) | Scrapers | 1.5 dias | Média |
| E5 | Reescrever spider do LinkedIn com **Playwright** (sessão persistida) | Scrapers | 2 dias | Média |
| E6 | Alerta no GitHub Actions se scraper retornar 0 vagas ou falhar | DevOps | 0.5 dia | Média |
| E7 | Executar scrapers em produção e validar persistência no Supabase | Scrapers | 0.5 dia | Alta |

**Definition of Done:** Pelo menos 3 novas fontes ativas populando o banco; alerta de falha configurado.

### Sprint F — Qualidade, autenticação e Fase 2 (Infra)
**Objetivo:** Testes, autenticação de usuário e preparação para Hostgator VPS.

| # | Tarefa | Área | Esforço | Prioridade |
|---|--------|------|---------|------------|
| F1 | Testes unitários/integração em serviços do frontend | Frontend | 1.5 dias | Média |
| F2 | CI no GitHub Actions: `npm run build` + `npm run lint` | DevOps | 0.5 dia | Média |
| F3 | Supabase Auth: cadastro/login do candidato, salvar vaga favorita | Frontend/Auth | 2 dias | Média |
| F4 | Tabela `applications` (candidatura à vaga) + RLS | Supabase | 1 dia | Baixa |
| F5 | Pasta `backend/` com Django + DRF (opcional, Fase 2) | Backend | 3 dias | Baixa |
| F6 | docker-compose para Hostgator VPS (Next.js standalone + Nginx + Postgres) | DevOps | 1 dia | Baixa |

## 8. Roadmap Sugerido (12 semanas)

```
Semanas 1-2:   Sprint A (SEO + estabilidade)
Semanas 3-4:   Sprint B (Busca + cursos recomendados)
Semanas 5-6:   Sprint C (Área de admin + links de afiliado)
Semanas 7-8:   Sprint D (Loja afiliada)
Semanas 9-10:  Sprint E (Scraping Adzuna, Jooble, Remote OK, Remotar)
Semanas 11-12: Sprint F (Qualidade + Fase 2 / Infra)
```

---

## 9. Métricas de Sucesso (KPIs)

| Métrica | Atual | Alvo (12 semanas) |
|---------|-------|-------------------|
| Páginas indexadas no Google | Baixa (sem sitemap) | Alta |
| CTR nos resultados de busca | Não mensurado | +20% |
| Cursos com link de afiliado cadastrado | 0 | 100% dos cursos ativos |
| Produtos com link de afiliado | 0 | 100% dos produtos ativos |
| Vagas novas por semana (scraper) | 0 (apenas seed) | 50+ de ≥3 fontes |
| Fontes de scraping ativas | 2 (template) | 5+ |
| Conversão loja (clique em afiliado) | Não implementado | Funcional |

---

## 10. Próximo Passo Imediato

Recomenda-se iniciar pelo **Sprint A**, pois o site já está ao vivo e corrigir SEO (`robots.txt`, `sitemap.xml`, metadados) traz impacto imediato no tráfego orgânico sem alterar a experiência do usuário.
