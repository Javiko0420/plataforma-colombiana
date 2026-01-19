/**
 * Initialize Forums Script (Dev Friendly Fix)
 * Creates forums active NOW regardless of timezone
 */

import { PrismaClient, ForumTopic } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Initializing forums (Local Dev Mode)...\n');

  // Usamos la hora LOCAL de tu máquina para evitar conflictos de zona horaria
  const now = new Date();
  
  // StartDate: Inicio del día actual (00:00 local)
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);

  // EndDate: Final del día actual (23:59 local)
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  const dateStr = now.toISOString().split('T')[0];

  try {
    // 1. Limpieza preventiva: Desactivamos foros viejos para evitar conflictos
    console.log('🧹 Archiving old active forums...');
    await prisma.forum.updateMany({
      where: { isActive: true },
      data: { isActive: false, isArchived: true }
    });

    // 2. Crear Foro 1
    const forum1 = await prisma.forum.create({
      data: {
        name: 'Foro Diario 1 (Dev)',
        description: 'Foro general de prueba (Hora Local).',
        slug: `daily-1-dev-${Date.now()}`, // Slug único usando timestamp
        topic: ForumTopic.DAILY_1,
        startDate,
        endDate,
        isActive: true,
        isArchived: false,
      },
    });

    console.log('✅ Created Forum 1:', forum1.name);

    // 3. Crear Foro 2
    const forum2 = await prisma.forum.create({
      data: {
        name: 'Foro Diario 2 (Dev)',
        description: 'Segundo foro de prueba (Hora Local).',
        slug: `daily-2-dev-${Date.now()}`,
        topic: ForumTopic.DAILY_2,
        startDate,
        endDate,
        isActive: true,
        isArchived: false,
      },
    });

    console.log('✅ Created Forum 2:', forum2.name);
    console.log('\n🎉 Forums initialized successfully for YOUR timezone!');
    console.log(`   Check them at: http://localhost:3000/foros\n`);

  } catch (error) {
    console.error('❌ Error initializing forums:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });