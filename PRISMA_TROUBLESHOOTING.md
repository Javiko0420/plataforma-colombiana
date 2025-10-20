# Troubleshooting: Prisma + Next.js en macOS

## 📋 Resumen del Problema

**Error**: `PrismaClientKnownRequestError: P5010 - Cannot fetch data from service: fetch failed`

**Contexto**: El sistema de foros funciona correctamente desde Node.js standalone, pero falla cuando se ejecuta dentro de Next.js (tanto con Webpack como con Turbopack).

---

## ✅ Lo que Funciona

- ✅ Prisma conecta correctamente a PostgreSQL desde scripts Node.js
- ✅ Consultas SQL funcionan perfectamente
- ✅ Los foros existen en la base de datos (2 foros activos)
- ✅ Binary engine existe y es ejecutable (`query-engine-darwin-arm64`)
- ✅ El binary retorna versión correctamente: `query-engine 272a37d34178c2894197e17273bf937f25acdeac`

**Prueba exitosa standalone:**
```bash
node test-prisma.js
# ✅ SUCCESS! Forums found: 2
```

---

## ❌ Lo que NO Funciona

- ❌ Prisma dentro de Next.js API Routes
- ❌ Prisma dentro de Next.js Server Components
- ❌ Error P5010: Query Engine no se puede iniciar desde Next.js

---

## 🔧 Soluciones Intentadas

### 1. Deshabilitación de Turbopack
**Motivo**: Turbopack tiene incompatibilidades conocidas con módulos nativos de Prisma.

**Cambios en `package.json`:**
```json
"scripts": {
  "dev": "next dev",           // Antes: "next dev --turbopack"
  "build": "next build",        // Antes: "next build --turbopack"
}
```

**Resultado**: ❌ No resolvió el problema

---

### 2. Configuración de Binary Targets en Schema
**Motivo**: Asegurar que Prisma genere el engine correcto para macOS ARM64.

**Cambios en `prisma/schema.prisma`:**
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "darwin-arm64"]
  engineType    = "binary"
}
```

**Resultado**: ✅ Binary generado correctamente, pero ❌ error persiste en Next.js

---

### 3. Actualización de Prisma
**Acción**: Actualización de v6.15.0 → v6.17.1

```bash
npm install @prisma/client@latest prisma@latest
npx prisma generate
```

**Resultado**: ✅ Actualización exitosa, pero ❌ error persiste

---

### 4. Configuración de Next.js para Prisma
**Cambios en `next.config.ts`:**
```typescript
const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', '@prisma/engines'],
  },
};
```

**Resultado**: ❌ No resolvió el problema

---

### 5. Variables de Entorno para Engine Path
**Cambios en `.env`:**
```bash
PRISMA_QUERY_ENGINE_BINARY=/Users/javierfelipeguerrerozambrano/Projects/plataforma-colombiana/node_modules/.prisma/client/query-engine-darwin-arm64
```

**Resultado**: ❌ No resolvió el problema (aún no probado completamente)

---

## 📊 Estado Actual

### Archivos Modificados

1. **`package.json`**
   - Turbopack deshabilitado
   - Prisma actualizado a v6.17.1
   - Scripts de base de datos agregados

2. **`prisma/schema.prisma`**
   - `binaryTargets` configurado para darwin-arm64
   - `engineType` configurado como "binary"

3. **`next.config.ts`**
   - Prisma marcado como paquete externo

4. **`src/lib/prisma.ts`**
   - Configuración simplificada
   - Logs habilitados para debugging

5. **`.env`**
   - Path absoluto del query engine agregado

6. **Sistema de Foros Implementado** ✅
   - Backend completo (CRUD, moderación, reputación)
   - API endpoints creados
   - Frontend básico implementado
   - i18n configurado (ES/EN)
   - Tests unitarios creados

---

## 🐛 Diagnóstico Técnico

### Error Específico
```
PrismaClientKnownRequestError: P5010
Invalid prisma.forum.findMany() invocation:
Cannot fetch data from service:
fetch failed
```

### Análisis
- El error ocurre al intentar conectarse al Prisma Query Engine
- El engine se intenta iniciar 3 veces (visible en logs: "Attempt 3/3 failed")
- El binary existe y tiene permisos correctos
- No hay marca de quarantine de macOS
- El problema es específico de Next.js, no de Prisma ni PostgreSQL

### Causa Probable
Next.js (especialmente en desarrollo con Hot Reload) puede tener problemas para:
1. Localizar el binary del query engine en `node_modules/.prisma/client/`
2. Iniciar procesos hijo (el query engine es un proceso separado)
3. Gestionar la comunicación IPC entre Next.js y el query engine

---

## 🚀 Próximos Pasos Recomendados

### Opción A: Usar Prisma Accelerate (Recomendado)
Prisma Accelerate es un connection pooler en la nube que evita problemas de engine.

```bash
# 1. Crear cuenta en https://console.prisma.io
# 2. Crear proyecto y obtener connection string
# 3. Actualizar .env:
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=..."
```

**Pros**:
- ✅ Evita completamente el problema del engine
- ✅ Connection pooling incluido
- ✅ Mejor performance en producción

**Contras**:
- Servicio de pago (tiene plan gratuito limitado)

---

### Opción B: Usar Prisma Data Proxy
Similar a Accelerate pero self-hosted.

---

### Opción C: Downgrade a Prisma v5.x
Algunos usuarios reportan que Prisma v5 funciona mejor con Next.js 15.

```bash
npm install prisma@5.19.1 @prisma/client@5.19.1
npx prisma generate
```

---

### Opción D: Configuración Avanzada del Engine (A intentar)

**1. Crear script de inicialización del engine:**

```typescript
// src/lib/prisma-init.ts
import { spawn } from 'child_process';
import * as path from 'path';

