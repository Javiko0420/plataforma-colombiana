#!/bin/bash

# Script de Setup para Desarrollo Local
# Plataforma Colombiana - Sistema de Autenticación

set -e  # Exit on error

echo "🚀 Iniciando setup de desarrollo local..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Archivo .env no encontrado. Copiando desde env.example...${NC}"
    cp env.example .env
    echo -e "${GREEN}✅ Archivo .env creado${NC}"
else
    echo -e "${GREEN}✅ Archivo .env ya existe${NC}"
fi

# Check if NEXTAUTH_SECRET needs to be generated
if grep -q "your-super-secret-key" .env; then
    echo -e "${YELLOW}⚠️  NEXTAUTH_SECRET tiene valor por defecto. Generando nuevo secret...${NC}"
    NEW_SECRET=$(openssl rand -base64 32)
    echo ""
    echo -e "${GREEN}Nuevo NEXTAUTH_SECRET generado:${NC}"
    echo "$NEW_SECRET"
    echo ""
    echo -e "${YELLOW}Por favor, actualiza manualmente tu archivo .env con este valor${NC}"
else
    echo -e "${GREEN}✅ NEXTAUTH_SECRET ya configurado${NC}"
fi

# Check DATABASE_URL
if grep -q "username:password@localhost" .env; then
    echo -e "${YELLOW}⚠️  DATABASE_URL tiene valores por defecto${NC}"
    echo -e "${YELLOW}   Por favor, actualiza con tus credenciales de PostgreSQL${NC}"
else
    echo -e "${GREEN}✅ DATABASE_URL configurado${NC}"
fi

echo ""
echo "📦 Instalando dependencias..."
npm install

echo ""
echo "🔨 Generando Prisma Client..."
npm run db:generate

echo ""
echo -e "${YELLOW}⚠️  Verificando conexión a la base de datos...${NC}"
echo "Si la base de datos no existe, créala primero con:"
echo "  createdb plataforma_colombiana"
echo ""

read -p "¿La base de datos existe y está lista? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🗄️  Ejecutando migraciones de Prisma..."
    npm run db:migrate
    echo -e "${GREEN}✅ Migraciones completadas${NC}"
else
    echo -e "${YELLOW}⚠️  Saltando migraciones. Ejecuta 'npm run db:migrate' cuando la BD esté lista${NC}"
fi

echo ""
echo -e "${GREEN}✅ Setup completado!${NC}"
echo ""
echo "📋 Checklist de verificación:"
echo ""
echo "1. ✅ Dependencias instaladas"
echo "2. ✅ Prisma Client generado"
echo "3. ⏳ Verifica tu archivo .env:"
echo "   - NEXTAUTH_SECRET (debe ser único, 32+ caracteres)"
echo "   - DATABASE_URL (credenciales correctas de PostgreSQL)"
echo "   - NEXTAUTH_URL=http://localhost:3000"
echo "   - BCRYPT_ROUNDS=12"
echo ""
echo "🚀 Para iniciar el servidor de desarrollo:"
echo "   npm run dev"
echo ""
echo "🔗 Luego visita: http://localhost:3000"
echo ""

