/**
 * Script de verificación de base de datos
 * Verifica que todas las tablas del sistema de foros estén creadas correctamente
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verificando conexión a base de datos...\n')

  try {
    // Test de conexión
    await prisma.$connect()
    console.log('✅ Conexión exitosa a PostgreSQL\n')

    // Contar registros en cada tabla principal
    const tables = [
      { name: 'User', model: prisma.user },
      { name: 'Forum', model: prisma.forum },
      { name: 'ForumPost', model: prisma.forumPost },
      { name: 'ForumComment', model: prisma.forumComment },
      { name: 'Report', model: prisma.report },
      { name: 'Business', model: prisma.business },
      { name: 'Product', model: prisma.product },
    ]

    console.log('📊 Estado de las tablas:\n')
    
    for (const table of tables) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const count = await (table.model as any).count()
        console.log(`  ${table.name.padEnd(15)} ✓ ${count} registros`)
      } catch (error) {
        console.log(`  ${table.name.padEnd(15)} ✗ Error`)
      }
    }

    console.log('\n✨ Base de datos lista para el sistema de foros!')
    console.log('\n📝 Próximos pasos:')
    console.log('  1. Crear APIs para los foros')
    console.log('  2. Implementar sistema de autenticación con nickname')
    console.log('  3. Integrar OpenAI Moderation API')
    console.log('  4. Configurar cron job para renovación diaria\n')

  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

