# Bracket de llaves eliminatorias — Mundial 2026

**Fecha:** 2026-07-04
**Estado:** Aprobado (pendiente de implementación)
**Ámbito:** `/deportes/mundial-2026` — reemplazar la sección de grupos (posiciones) por un bracket de eliminatorias.

## Objetivo

Sustituir la sección de fase de grupos (`WorldcupGroupStandingsGrid`) por unas
**llaves eliminatorias** tipo bracket clásico con conectores, que abarquen desde
**dieciseisavos (Round of 32)** hasta la **Final**, incluyendo el partido por el
**tercer puesto**.

## Contexto

- La página `page.tsx` renderiza secciones: En vivo, Calendario, Posiciones, Equipos.
- El calendario (`WorldcupFixturesSection`) ya fue ajustado para mostrar solo
  desde octavos en adelante, usando un *matcher por patrón* sobre `fx.round`.
- Los fixtures de `getWorldcupFixtures()` ya contienen todos los datos necesarios
  para el bracket — no hacen falta endpoints nuevos.

## Fuente de datos

Reutilizar `getWorldcupFixtures()`. Cada `WorldCupFixture` aporta:

- `round: string` — p. ej. `"Round of 32"`, `"Round of 16"`, `"Quarter-finals"`,
  `"Semi-finals"`, `"3rd Place Final"`, `"Final"`.
- `teams.home` / `teams.away`: `{ id, name, logo, winner: boolean | null }`.
- `goals.home` / `goals.away`: `number | null`.
- `timestamp`, `id`, `status`.

No hay campo de penales; el avance se determina con `teams.*.winner`.

## Rondas y orden

Extender el enfoque de *matcher por patrón* (el mismo del calendario) para cubrir
las rondas eliminatorias completas, en orden canónico:

| Orden | Patrón (lowercase, `includes`) | Label ES | Label EN |
|------:|--------------------------------|----------|----------|
| 1 | `round of 32` | Dieciseisavos de final | Round of 32 |
| 2 | `round of 16` | Octavos de final | Round of 16 |
| 3 | `quarter` | Cuartos de final | Quarter-finals |
| 4 | `semi` | Semifinales | Semi-finals |
| 5 | `3rd place` / `third place` | Tercer puesto | Third place |
| 6 | `final` (fallback) | Final | Final |

El orden de evaluación importa: `quarter-finals`, `semi-finals` y
`3rd place final` contienen la subcadena `final`, así que sus patrones se
evalúan **antes** del fallback `final`. El tercer puesto (orden 5) se separa del
árbol principal para renderizarse como tarjeta suelta.

## Estructura del bracket (pairing)

La API entrega partidos por ronda pero **no** un enlace explícito padre→hijo entre
cruces, y los devuelve en orden **cronológico**, no en orden de llave. Emparejar
por posición (`2k, 2k+1 → k`) conecta cruces equivocados (p. ej. junta al ganador
del partido 0 con el del 1 cuando en realidad el cruce siguiente enfrenta al
ganador del 0 con el del 3).

La estructura real se **deriva siguiendo los equipos** (`linkAndOrderRounds`):

1. Ordenar cada ronda por `timestamp` (desempate por `id`) como semilla.
2. Recorrer de la ronda más alta hacia abajo. Para cada partido padre `P`, sus
   dos hijos son los partidos de la ronda anterior cuyo **ganador**
   (`teams.*.winner === true`) es `P.home` (hijo superior) y `P.away` (hijo
   inferior). Reordenar la ronda hija colocando esos hijos adyacentes en ese
   orden.
3. Los partidos hijos que no enganchan con ningún padre (rondas futuras con
   equipos aún por definir) conservan su orden cronológico al final.

Tras el reordenamiento, el emparejamiento posicional `(2k, 2k+1) → k` que usan
los conectores ya coincide con la estructura real. Verificado en `:3000` con
Playwright: cada cruce de octavos junta exactamente a los ganadores de sus dos
dieciseisavos (`allOk: true`).

Degradación: si el número de partidos de una ronda no es la mitad exacta de la
anterior (datos incompletos), se renderizan las columnas igualmente sin romper el
layout (los conectores se dibujan por CSS de forma independiente por columna).

## Render (Server Component, sin JS de cliente)

Componente nuevo `components/WorldcupBracket.tsx`, `async`, mismo lenguaje visual
`--lh-*` que sus hermanos. Sin `"use client"`.

- **Contenedor scrollable:** `overflow-x: auto`. En un bracket de 32 el scroll
  horizontal en móvil es inevitable y se asume.
- **Columnas por ronda:** fila flex; cada columna es flex-column con espaciado
  uniforme (`justify-content: space-around`) para que cada cruce quede
  verticalmente centrado entre sus dos "padres".
- **Conectores:** pseudo-elementos CSS (bordes formando codos), técnica clásica.
  Sin SVG ni librerías.
- **Tarjeta de partido (`BracketMatch`):** dos filas equipo (logo + nombre +
  goles). Ganador resaltado con `teams.*.winner` (negrita + `--lh-green` +
  indicador). Sin marcador si `goals` es `null` (aún no jugado).
- **Tercer puesto:** tarjeta suelta etiquetada, ubicada junto a la columna Final.
- **Cruces por definir:** se pinta el `name` que devuelva la API tal cual.

## Reemplazo de la sección

En `page.tsx`:

- Sustituir el `<section>` de posiciones (`WorldcupGroupStandingsGrid`) por el
  nuevo `WorldcupBracket`.
- Título de sección: nueva clave i18n `sports.worldcup.bracket`
  (ES: "Llaves eliminatorias", EN: "Bracket").
- Estado vacío/error: patrón i18n de las demás secciones. Reusar o añadir
  `sports.worldcup.empty.bracket` (ES: "Aún no hay llaves disponibles").

**No se toca** el service `getWorldcupStandings` ni el endpoint
`/api/sports/worldcup/standings` (los consume la app mobile). Los componentes
`WorldcupGroupStandingsGrid.tsx` y `GroupStandingsTable.tsx` se eliminan **solo
si** no los importa nadie más (verificar con grep antes de borrar).

## Estados

- **Error de fetch** → mensaje i18n vacío.
- **Sin fixtures de eliminatorias** → mensaje i18n vacío.
- **Fixtures parciales** (solo algunas rondas) → renderiza las que existan.

## Testing / verificación

- Extraer la lógica de construcción del bracket a funciones **puras**
  (matcher/orden y pairing) para poder testearlas de forma aislada, en línea con
  el suite existente (Vitest) del módulo worldcup.
- `tsc --noEmit` sin errores.
- Revisión visual en `:3000` (dev server ya activo; no levantar otro).

## Fuera de alcance (YAGNI)

- Penales / desempates detallados (no hay dato en la API de fixtures).
- Enlaces a detalle de partido (el bracket es de solo lectura).
