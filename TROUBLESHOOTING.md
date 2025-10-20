# 🔧 Troubleshooting - Error "Error fetching active forums"

## ❌ Síntoma

Al abrir `/foros`, aparece el error:
```
[ERROR] Error fetching active forums {}
```

## ✅ Causa Identificada

El servidor de Next.js tiene **módulos en caché** y no recarga el Prisma Client después de ejecutar migraciones.

**Verificado:**
- ✅ Base de datos está funcionando
- ✅ Los foros existen (2 foros activos)
- ✅ La query de Prisma funciona correctamente
- ❌ Next.js está usando Prisma Client viejo en caché

## 🔧 Solución

### Paso 1: Detener el servidor
En la terminal donde corre `npm run dev`, presiona:
```bash
Ctrl + C
```

### Paso 2: Limpiar caché de Next.js
```bash
rm -rf .next
```

### Paso 3: Regenerar Prisma Client (por seguridad)
```bash
npx prisma generate
```

### Paso 4: Reiniciar el servidor
```bash
npm run dev
```

### Paso 5: Hard refresh en el navegador
- Chrome/Edge: `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac)
- Firefox: `Ctrl + F5` (Windows) o `Cmd + Shift + R` (Mac)

## 🎯 Resultado Esperado

Después de estos pasos, al abrir `http://localhost:3000/foros` deberías ver:

```
✅ Foros Diarios
   📋 2 foros activos listados
   🎨 UI moderna y responsive
```

## 🔍 Verificación Adicional

Si el problema persiste, verifica:

### 1. ¿El servidor se reinició correctamente?
Busca en la consola:
```
✓ Compiled in XXXms
✓ Ready in XXXs
```

### 2. ¿Los foros existen en la base de datos?
```bash
npm run db:studio
# Abre http://localhost:5555
# Ve a la tabla Forum y verifica que hay 2 registros con isActive=true
```

### 3. ¿El Prisma Client está actualizado?
```bash
node -e "const {PrismaClient} = require('@prisma/client'); const p = new PrismaClient(); p.forum.findMany().then(f => console.log('Forums:', f.length)).catch(e => console.error(e)).finally(() => p.$disconnect())"
```

Debería mostrar: `Forums: 2`

## 🐛 Errores Comunes

### Error: "Table Forum does not exist"
**Causa:** La migración no se aplicó correctamente.

**Solución:**
```bash
npx prisma migrate deploy
npx prisma generate
```

### Error: "PrismaClient is unable to run in the browser"
**Causa:** Estás importando Prisma Client en un componente cliente.

**Solución:** Usa Prisma solo en:
- Server Components (sin 'use client')
- API Routes
- Server Actions

### Error: "Error: No Prisma schema found"
**Causa:** El archivo `prisma/schema.prisma` no existe o está corrupto.

**Solución:**
```bash
# Verificar que el archivo existe
ls -la prisma/schema.prisma

# Si no existe, recuperar desde git
git checkout prisma/schema.prisma
```

## 📋 Checklist de Verificación

Antes de reportar un bug, verifica:

- [ ] Servidor completamente detenido (no hay procesos Node corriendo)
- [ ] Caché de Next.js limpiado (`rm -rf .next`)
- [ ] Prisma Client regenerado (`npx prisma generate`)
- [ ] Servidor reiniciado (`npm run dev`)
- [ ] Navegador con hard refresh
- [ ] Foros existen en base de datos (Prisma Studio)
- [ ] Variables de entorno correctas (`.env` tiene `DATABASE_URL`)

## 🆘 Si Nada Funciona

### Opción 1: Reinicio Completo
```bash
# 1. Detener todo
pkill -f "next dev"

# 2. Limpiar todo
rm -rf .next
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma

# 3. Reinstalar Prisma
npm install @prisma/client

# 4. Regenerar
npx prisma generate

# 5. Reiniciar
npm run dev
```

### Opción 2: Verificar Logs Detallados

Edita `src/lib/forum.ts` línea 95:
```typescript
} catch (error) {
  console.error('FULL ERROR:', error); // ← Agregar esta línea
  logger.error('Error fetching active forums', { error });
  throw new Error('Failed to fetch active forums');
}
```

Reinicia el servidor y busca "FULL ERROR" en los logs.

### Opción 3: Reset Total

Si todo lo demás falla:
```bash
# ⚠️ Esto borra TODOS los datos
npm run db:reset
npm run forums:init
npm run dev
```

## 📚 Documentos Relacionados

- `FORUM_SETUP.md` - Configuración inicial
- `SETUP_COMPLETE.md` - Estado de implementación
- `FORUM_QUICKSTART.md` - Guía rápida

---

**Última actualización:** 19 de octubre de 2025
**Problema identificado:** Caché de Next.js con Prisma Client desactualizado
**Solución:** Limpiar `.next` y reiniciar servidor

