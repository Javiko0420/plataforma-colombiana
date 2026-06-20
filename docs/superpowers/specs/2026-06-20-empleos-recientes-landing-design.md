# Empleos recientes (home) — exposición real

**Fecha:** 2026-06-20
**Estado:** Diseño aprobado — pendiente de implementación
**Autor:** Javier + Claude

## Contexto y objetivo

La sección "Empleos recientes" del home (`src/app/(main)/page.tsx`) es hoy
decorativa: usa un array hardcodeado (`JOBS`, líneas 34-39) con datos ficticios
(Chef de cocina latina · Sabor Bogotá, etc.). Todas las filas enlazan a
`/empleos` genérico.

Objetivo: exponer las **4 ofertas de empleo activas más recientes** registradas
en la plataforma, conservando exactamente el layout visual actual (lista de filas
horizontales). Mismo tratamiento que recibió "Negocios destacados"
(ver `2026-06-19-negocios-destacados-design.md`).

## Hallazgo clave: la infraestructura ya existe

- El endpoint `GET /api/jobs` ya devuelve ofertas **activas**
  (`deletedAt: null`, `expiresAt > now`) ordenadas por `createdAt DESC`
  (más recientes primero), con paginación (`limit`, default 20, máx 50).
- Campos relevantes del `select` actual: `id, title, category, description,
  location, jobType, hourlyRate, isVerified, createdAt, expiresAt`.
- **No se requiere ningún cambio de backend, API ni migración de base de datos.**

### Desajuste de datos resuelto

El modelo `JobOffer` **no tiene campo de empresa** — las ofertas las publica un
`user`, no un negocio. El diseño hardcodeado mostraba "empresa · ciudad" e
iniciales derivadas de la empresa, ambos ficticios. Decisiones tomadas con el
usuario para mapear a datos reales:

| Elemento visual | Hardcoded (ficticio) | Real (decidido) |
|---|---|---|
| Avatar | Iniciales de empresa (SB) | **Iniciales del título** (ej: "Chef de cocina latina" → CC), gradiente rotativo por índice |
| Título | `role` | `job.title` |
| Subtítulo | empresa · ciudad | **`categoría · ubicación`** (ej: "Hostelería · Sydney") |
| Chip neutro | `type` | `jobType` **traducido a español** |
| Chip verde | `pay` | `$<hourlyRate>/h` |
| Enlace de fila | `/empleos` genérico | **`/empleos/{job.id}`** (detalle real) |

## Componentes

### 1. Home — `RecentJobs` (nuevo, cliente)

- **Nuevo** `src/components/home/RecentJobs.tsx`, client component aislado que
  hace `fetch('/api/jobs?limit=4')` en `useEffect`. Mismo esqueleto que
  `FeaturedBusinesses.tsx`.
- Tipo local `RecentJob` con solo los campos usados
  (`id, title, category, location, jobType, hourlyRate`), **sin importar
  `@prisma/client`** para no arrastrarlo al bundle cliente (mismo criterio que
  `FeaturedBusinesses` con `BusinessPlan`).
- Estados:
  - **loading** → 4 filas skeleton con el mismo alto/forma de las filas reales.
  - **error** → mensaje discreto de recarga (texto, sin romper layout).
  - **vacío** → tarjeta con CTA "Publica una oferta" → `/empleos/publicar`.
  - **lista** → filas reales.
- Cada fila conserva el lenguaje visual actual del home (avatar con gradiente,
  título, subtítulo, chip neutro de tipo, chip verde de tarifa, flecha) y enlaza
  a `/empleos/{job.id}`.

**Helpers internos del componente:**

- `JOB_TYPE_LABELS`: mapa de traducción
  `Full-time → Tiempo completo`, `Part-time → Medio tiempo`,
  `Freelance → Freelance`, `Contract → Contrato`. Fallback: el valor original si
  no está en el mapa.
- `initialsFromTitle(title)`: hasta 2 iniciales en mayúscula, ignorando
  stopwords cortas (`de, la, el, los, las, con, y, en, para, un, una`). Si solo
  queda una palabra significativa, usa sus 2 primeras letras.
- `formatRate(rate)`: `$32/h` sin decimales cuando es entero; con 2 decimales si
  no lo es. La categoría legible se obtiene con
  `categoryLabel(JOB_CATEGORIES, job.category)` (módulo TS puro, seguro en
  cliente).

### 2. Home — `page.tsx` (editar)

- Eliminar el array hardcodeado `JOBS` (líneas 34-39).
- Reemplazar el bloque `JOBS.map(...)` (dentro de la sección `#empleos`) por
  `<Reveal><RecentJobs /></Reveal>`.
- El encabezado de la sección ("Oportunidades / Empleos recientes" + enlace
  "Ver todos" → `/empleos`) **se conserva intacto**.

**Decisión de arquitectura:** cliente con fetch (no Server Component), igual que
`FeaturedBusinesses`. El home ya es `'use client'` completo (hero, buscador,
animaciones, theme); convertir solo esta sección a server sería un refactor
grande e innecesario. Trade-off: las ofertas no van en el HTML inicial
(below-the-fold; cada oferta ya tiene su página indexable `/empleos/[id]`).

## Fuera de alcance

- Cambios en el endpoint `/api/jobs`, en Prisma o en migraciones (no hacen falta).
- Panel admin para empleos (no aplica como en negocios; no hay slots de pago).
- Paginación / "ver más" en el home: se muestran exactamente 4 filas.

## Plan de verificación

1. **Componente:** con ofertas activas en la BD, la sección muestra las 4 más
   recientes (no el mock), con categoría legible, tipo traducido, tarifa y enlace
   a `/empleos/{id}`; verificación en navegador.
2. **Orden:** las filas respetan `createdAt DESC` (la más nueva arriba).
3. **Estados:** sin ofertas activas → estado vacío con CTA; error de red →
   mensaje discreto; durante carga → skeletons.
4. **Traducción:** `Full-time` se muestra como "Tiempo completo", etc.;
   `Freelance` se mantiene "Freelance".
5. `tsc --noEmit` y `eslint` sin errores nuevos.

## Archivos afectados

- `src/components/home/RecentJobs.tsx` — **nuevo**.
- `src/app/(main)/page.tsx` — quitar array `JOBS`, montar `<RecentJobs/>`.
