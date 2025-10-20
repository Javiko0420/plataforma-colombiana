# 🚀 Configuración Inicial de Foros

## ❌ Error Actual

```
[ERROR] Error fetching active forums {}
```

**Causa:** Las tablas de foros no existen en la base de datos todavía.

## ✅ Solución: 3 Pasos Simples

### Paso 1: Asegúrate de que la base de datos esté corriendo

```bash
# Si usas PostgreSQL local
brew services start postgresql
# O
sudo service postgresql start

# Si usas Docker
docker-compose up -d postgres
```

### Paso 2: Ejecutar las Migraciones de Prisma

Esto creará todas las tablas necesarias para los foros:

```bash
# Generar migración
npx prisma migrate dev --name add_forums

# Generar cliente de Prisma
npx prisma generate
```

**Esto creará las tablas:**
- ✅ `Forum` - Foros diarios
- ✅ `ForumPost` - Posts de usuarios
- ✅ `ForumComment` - Comentarios
- ✅ `Report` - Sistema de reportes
- ✅ Actualiza `User` con campos de foros (nickname, reputation, isBanned)

### Paso 3: Inicializar los Foros

Crea los primeros 2 foros diarios:

**Opción A - Script de Node:**
```bash
npx tsx scripts/init-forums.ts
```

**Opción B - Endpoint API (en desarrollo):**
```bash
curl http://localhost:3000/api/cron/renew-forums
```

**Opción C - Manualmente con Prisma Studio:**
```bash
npx prisma studio

# Luego crear manualmente 2 registros en la tabla Forum
```

## 🎯 Resultado Esperado

Después de ejecutar los pasos, deberías ver:

```bash
✅ Created Forum 1:
   ID: clxxx...
   Slug: daily-1-2025-10-19
   Active: true

✅ Created Forum 2:
   ID: clyyy...
   Slug: daily-2-2025-10-19
   Active: true

🎉 Forums initialized successfully!
```

## 🔍 Verificar que Funcionó

1. **Verificar en Prisma Studio:**
```bash
npx prisma studio
# Abre http://localhost:5555
# Ve a la tabla Forum y verifica que haya 2 registros activos
```

2. **Verificar en la app:**
```bash
npm run dev
# Abre http://localhost:3000/foros
# Deberías ver los 2 foros listados
```

3. **Verificar con API:**
```bash
curl http://localhost:3000/api/forums
# Debería retornar JSON con 2 foros
```

## 🐛 Si Sigues Teniendo Errores

### Error: "Can't reach database server"
```bash
# Verifica que la base de datos esté corriendo
psql -U tu_usuario -d plataforma_colombiana

# Si no existe, créala
createdb plataforma_colombiana
```

### Error: "Table doesn't exist"
```bash
# Resetear migraciones (⚠️ esto borra datos)
npx prisma migrate reset

# O forzar migración
npx prisma migrate deploy
```

### Error: "Prisma Client out of sync"
```bash
# Regenerar cliente
npx prisma generate
```

## 📋 Checklist de Verificación

- [ ] Base de datos PostgreSQL está corriendo
- [ ] Archivo `.env` tiene `DATABASE_URL` correcta
- [ ] Migraciones ejecutadas (`npx prisma migrate dev`)
- [ ] Cliente Prisma generado (`npx prisma generate`)
- [ ] Foros inicializados (script o API)
- [ ] Página `/foros` carga sin errores
- [ ] API `/api/forums` retorna datos

## 🔄 Renovación Diaria (Automática)

Una vez configurado, los foros se renovarán automáticamente cada día a las 00:00 hora de Australia gracias al cron job en `vercel.json`.

Para desarrollo local, puedes ejecutar manualmente:

```bash
curl http://localhost:3000/api/cron/renew-forums
```

## 📚 Más Información

- `FORUM_SCHEMA.md` - Documentación completa del schema
- `FORUM_IMPLEMENTATION.md` - Guía técnica detallada
- `FORUM_QUICKSTART.md` - Guía rápida de uso

---

**¿Necesitas ayuda?** 
Si sigues teniendo problemas, revisa:
1. Logs del servidor (`npm run dev`)
2. Logs de Prisma
3. Estado de la base de datos con `npx prisma studio`

