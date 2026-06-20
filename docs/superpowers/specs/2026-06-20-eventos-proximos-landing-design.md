# Eventos próximos (home) — exposición real

**Fecha:** 2026-06-20
**Estado:** Diseño aprobado — pendiente de implementación
**Autor:** Javier + Claude

## Contexto y objetivo

La sección "Eventos próximos" del home (`src/app/(main)/page.tsx`) es hoy
decorativa: usa un array hardcodeado (`EVENTS`) con datos ficticios (Festival
Latino Sydney, etc.). Las tarjetas no enlazan a ningún detalle.

Objetivo: exponer los **3 eventos más relevantes** (slots de pago + próximos por
fecha) que estén activos, conservando el look visual actual de tarjeta tipo
"poster". Mismo tratamiento que "Negocios destacados" y "Empleos recientes".
Ver [[landing-secciones-datos-reales]].

## Hallazgo clave: la infraestructura ya existe

- El endpoint `GET /api/events/upcoming` ya implementa la mecánica del home,
  idéntica a `/api/businesses/featured`: **slots de pago** por `Event.ranking`
  (1–N) + **relleno orgánico** con los eventos más próximos (`eventDate ASC`),
  filtrando `eventDate >= now` y `isHidden: false`. Incluye fallback robusto si
  la columna `ranking` aún no existe (ordena por fecha).
- Campos del `select`: `id, title, description, category, eventDate, location,
  imageUrl, ticketPrice, createdAt`.
- **No se requiere ningún cambio de backend, API ni migración.**

«Más relevantes» = `/api/events/upcoming?limit=3`: prioriza los eventos en slot
de pago y rellena con los de fecha más cercana.

### Mapeo a datos reales

El modelo `Event` tiene un único campo de ubicación (`location`), no place+city.
El mock mostraba "Darling Harbour · Sydney" (ficticio); se usa `event.location`.

| Elemento (mock) | Real |
|---|---|
| `title` | `event.title` |
| `day` / `month` | derivados de `event.eventDate` (date-fns, locale es; mes en mayúsculas) |
| `tag` (Música/Baile…) | `categoryLabel(EVENT_CATEGORIES, event.category)` |
| `place · city` | `event.location` (campo único) |
| `bg` (gradiente fijo) | **foto** `imageUrl` + overlay, o gradiente fallback |
| enlace | `/eventos/{event.id}` (detalle real) |

## Componentes

### 1. Home — `UpcomingEvents` (nuevo, cliente)

- **Nuevo** `src/components/home/UpcomingEvents.tsx`, client component aislado que
  hace `fetch('/api/events/upcoming?limit=3')`. Mismo esqueleto que
  `FeaturedBusinesses` / `RecentJobs`.
- Tipo local `UpcomingEvent` (`id, title, category, eventDate, location,
  imageUrl`), sin importar `@prisma/client` al bundle cliente.
- Estados:
  - **loading** → 3 skeletons con la forma de tarjeta (minHeight 280).
  - **error** → mensaje discreto de recarga.
  - **vacío** → tarjeta con CTA "Crea un evento" → `/perfil/eventos/crear`
    (mismo destino que el `EmptyState` de `EventList`).
  - **lista** → 3 tarjetas.
- Tarjeta tipo "poster" (conserva el lenguaje visual del mock):
  - Fondo: si hay `imageUrl`, `next/image` con `fill` + **overlay** oscuro
    (`linear-gradient` de abajo hacia arriba) para legibilidad del texto blanco;
    si no, **gradiente fallback** rotativo por índice (los 3 colores del mock:
    azul / terracota / verde).
  - Arriba: cuadro blanco con **día** (`dd`) + **mes** (`MMM` en mayúsculas) ·
    chip de **categoría** traducida.
  - Abajo: **título** (`line-clamp-2`) + **ubicación** (`MapPin` + `location`,
    `line-clamp-1`).
  - Toda la tarjeta enlaza a `/eventos/{id}`.

**Decisión de arquitectura:** cliente con fetch (no Server Component), igual que
las otras dos secciones. El home ya es `'use client'` completo. Las imágenes de
Cloudinary ya están habilitadas para `next/image` (las usa `EventCard`).

### 2. Home — `page.tsx` (editar)

- Eliminar el array hardcodeado `EVENTS`.
- Reemplazar el bloque `EVENTS.map(...)` (sección `#eventos`) por
  `<Reveal><UpcomingEvents /></Reveal>`.
- El encabezado ("Agenda cultural / Eventos próximos" + enlace "Ver agenda" →
  `/eventos`) se conserva intacto.

## Coordinación de ramas

Esta rama (`feat/eventos-proximos-home`) se apila sobre
`feat/empleos-recientes-home` (PR #4), porque ambas editan `page.tsx`. El PR de
eventos se basa en la rama de empleos para mostrar solo el diff de eventos y
evitar conflictos; al mergear #4, GitHub reapunta este PR a `main`.

## Fuera de alcance

- Cambios en `/api/events/upcoming`, Prisma o migraciones (no hacen falta).
- Panel admin de slots de eventos (la mecánica `ranking` ya existe en el modelo).
- Mostrar precio/ticket en la tarjeta del home: se mantiene el diseño "poster".

## Plan de verificación

1. **Componente:** con eventos próximos en la BD, la sección muestra hasta 3
   (no el mock), con fecha real, categoría traducida, ubicación y enlace a
   `/eventos/{id}`; verificación en navegador.
2. **Foto vs gradiente:** un evento con `imageUrl` muestra la foto con overlay;
   uno sin imagen, el gradiente fallback.
3. **Orden:** respeta slots de pago y luego `eventDate ASC`.
4. **Estados:** sin eventos próximos → estado vacío con CTA; error → mensaje.
5. `tsc --noEmit` y `eslint` sin errores nuevos.

## Archivos afectados

- `src/components/home/UpcomingEvents.tsx` — **nuevo**.
- `src/app/(main)/page.tsx` — quitar mock `EVENTS`, montar `<UpcomingEvents/>`.
