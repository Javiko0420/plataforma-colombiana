# Guía de Desarrollo - Plataforma Colombiana

## 📋 Índice
1. [Configuración del Entorno](#configuración-del-entorno)
2. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
3. [Estándares de Código](#estándares-de-código)
4. [Flujo de Desarrollo](#flujo-de-desarrollo)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

## 🚀 Configuración del Entorno

### Prerrequisitos
- Node.js 18+ 
- npm 9+
- PostgreSQL 14+
- Git

### Instalación Inicial
```bash
# Clonar el repositorio
git clone <repository-url>
cd plataforma-colombiana

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env
# Editar .env con tus configuraciones

# Configurar base de datos
npx prisma generate
npx prisma db push

# Iniciar servidor de desarrollo
npm run dev
```

### Variables de Entorno Requeridas
```bash
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/plataforma_colombiana"

# Autenticación
NEXTAUTH_SECRET="tu-clave-secreta-minimo-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"

# Configuración de seguridad
BCRYPT_ROUNDS="12"
JWT_SECRET="otra-clave-secreta"
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW="900000"

# APIs externas (opcional para desarrollo)
WEATHER_API_KEY=""
EXCHANGE_RATE_API_KEY=""
YOUTUBE_API_KEY=""
SPORTS_API_KEY=""
```

## 🏗️ Arquitectura del Proyecto

### Estructura de Directorios
```
plataforma-colombiana/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── api/               # API Routes
│   │   ├── auth/              # Páginas de autenticación
│   │   ├── directorio/        # Páginas del directorio
│   │   └── globals.css        # Estilos globales
│   ├── components/            # Componentes reutilizables
│   │   ├── ui/               # Componentes de UI básicos
│   │   ├── layout/           # Componentes de layout
│   │   └── providers/        # Providers de contexto
│   ├── lib/                  # Utilidades y configuración
│   │   ├── auth.ts           # Configuración de NextAuth
│   │   ├── prisma.ts         # Cliente de Prisma
│   │   ├── validations.ts    # Esquemas de validación
│   │   ├── security.ts       # Utilidades de seguridad
│   │   ├── logger.ts         # Sistema de logging
│   │   └── error-handler.ts  # Manejo de errores
│   └── types/                # Definiciones de TypeScript
├── prisma/
│   └── schema.prisma         # Esquema de base de datos
├── public/                   # Archivos estáticos
├── logs/                     # Archivos de log (creado automáticamente)
└── docs/                     # Documentación adicional
```

### Stack Tecnológico
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Base de datos**: PostgreSQL con Prisma ORM
- **Autenticación**: NextAuth.js
- **Validación**: Zod
- **Logging**: Winston
- **Testing**: Jest, React Testing Library (a implementar)

## 📝 Estándares de Código

### Convenciones de Nomenclatura
```typescript
// ✅ Componentes: PascalCase
export function BusinessCard() {}

// ✅ Funciones: camelCase
export function validateBusinessData() {}

// ✅ Constantes: UPPER_SNAKE_CASE
export const MAX_FILE_SIZE = 5242880

// ✅ Tipos/Interfaces: PascalCase
interface BusinessData {
  name: string
  category: Category
}

// ✅ Archivos: kebab-case
// business-card.tsx
// error-handler.ts
```

### Estructura de Componentes
```typescript
'use client' // Solo si necesita estado del cliente

import { useState } from 'react'
import { ComponentProps } from './types'

/**
 * Descripción del componente
 * @param props - Propiedades del componente
 */
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 1. Hooks de estado
  const [state, setState] = useState()

  // 2. Hooks de efecto
  useEffect(() => {
    // lógica de efecto
  }, [])

  // 3. Funciones del componente
  const handleAction = () => {
    // lógica de manejo
  }

  // 4. Render
  return (
    <div className="component-styles">
      {/* JSX */}
    </div>
  )
}
```

### Estructura de API Routes
```typescript
import { NextRequest } from 'next/server'
import { ErrorHandler, createSuccessResponse } from '@/lib/error-handler'
import { businessSchema } from '@/lib/validations'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * API Route para gestionar emprendimientos
 */
export const GET = ErrorHandler.asyncHandler(async (request: NextRequest) => {
  // 1. Autenticación (si es necesaria)
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new AuthenticationError()
  }

  // 2. Validación de entrada
  const searchParams = new URL(request.url).searchParams
  const validatedParams = searchSchema.parse(
    Object.fromEntries(searchParams.entries())
  )

  // 3. Lógica de negocio
  const businesses = await prisma.business.findMany({
    where: {
      category: validatedParams.category,
      active: true
    }
  })

  // 4. Respuesta exitosa
  return createSuccessResponse(businesses)
})

export const POST = ErrorHandler.asyncHandler(async (request: NextRequest) => {
  // Validar datos de entrada
  const data = await ErrorHandler.validateRequest(request, businessSchema)
  
  // Lógica de creación
  const business = await prisma.business.create({ data })
  
  return createSuccessResponse(business, 'Emprendimiento creado exitosamente', 201)
})
```

### Reglas de ESLint
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "prefer-const": "error",
    "no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

## 🔄 Flujo de Desarrollo

### Git Workflow
```bash
# 1. Crear rama para nueva funcionalidad
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar y hacer commits frecuentes
git add .
git commit -m "feat: agregar validación de emprendimientos"

# 3. Mantener rama actualizada
git fetch origin
git rebase origin/main

# 4. Crear Pull Request
git push origin feature/nueva-funcionalidad
```

### Convenciones de Commits
```bash
# Tipos de commit
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: cambios de formato (no afectan lógica)
refactor: refactorización de código
test: agregar o modificar tests
chore: tareas de mantenimiento

# Ejemplos
git commit -m "feat: agregar sistema de notificaciones"
git commit -m "fix: corregir validación de email"
git commit -m "docs: actualizar README con instrucciones"
```

### Code Review Checklist
- [ ] ¿El código sigue las convenciones establecidas?
- [ ] ¿Hay validación de entrada adecuada?
- [ ] ¿Se manejan los errores correctamente?
- [ ] ¿Hay logging de eventos importantes?
- [ ] ¿Los componentes son reutilizables?
- [ ] ¿La documentación está actualizada?
- [ ] ¿Se agregaron tests si es necesario?

## 🧪 Testing

### Configuración de Testing (a implementar)
```bash
# Instalar dependencias de testing
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Ejecutar tests
npm run test

# Ejecutar tests con coverage
npm run test:coverage
```

### Ejemplo de Test de Componente
```typescript
import { render, screen } from '@testing-library/react'
import { BusinessCard } from '@/components/business-card'

describe('BusinessCard', () => {
  const mockBusiness = {
    id: '1',
    name: 'Test Business',
    description: 'Test description',
    category: 'TECNOLOGIA'
  }

  it('renders business information correctly', () => {
    render(<BusinessCard business={mockBusiness} />)
    
    expect(screen.getByText('Test Business')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })
})
```

### Ejemplo de Test de API
```typescript
import { POST } from '@/app/api/business/route'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  business: {
    create: jest.fn()
  }
}))

describe('/api/business', () => {
  it('creates business successfully', async () => {
    const mockBusiness = { name: 'Test', category: 'TECNOLOGIA' }
    
    ;(prisma.business.create as jest.Mock).mockResolvedValue(mockBusiness)
    
    const request = new Request('http://localhost:3000/api/business', {
      method: 'POST',
      body: JSON.stringify(mockBusiness)
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
  })
})
```

## 🚀 Deployment

### Preparación para Producción
```bash
# 1. Verificar que no hay errores
npm run build
npm run lint

# 2. Ejecutar tests
npm run test

# 3. Verificar variables de entorno
# Asegurar que todas las variables están configuradas

# 4. Generar cliente de Prisma para producción
npx prisma generate --no-engine

# 5. Ejecutar migraciones
npx prisma migrate deploy
```

### Configuración de Vercel
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "NEXTAUTH_URL": "@nextauth-url"
  }
}
```

### Variables de Entorno para Producción
```bash
# Seguridad
NEXTAUTH_SECRET="clave-super-secreta-produccion-64-caracteres-minimo"
JWT_SECRET="otra-clave-secreta-produccion"

# Base de datos
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# Configuración
NODE_ENV="production"
ALLOWED_ORIGINS="https://tudominio.com"
```

## 🔧 Troubleshooting

### Problemas Comunes

#### Error de Base de Datos
```bash
# Problema: Error de conexión a la base de datos
# Solución: Verificar variables de entorno y conexión
npx prisma db pull
npx prisma generate
```

#### Error de Autenticación
```bash
# Problema: NextAuth no funciona
# Solución: Verificar NEXTAUTH_SECRET y NEXTAUTH_URL
echo $NEXTAUTH_SECRET
echo $NEXTAUTH_URL
```

#### Error de Build
```bash
# Problema: Error en npm run build
# Solución: Limpiar cache y reinstalar
rm -rf .next node_modules
npm install
npm run build
```

#### Error de TypeScript
```bash
# Problema: Errores de tipos
# Solución: Regenerar tipos de Prisma
npx prisma generate
npm run type-check
```

### Logs de Debug
```bash
# Ver logs de la aplicación
tail -f logs/combined.log

# Ver logs de errores
tail -f logs/error.log

# Ver logs de seguridad
grep "SECURITY_VIOLATION" logs/combined.log
```

### Comandos Útiles
```bash
# Verificar estado de la aplicación
npm run health-check

# Limpiar cache
npm run clean

# Verificar dependencias
npm audit

# Actualizar dependencias
npm update

# Verificar formato de código
npm run format:check

# Formatear código
npm run format
```

## 📚 Recursos Adicionales

### Documentación
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Herramientas de Desarrollo
- **VS Code Extensions**: 
  - Prisma
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
- **Chrome Extensions**:
  - React Developer Tools
  - Redux DevTools

---

## 📞 Soporte

Para preguntas sobre desarrollo:
- **Email**: dev@plataformacolombia.co
- **Slack**: #desarrollo
- **Documentación**: /docs

**Última actualización**: Agosto 2024
**Versión**: 1.0.0
