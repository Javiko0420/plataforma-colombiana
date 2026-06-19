# Negocios destacados (home) — exposición real + preparación comercial

**Fecha:** 2026-06-19
**Estado:** Diseño aprobado (pendiente review del spec)
**Autor:** Javier + Claude

## Contexto y objetivo

La sección "Negocios destacados" del home (`src/app/(main)/page.tsx`) es hoy
decorativa: usa un array hardcodeado (`BUSINESSES`) con datos ficticios
(Sabor Bogotá, etc.) y rating mock.

Objetivo:
1. **Ahora:** exponer hasta los 8 primeros negocios reales registrados en la
   plataforma (actualmente hay 6 activos).
2. **Futuro próximo:** dejar el código listo para comercializar esta sección —
   negocios que paguen aparecen en un slot fijo y con distintivo visual. La
   pasarela de pagos se implementará al iniciar la comercialización (fuera de
   alcance aquí).

## Hallazgo clave: la infraestructura ya existe

- El endpoint `GET /api/businesses/featured` ya implementa la mecánica de
  carrusel del home: **slots pagados** por `Business.ranking` (1–N) y **relleno
  orgánico** con los negocios activos más antiguos (`createdAt ASC`).
- El modelo `Business` ya tiene `ranking Int @default(0)` y
  `plan BusinessPlan @default(FREE)` (enum `FREE | BASIC | PREMIUM | SPONSOR`).
- **No se requiere migración de base de datos.**

## Modelo de "destacado comercial"

Dos campos existentes con roles separados:

| Campo     | Rol                                   | Valores |
|-----------|---------------------------------------|---------|
| `ranking` | Posición/slot en el carrusel          | `0` = orgánico (relleno) · `1–8` = slot fijo de pago |
| `plan`    | Tipo comercial → dispara badge        | `FREE`/`BASIC` = normal · `PREMIUM`/`SPONSOR` = badge "Destacado" |

**Decisión (opción A):** el badge "Destacado" se muestra cuando
`plan ∈ {PREMIUM, SPONSOR}`. El orden lo da `ranking`. Son ortogonales: un
negocio de pago típicamente tendrá ambos (slot + plan), pero el badge depende
solo del `plan`.

Estado inicial: los 6 negocios tienen `ranking=0` y `plan=FREE` → se muestran
como orgánicos, sin badge.

## Componentes

### 1. Endpoint `/api/businesses/featured` (extender)

Único cambio: ampliar el `select` para devolver lo que faltan las tarjetas:
- `plan` → para el badge "Destacado".
- **rating real**: incluir `reviews: { select: { rating: true } }` y calcular
  promedio (mismo patrón que `/negocio/[slug]/page.tsx`:
  `reviews.reduce((a, r) => a + r.rating, 0) / reviews.length`). Devolver
  `rating: number | null` y `reviewCount: number`.

La lógica de slots/relleno **no se toca**. Para ≤8 negocios, promediar reviews
en JS es aceptable (no se introduce groupBy).

Contrato de respuesta (por negocio), además de los campos actuales:
`plan: 'FREE'|'BASIC'|'PREMIUM'|'SPONSOR'`, `rating: number | null`,
`reviewCount: number`.

### 2. Home — `FeaturedBusinesses` (nuevo, cliente)

- **Nuevo** `src/components/home/FeaturedBusinesses.tsx`, client component aislado
  que hace `fetch('/api/businesses/featured?limit=8')`.
- Estados: **loading** (skeleton de tarjetas), **vacío** (mensaje + CTA registrar
  negocio), **error** (mensaje discreto + reintento silencioso).
- Tarjeta (reusa el lenguaje visual actual del home):
  - Foto real (`images[0]`) o placeholder cuando no haya imagen.
  - Categoría legible vía `categoryLabel(BUSINESS_CATEGORIES, category)`.
  - Nombre + ciudad/estado.
  - **Rating** con estrella solo si `rating !== null`.
  - **Badge "Destacado"** si `plan ∈ {PREMIUM, SPONSOR}`.
  - Toda la tarjeta enlaza a `/negocio/[slug]` (hoy el mock no enlaza).
- En `page.tsx`: eliminar el array `BUSINESSES` y los helpers `PH` asociados a la
  sección; montar `<FeaturedBusinesses />` dentro de la sección existente
  (conservando encabezado "Negocios destacados" y enlace "Ver directorio").

**Decisión de arquitectura:** cliente con fetch (no Server Component). El home ya
es `'use client'` por completo (hero, buscador, animaciones, theme); convertirlo
a server por esta sección sería un refactor grande y de riesgo. El endpoint fue
diseñado para este uso. Trade-off: los negocios no van en el HTML inicial
(below-the-fold; cada negocio ya tiene su página indexable). Migrable a server en
el futuro si se requiere SEO en la sección.

### 3. Panel admin `/admin/negocios` (gestión de clientes de pago)

Se construye sobre el admin ya existente (`/admin`).

- **Nueva server action** `setBusinessFeatured(businessId, { ranking, plan })` en
  `src/app/(main)/admin/negocios/actions.ts`, siguiendo el patrón existente:
  - Autorización: solo `session.user.role === 'ADMIN'`.
  - `prisma.business.update` de `ranking` y/o `plan`.
  - Registro en `auditLog` (acción `BUSINESS_FEATURE_UPDATE` con old/new values).
  - `revalidatePath('/admin/negocios')`.
  - Validación servidor: `ranking` entero 0–8; `plan` dentro del enum.
- **UI** en `src/components/admin/business-table.tsx`: por fila, un control de
  **Slot** (`<select>` 0–8, donde 0 = "Sin slot") y un control de **Plan**
  (`<select>` FREE/BASIC/PREMIUM/SPONSOR). Añadir `ranking` al `select` de
  `admin/negocios/page.tsx` y al prop de la tabla.
- Nota operativa: dos negocios podrían quedar con el mismo `ranking`; el endpoint
  ya resuelve colisiones tomando el primero por slot. No se bloquea en UI, pero el
  admin verá el slot asignado en cada fila para evitar duplicados.

## Fuera de alcance

- Pasarela de pagos / facturación / suscripciones (fase de comercialización).
- Migraciones de esquema (no hacen falta).
- Carrusel con autoplay/animación: se mantiene el grid actual.

## Plan de verificación

1. **Endpoint:** `curl /api/businesses/featured?limit=8` devuelve `plan`,
   `rating`, `reviewCount` y respeta orden por `ranking`.
2. **Home:** la sección muestra los negocios reales (no el mock), con foto,
   categoría legible y enlace a `/negocio/[slug]`; verificación en navegador.
3. **Badge "Destacado":** asignar `plan=SPONSOR` a un negocio vía admin → aparece
   el badge y sube al slot asignado.
4. **Rating:** un negocio con reviews muestra el promedio; sin reviews, no muestra
   estrella.
5. **Admin:** cambiar slot/plan persiste, queda en `auditLog`, y se refleja en el
   home. Acción rechazada para usuarios no-ADMIN.
6. `tsc --noEmit` y `eslint` sin errores nuevos.

## Archivos afectados

- `src/app/api/businesses/featured/route.ts` — extender select + rating.
- `src/app/(main)/page.tsx` — quitar mock, montar `<FeaturedBusinesses/>`.
- `src/components/home/FeaturedBusinesses.tsx` — **nuevo**.
- `src/app/(main)/admin/negocios/actions.ts` — nueva action `setBusinessFeatured`.
- `src/app/(main)/admin/negocios/page.tsx` — incluir `ranking` en el select.
- `src/components/admin/business-table.tsx` — controles Slot/Plan.
