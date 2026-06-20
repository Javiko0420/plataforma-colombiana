# Widgets "Información útil, en vivo" — Clima + Tasas + Radio (datos reales)

**Fecha:** 2026-06-20
**Estado:** Diseño aprobado — pendiente de implementación
**Autor:** Javier + Claude

## Contexto y objetivo

La sección "Información útil, en vivo" del home (`src/app/(main)/page.tsx`) tiene
4 widgets decorativos: Clima, Tasas, Deportes y Radio. Este spec cubre los **3
primeros widgets directos** (Clima, Tasas, Radio), cuyas fuentes de datos ya
existen. **Deportes va en un PR aparte** (`feat/widgets-deportes`) por su mayor
complejidad (lógica en vivo + prioridad Colombia → latinos). Ver
[[landing-secciones-datos-reales]].

## Fuentes de datos existentes

- **Clima:** `GET /api/weather?me=1` resuelve la ubicación por **IP**
  (`resolveGeo`, fallback a Bogotá) y devuelve `current` + `next24h`. El endpoint
  hoy **descarta el nombre de la ciudad**; se extiende para devolverlo.
- **Tasas:** `GET /api/tasas?base=AUD` devuelve `rates` reales. **No hay dato de
  variación histórica**, así que el widget muestra solo la tasa (sin "%").
- **Radio:** `AudioProvider` global (`src/app/layout.tsx`) expone `useAudio()` y
  una lista de emisoras curadas (`stations`). El botón play del widget reproduce
  de verdad el stream.

## Componentes

### 0. `GET /api/weather` (extender)

Único cambio: cuando se resuelve la ubicación (por `city=` o por `me=1`/geo),
incluir el nombre en la respuesta a nivel raíz:
`{ success, data: WeatherBundle, location: { city, country } | null }`.
`data` (el `WeatherBundle`) **no cambia**, así que `/clima` no se ve afectado.

### 1. `WeatherWidget` (nuevo, cliente)

- `fetch('/api/weather?me=1')`. Muestra: temperatura redondeada,
  `weatherTextEs`, ciudad detectada (`location.city`, fallback "Tu ubicación") y
  máx/mín derivados de `next24h` (`Math.max/min` de `temperatureC`).
- Estados: loading (`—` / "Cargando…"), error ("No disponible"), listo.
- Conserva el look del widget actual; enlaza a `/clima`.

### 2. `RatesWidget` (nuevo, cliente)

- `fetch('/api/tasas?base=AUD')`. Muestra las **4 monedas actuales** (COP, MXN,
  ARS, CLP) con su tasa real formateada (`Intl.NumberFormat('es-CO')`: 0
  decimales si ≥100, 2 si menor). **Sin columna de variación %.**
- Estados: loading (`…`), error (`—`), listo. Enlaza a `/tasas`.

### 3. `RadioWidget` (nuevo, cliente)

- Usa `useAudio()` + emisora destacada `stations[0]` (Tropicana Bogotá).
- Botón play **funcional**: `play(station)` / `pause()`. Dentro del `<Link>` a
  `/emisoras`, el botón hace `preventDefault` + `stopPropagation` para reproducir
  sin navegar.
- Ícono según estado: `Loader2` (cargando), `Pause` (sonando), `Play` (resto).
  Ecualizador animado solo al reproducir. Subtítulo: `nowPlaying` (canción) si
  suena, si no los tags de la emisora. Footer: país (+ "En vivo" si suena).

### 4. `page.tsx` (editar)

- Eliminar el array `FX` mock.
- Reemplazar los bloques Clima/Tasas/Radio por `<WeatherWidget/>`,
  `<RatesWidget/>`, `<RadioWidget/>` (conservando sus `<Reveal delay>`).
- **Dejar el bloque de Deportes intacto** (va en el PR B).
- Limpiar imports que queden sin uso (`MapPin`, `Play`).

## Coordinación de ramas

`feat/widgets-clima-tasas-radio` se apila sobre `feat/eventos-proximos-home`
(PR #5), que a su vez está sobre `feat/empleos-recientes-home` (PR #4). Todos
editan `page.tsx`; el apilado evita conflictos. Deportes (PR B) se apila sobre
esta rama.

## Fuera de alcance

- Widget de Deportes (PR B).
- Datos de variación de tasas (no existen en la fuente).
- Geolocalización por permiso del navegador en el home (se usa geo por IP, sin
  fricción); `/clima` ya ofrece "Usar mi ubicación" con permiso.

## Plan de verificación

1. **Clima:** el widget muestra temp, descripción, ciudad detectada y máx/mín
   reales; en local cae a Bogotá (sin geo de Vercel), en prod usa `request.geo`.
2. **Tasas:** muestra COP/MXN/ARS/CLP reales base AUD, sin %.
3. **Radio:** muestra la emisora real; el botón play inicia/pausa el stream vía
   el provider global sin navegar.
4. **Deportes:** permanece como mock (sin cambios).
5. `tsc --noEmit` y `eslint` sin errores ni warnings nuevos.

## Archivos afectados

- `src/app/api/weather/route.ts` — incluir `location` en la respuesta.
- `src/components/home/WeatherWidget.tsx` — **nuevo**.
- `src/components/home/RatesWidget.tsx` — **nuevo**.
- `src/components/home/RadioWidget.tsx` — **nuevo**.
- `src/app/(main)/page.tsx` — quitar mock `FX`, montar los 3 widgets.
