/**
 * Normalización de categorías (negocios, eventos, empleos)
 * --------------------------------------------------------
 * Las columnas `category` de Business, Event y JobOffer son String libre.
 * Históricamente se guardaron valores con tildes / capitalización mixta
 * ("Construcción", "Concierto", "Tecnología") que NO coinciden con las claves
 * canónicas definidas en `src/lib/constants/categories.ts` (CONSTRUCCION,
 * CONCIERTO, TECNOLOGIA...), que ahora exige la validación de la app.
 *
 * Este script mapea los valores existentes a la clave canónica de cada
 * vertical (normaliza: quita tildes + MAYÚSCULAS y compara contra la lista).
 *
 * Uso:
 *   npm run db:normalize-categories            # dry-run (no escribe)
 *   npm run db:normalize-categories -- --apply # aplica los cambios
 *
 * El dry-run muestra el plan. Los valores que no mapean con seguridad NO se
 * tocan: se listan para revisión manual.
 */

import { PrismaClient } from '@prisma/client'
import {
  businessCategoryValues,
  eventCategoryValues,
  jobCategoryValues,
} from '../src/lib/constants/categories'

const prisma = new PrismaClient()

/** Normaliza un valor: quita acentos, recorta espacios y pasa a MAYÚSCULAS. */
function normalize(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toUpperCase()
}

type TableConfig = {
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any
  validValues: string[]
}

const TABLES: TableConfig[] = [
  { name: 'Business', model: prisma.business, validValues: businessCategoryValues },
  { name: 'Event', model: prisma.event, validValues: eventCategoryValues },
  { name: 'JobOffer', model: prisma.jobOffer, validValues: jobCategoryValues },
]

/** Devuelve la clave canónica para un valor, o null si no mapea con seguridad. */
function resolveTarget(current: string, validValues: string[]): string | null {
  const normalized = normalize(current)
  return validValues.includes(normalized) ? normalized : null
}

async function main() {
  const apply = process.argv.includes('--apply')

  console.log('🏷️  Normalización de categorías (negocios, eventos, empleos)')
  console.log(
    apply
      ? '⚠️  MODO APLICAR: se escribirán cambios en la BD\n'
      : '🔍 MODO DRY-RUN: no se escribirá nada (usa --apply para ejecutar)\n'
  )

  await prisma.$connect()

  const allUpdates: { table: TableConfig; from: string; to: string; count: number }[] = []
  let needsReviewTotal = 0

  for (const table of TABLES) {
    const groups = await table.model.groupBy({
      by: ['category'],
      _count: { _all: true },
      orderBy: { category: 'asc' },
    })

    console.log(`── ${table.name} ── (${groups.length} valores distintos)`)
    if (groups.length === 0) {
      console.log('   (sin registros)\n')
      continue
    }

    for (const g of groups) {
      const value: string = g.category
      const count: number = g._count._all
      const target = resolveTarget(value, table.validValues)

      if (target === null) {
        console.log(`   ⚠️  revisar: ${JSON.stringify(value)} (${count}) — no mapea a ninguna clave`)
        needsReviewTotal++
      } else if (target === value) {
        console.log(`   ✅ ${value} (${count})`)
      } else {
        console.log(`   🔄 ${value} → ${target} (${count})`)
        allUpdates.push({ table, from: value, to: target, count })
      }
    }
    console.log()
  }

  const totalToChange = allUpdates.reduce((a, u) => a + u.count, 0)

  if (allUpdates.length === 0) {
    console.log('✨ No hay nada que normalizar automáticamente.')
    if (needsReviewTotal > 0) console.log(`⚠️  ${needsReviewTotal} valor(es) requieren revisión manual.`)
    return
  }

  if (!apply) {
    console.log(`Dry-run: se actualizarían ${totalToChange} registro(s) en ${allUpdates.length} mapeo(s). Ejecuta con --apply para confirmar.`)
    if (needsReviewTotal > 0) console.log(`⚠️  ${needsReviewTotal} valor(es) requieren revisión manual (no se tocan).`)
    return
  }

  // Todas las verticales en una sola transacción (todo o nada).
  console.log(`Aplicando ${allUpdates.length} mapeo(s) en una transacción...`)
  const result = await prisma.$transaction(
    allUpdates.map((u) =>
      u.table.model.updateMany({ where: { category: u.from }, data: { category: u.to } })
    )
  )

  const updated = result.reduce((a: number, r: { count: number }) => a + r.count, 0)
  console.log(`\n✅ Listo. Registros actualizados: ${updated}`)
  if (needsReviewTotal > 0) console.log(`⚠️  Quedan ${needsReviewTotal} valor(es) sin mapear — revísalos arriba.`)
}

main()
  .catch((error) => {
    console.error('❌ Error durante la normalización:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
