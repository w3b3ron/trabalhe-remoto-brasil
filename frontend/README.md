# TrabalheRemotoBrasil.com — Frontend

Frontend em **Next.js 14 (App Router)** com TypeScript, Tailwind CSS e cliente Supabase.

## Tecnologias

- **Next.js 14** — App Router, Server Components, SSR/ISR para SEO.
- **React 18** — Server Components, Server Actions.
- **Tailwind CSS** — Estilização utilitária com paleta inspirada na Apple HIG.
- **Supabase (SSR/Client)** — Autenticação, banco de dados e storage.
- **TypeScript** — Tipagem estrita em todo o código.

## Estrutura

```
frontend/
├── src/
│   ├── app/                    # App Router (rotas e páginas)
│   │   ├── page.tsx            # Homepage (listagem de vagas)
│   │   ├── vaga/[slug]/        # Detalhe da vaga
│   │   ├── loja/page.tsx       # Loja virtual
│   │   ├── cursos/page.tsx     # Recomendação de cursos
│   │   ├── sobre/page.tsx      # Sobre
│   │   ├── contato/page.tsx    # Contato
│   │   ├── privacidade/page.tsx # Privacidade
│   │   ├── termos/page.tsx     # Termos de uso
│   │   └── globals.css         # Estilos globais + tokens Apple HIG
│   ├── components/
│   │   ├── layout/Header.tsx   # Header glassmorphism
│   │   ├── providers/ThemeProvider.tsx  # Dark/Light mode
│   │   ├── home/Hero.tsx       # Hero section
│   │   └── jobs/               # JobCard, JobDetail, SaveJobButton, ShareButton, CompanyLogo, JobFilters
│   ├── lib/supabase/          # Clientes Supabase (browser + server)
│   ├── services/jobs.ts        # Serviços de dados (vagas, cursos, produtos)
│   └── types/index.ts          # Tipos do domínio
├── public/                    # Assets estáticos
├── .env.example               # Exemplo de variáveis de ambiente
├── next.config.mjs            # Configuração do Next.js (standalone output)
├── tailwind.config.ts         # Configuração do Tailwind
├── tsconfig.json              # Configuração do TypeScript
└── package.json               # Dependências e scripts
```

## Rotas Principais

| Rota | Descrição |
|---|---|
| `/` | As 12 vagas mais recentes (3 colunas x 4 linhas) + filtros; com filtro ativo mostra todos os resultados |
| `/vaga/[slug]` | Detalhe da vaga (sobre, tecnologias, responsabilidades, benefícios, empresa, vagas semelhantes) + cursos recomendados |
| `/loja` | Loja do Home Office |
| `/cursos` | Catálogo de cursos |
| `/sobre` | Sobre o projeto |
| `/contato` | Contato |
| `/privacidade` | Política de privacidade |
| `/termos` | Termos de uso |

## Card de vaga

`JobCard` é sempre exibido completo (sem expandir/recolher): empresa, título, chips de contrato, senioridade e modalidade, descrição (até 4 linhas), tecnologias (`tags`, máx. 6), grade de detalhes, bloco "Sobre a empresa" (só se a empresa tiver `website`), salário, botão **Salvar vaga** (`SaveJobButton`, guarda ids em `localStorage` na chave `trb:saved-jobs`) e **Ver vaga →** para `/vaga/[slug]`. Campos ausentes são omitidos, nunca exibidos como placeholder.

### Dados opcionais (migration)

Para preencher o bloco "Sobre a empresa" e as seções "Responsabilidades" e "Benefícios" da página da vaga, execute `docs/migrations/2026-11-job-details.sql` no SQL Editor do Supabase (idempotente). Ela adiciona `companies.about/sector/size/headquarters` e `jobs.responsibilities/benefits`. Sem a migration, o site funciona normalmente e essas seções simplesmente não aparecem.

### Fonte

A fonte Inter é empacotada localmente com `@fontsource-variable/inter` (sem depender do Google Fonts no build).

## Como Rodar

### Desenvolvimento
```bash
cd frontend
npm install
cp .env.example .env.local   # Preencha com credenciais Supabase
npm run dev
```

### Produção
```bash
cd frontend
npm run build
npm start
```

### Deploy na Vercel
```bash
vercel --prod
```

> O `next.config.mjs` está configurado com `output: 'standalone'` para permitir deploy em Docker (Hostgator VPS) no futuro.