# ============================================================================
# TrabalheRemotoBrasil - Script de Configuração do Ambiente
# Execute este script no PowerShell: .\SETUP.ps1
# ============================================================================

$ErrorActionPreference = "Stop"
$PROJECT_ROOT = "C:\Users\weber\trabalhe-remoto-brasil"
$FRONTEND = "$PROJECT_ROOT\frontend"
$SCRAPERS = "$PROJECT_ROOT\scrapers"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  TrabalheRemotoBrasil - Setup do Ambiente" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# 1. Verificar ferramentas
Write-Host "`n[1/5] Verificando ferramentas..." -ForegroundColor Yellow
$git = Get-Command git -ErrorAction SilentlyContinue
$node = Get-Command node -ErrorAction SilentlyContinue
$npm = Get-Command npm -ErrorAction SilentlyContinue
$python = Get-Command python -ErrorAction SilentlyContinue
$pip = Get-Command pip -ErrorAction SilentlyContinue

if (-not $git) { Write-Host "  Git: NAO ENCONTRADO. Instale em https://git-scm.com/" -ForegroundColor Red } else { Write-Host "  Git: $($git.Source)" -ForegroundColor Green }
if (-not $node) { Write-Host "  Node.js: NAO ENCONTRADO. Instale em https://nodejs.org/" -ForegroundColor Red } else { Write-Host "  Node.js: $($node | Select-Object -ExpandProperty Version)" -ForegroundColor Green }
if (-not $npm) { Write-Host "  npm: NAO ENCONTRADO" -ForegroundColor Red } else { Write-Host "  npm: $($npm | Select-Object -ExpandProperty Version)" -ForegroundColor Green }
if (-not $python) { Write-Host "  Python: NAO ENCONTRADO. Instale em https://python.org/" -ForegroundColor Red } else { Write-Host "  Python: $($python | Select-Object -ExpandProperty Version)" -ForegroundColor Green }
if (-not $pip) { Write-Host "  pip: NAO ENCONTRADO (use python -m pip)" -ForegroundColor Yellow }

# 2. Instalar dependências do frontend
Write-Host "`n[2/5] Instalando dependencias do frontend (npm)..." -ForegroundColor Yellow
Set-Location $FRONTEND
npm install --no-audit --no-fund --legacy-peer-deps
if ($LASTEXITCODE -eq 0) {
    Write-Host "  npm install: CONCLUIDO" -ForegroundColor Green
} else {
    Write-Host "  npm install: FALHOU. Rode manualmente: cd frontend && npm install" -ForegroundColor Red
}

# 3. Criar .env.local
Write-Host "`n[3/5] Configurando variaveis de ambiente..." -ForegroundColor Yellow
if (-not (Test-Path "$FRONTEND\.env.local")) {
    Copy-Item "$FRONTEND\.env.example" "$FRONTEND\.env.local"
    Write-Host "  .env.local criado a partir do .env.example" -ForegroundColor Green
    Write-Host "  EDITE o arquivo .env.local com suas credenciais Supabase!" -ForegroundColor Yellow
} else {
    Write-Host "  .env.local ja existe" -ForegroundColor Green
}

# 4. Instalar dependências dos scrapers (Python)
Write-Host "`n[4/5] Instalando dependencias dos scrapers (pip)..." -ForegroundColor Yellow
if (Test-Path "$SCRAPERS\requirements.txt") {
    python -m pip install -r "$SCRAPERS\requirements.txt"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  pip install: CONCLUIDO" -ForegroundColor Green
    } else {
        Write-Host "  pip install: FALHOU. Rode manualmente: python -m pip install -r scrapers/requirements.txt" -ForegroundColor Red
    }
} else {
    Write-Host "  requirements.txt nao encontrado. Pulando." -ForegroundColor Yellow
}

# 5. Instrucoes finais
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  PRÓXIMOS PASSOS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Crie um projeto em https://supabase.com"
Write-Host "  2. Execute docs/database_schema.sql no SQL Editor do Supabase"
Write-Host "  3. Edite frontend/.env.local com suas credenciais:"
Write-Host "     NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co"
Write-Host "     NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key"
Write-Host ""
Write-Host "  4. Rode o projeto:"
Write-Host "     cd frontend"
Write-Host "     npm run dev"
Write-Host "     # Acesse: http://localhost:3000"
Write-Host ""
Write-Host "  5. (Opcional) Rode os scrapers:"
Write-Host "     cd scrapers"
Write-Host "     python -m pip install -r requirements.txt"
Write-Host "     scrapy crawl linkedin_jobs"
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan