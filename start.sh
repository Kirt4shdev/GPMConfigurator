#!/bin/bash

# Script de inicio rápido para GPM Configurador
# Para sistemas Unix/Linux/macOS

echo "🚀 Iniciando GPM Configurador..."

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor, instala Docker primero."
    exit 1
fi

# 2. Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor, instala Node.js primero."
    exit 1
fi

echo -e "${BLUE}📦 Paso 1: Levantando PostgreSQL...${NC}"
docker-compose up -d
sleep 5

echo -e "${BLUE}📦 Paso 2: Configurando Backend...${NC}"
cd api

if [ ! -f ".env" ]; then
    echo "Creando .env desde .env.example..."
    cp .env.example .env
fi

if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias del backend..."
    npm install
fi

echo "Ejecutando migraciones..."
npm run migrate

echo "Importando seed..."
npm run seed

cd ..

echo -e "${BLUE}📦 Paso 3: Configurando Frontend...${NC}"
cd web

if [ ! -f ".env" ]; then
    echo "Creando .env desde .env.example..."
    cp .env.example .env
fi

if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias del frontend..."
    npm install
fi

cd ..

echo -e "${GREEN}✅ Configuración completada!${NC}"
echo ""
echo "Para iniciar el sistema:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd api && npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd web && npm run dev"
echo ""
echo "Accede a:"
echo "  Frontend: http://localhost:5173"
echo "  API: http://localhost:3000"
echo "  Docs: http://localhost:3000/docs"
echo "  Adminer: http://localhost:8080"
echo ""
echo "Usuarios demo:"
echo "  Admin: admin@gpm.com / admin123"
echo "  Usuario: user@gpm.com / user123"

