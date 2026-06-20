# Widget de Deportes (home) — Mundial 2026 en vivo / último de Colombia

**Fecha:** 2026-06-20
**Estado:** Diseño aprobado — pendiente de implementación
**Autor:** Javier + Claude

## Contexto y objetivo

Último widget decorativo de la sección "Información útil, en vivo" del home. El
mock mostraba un partido ficticio ("Copa Libertadores · BOC 2-1 RIV · 73'"). Se
reemplaza con datos reales del **Mundial 2026** vía API-SPORTS (API-Football),
reutilizando la infraestructura del módulo `/deportes/mundial-2026`.
Ver [[landing-secciones-datos-reales]].

## Comportamiento (acordado con el usuario)

1. **Si hay partidos del Mundial en vivo** → mostrar el primero, **tal cual lo
   devuelve la API** (sin filtro por país; no se prioriza a Latinoamérica).
2. **Si no hay partidos en vivo** → mostrar el **último partido finalizado de la
   selección Colombia** (team ID 8 en API-Football).

## Fuentes de datos

- Endpoint `/api/sports/worldcup/live` ya existe (fixtures `live=all` filtrados a
  la liga del Mundial). Endpoint `/api/sports/worldcup/fixtures?team=8` da los
  partidos de Colombia. Ambos usan `fetchApiFootball` + `worldcupCache`.
- `WorldCupFixture`: `{ id, date, timestamp, status{short,elapsed}, round,
  teams{home,away:{name,logo}}, goals }`. Los logos (`media.api-sports.io`) ya
  están permitidos en `next.config.ts`.

## Componentes

### 0. `COLOMBIA_TEAM_ID = 8` (constante)

Añadido a `src/lib/sports/worldcup/constants.ts`.

### 1. `GET /api/sports/worldcup/widget` (nuevo)

Encapsula la lógica en el server (una sola llamada para el widget), reutilizando
`fetchApiFootball`, `worldcupCache`, `mapFixture` y los schemas:

1. Consulta `fixtures?live=all`, filtra liga del Mundial. Si hay → devuelve el
   primero con `mode: 'live'` (TTL agresivo `LIVE_TTL_ACTIVE_S`).
2. Si no → consulta `fixtures?league&season&team=8`, filtra finalizados
   (`FT`/`AET`/`PEN`), ordena por `timestamp` desc, devuelve el primero con
   `mode: 'last'` (TTL `LIVE_TTL_IDLE_S`).

Respuesta: `{ mode: 'live' | 'last', fixture: WorldCupFixture | null, cachedAt }`.
Errores: mismo manejo que los otros endpoints worldcup (502/504/500).

### 2. `SportsWidget` (nuevo, cliente)

- **Nuevo** `src/components/home/SportsWidget.tsx`. `fetch` al endpoint del widget
  con **poll cada 30s** (como el módulo mundial). Tipo local mínimo (no arrastra
  los schemas zod).
- Tarjeta (conserva el look del mock, fondo `surface`):
  - Header: "Deportes" + badge **"EN VIVO"** (pulsante) si `mode==='live'`, o
    **"Final"** si `mode==='last'`.
  - Línea: `Mundial 2026 · {round}` con `round` traducido (`roundLabel`:
    Group Stage - N → "Fase de grupos · JN", Round of 16 → "Octavos", etc.).
  - Dos filas (home/away): **escudo** (`next/image`) + **nombre** + **goles**.
    El equipo ganador (más goles) se resalta en negrita/color fuerte.
  - Footer: minuto (`elapsed'`) si en vivo, o la **fecha** del partido si último.
  - Estados loading/error compactos. Enlaza a `/deportes/mundial-2026`.

### 3. `page.tsx` (editar)

Reemplazar el bloque mock de Deportes por `<SportsWidget />` (conservando su
`<Reveal delay={120}>`). Importar el componente.

## Fuera de alcance

- Prioridad por país de los partidos en vivo (se muestra el primero de la API).
- Lista/carrusel de varios partidos: el widget muestra uno.
- Estadísticas, alineaciones, H2H (eso vive en `/deportes/mundial-2026`).

## Plan de verificación

1. **Endpoint:** `/api/sports/worldcup/widget` devuelve `mode` + `fixture` con
   logos. Hoy (sin live) → `Uzbekistan 1-3 Colombia` (FT, Fase de grupos J1).
2. **Widget:** muestra escudos, nombres, marcador (Colombia resaltado), round
   traducido, badge "Final" y fecha; enlace a `/deportes/mundial-2026`.
3. **En vivo:** cuando haya partido del Mundial en vivo, badge "EN VIVO" + minuto.
4. `tsc --noEmit` y `eslint` sin errores ni warnings nuevos.

## Archivos afectados

- `src/lib/sports/worldcup/constants.ts` — `COLOMBIA_TEAM_ID`.
- `src/app/api/sports/worldcup/widget/route.ts` — **nuevo** endpoint.
- `src/components/home/SportsWidget.tsx` — **nuevo** componente.
- `src/app/(main)/page.tsx` — quitar mock de Deportes, montar `<SportsWidget/>`.
