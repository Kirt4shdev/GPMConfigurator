# Script de inicio rápido para GPM Configurador
# Para Windows PowerShell

Write-Host "🚀 Iniciando GPM Configurador..." -ForegroundColor Cyan

# 1. Verificar Docker
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerInstalled) {
    Write-Host "❌ Docker no está instalado. Por favor, instala Docker primero." -ForegroundColor Red
    exit 1
}

# 2. Verificar Node.js
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeInstalled) {
    Write-Host "❌ Node.js no está instalado. Por favor, instala Node.js primero." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Paso 1: Levantando PostgreSQL..." -ForegroundColor Blue
docker-compose up -d
Start-Sleep -Seconds 5

Write-Host "📦 Paso 2: Configurando Backend..." -ForegroundColor Blue
Set-Location api

if (-not (Test-Path ".env")) {
    Write-Host "Creando .env desde .env.example..."
    Copy-Item .env.example .env
}

if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias del backend..."
    npm install
}

Write-Host "Ejecutando migraciones..."
npm run migrate

Write-Host "Importando seed..."
npm run seed

Set-Location ..

Write-Host "📦 Paso 3: Configurando Frontend..." -ForegroundColor Blue
Set-Location web

if (-not (Test-Path ".env")) {
    Write-Host "Creando .env desde .env.example..."
    Copy-Item .env.example .env
}

if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias del frontend..."
    npm install
}

Set-Location ..

Write-Host "✅ Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar el sistema:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Terminal 1 - Backend:"
Write-Host "  cd api; npm run dev"
Write-Host ""
Write-Host "Terminal 2 - Frontend:"
Write-Host "  cd web; npm run dev"
Write-Host ""
Write-Host "Accede a:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173"
Write-Host "  API: http://localhost:3000"
Write-Host "  Docs: http://localhost:3000/docs"
Write-Host "  Adminer: http://localhost:8080"
Write-Host ""
Write-Host "Usuarios demo:" -ForegroundColor Yellow
Write-Host "  Admin: admin@gpm.com / admin123"
Write-Host "  Usuario: user@gpm.com / user123"