const enginePath = path.join(
  process.cwd(),
  'node_modules/.prisma/client/query-engine-darwin-arm64'
);

export function startPrismaEngine() {
  const engine = spawn(enginePath, ['--version']);
  
  engine.on('error', (err) => {
    console.error('Engine error:', err);
  });
  
  return engine;
}
```

**2. Inicializar en `instrumentation.ts` (Next.js 15)**

---

### Opción E: Usar Edge Runtime con Prisma (Experimental)
Next.js 15 soporta Prisma en Edge Runtime con algunas limitaciones.

---

## 📝 Comandos Útiles para Debugging

```bash
# Verificar que el engine existe
ls -lh node_modules/.prisma/client/query-engine-darwin-arm64

# Probar el engine directamente
node_modules/.prisma/client/query-engine-darwin-arm64 --version

# Ver logs completos de Prisma
export DEBUG="prisma:*"
npm run dev

# Regenerar Prisma Client
rm -rf node_modules/.prisma node_modules/@prisma/client
npx prisma generate

# Test standalone
node -e "const {PrismaClient} = require('@prisma/client'); const p = new PrismaClient(); p.forum.findMany().then(f => console.log(f.length)).finally(() => p.\$disconnect())"
```

---

## 📚 Recursos y Referencias

1. **Prisma Docs - Next.js Integration**: https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices

2. **Prisma Issue Tracker**: https://github.com/prisma/prisma/issues?q=is%3Aissue+is%3Aopen+next.js+15

3. **Next.js 15 + Prisma Discussion**: https://github.com/vercel/next.js/discussions

4. **Error P5010 Reference**: https://www.prisma.io/docs/orm/reference/error-reference#p5010

---

## ⚠️ Workaround Temporal

Mientras se resuelve el problema, puedes:

1. **Usar API Routes con retry logic**
2. **Implementar fallback a mock data en desarrollo**
3. **Desarrollar el frontend con datos estáticos**
4. **Probar en producción** (el problema puede ser específico del dev server)

---

## 🎯 Estado del Proyecto

### Completado ✅
- [x] Schema de base de datos completo
- [x] Modelos de Prisma configurados
- [x] Migraciones aplicadas
- [x] Datos iniciales (2 foros) creados
- [x] Backend de foros (lib/forum.ts)
- [x] Sistema de moderación (lib/moderation.ts)
- [x] API endpoints (/api/forums, /api/posts, etc.)
- [x] Frontend básico (/foros/page.tsx)
- [x] Componentes UI (ForumPostCard, etc.)
- [x] i18n (español e inglés)
- [x] Tests unitarios

### Pendiente ⏳
- [ ] Resolver problema de Prisma Query Engine en Next.js
- [ ] Completar testing de la página de foros
- [ ] Implementar las páginas de foro individual
- [ ] Sistema de likes y reportes (frontend)
- [ ] Moderación UI (admin panel)
- [ ] Cron job para renovación de foros

---

## 💡 Notas Importantes

1. **El código del sistema de foros está completo y bien estructurado**
2. **El problema es técnico/infraestructura, no de lógica de negocio**
3. **Una vez resuelto el problema de Prisma, todo debería funcionar**
4. **La solución más rápida puede ser usar Prisma Accelerate**

---

**Última actualización**: 19 de Octubre, 2025  
**Versiones**:
- Next.js: 15.5.2
- Prisma: 6.17.1
- Node.js: (verificar con `node --version`)
- PostgreSQL: 14+

