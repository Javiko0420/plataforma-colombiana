/**
 * Initialize Forums Script
 * Creates the first set of daily forums
 */

import { PrismaClient, ForumTopic } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Initializing forums...\n');

  // Get current time in Australia/Sydney timezone
  const now = new Date();
  const sydneyTime = new Date(
    now.toLocaleString('en-US', { timeZone: 'Australia/Sydney' })
  );

  // Set start time to 00:00:00 today
  const startDate = new Date(sydneyTime);
  startDate.setHours(0, 0, 0, 0);

  // Set end time to 23:59:59 today
  const endDate = new Date(sydneyTime);
  endDate.setHours(23, 59, 59, 999);

  const dateStr = sydneyTime.toISOString().split('T')[0];

  try {
    // Check if forums already exist
    const existingForums = await prisma.forum.findMany({
      where: {
        isActive: true,
      },
    });

    if (existingForums.length > 0) {
      console.log('⚠️  Active forums already exist:');
      existingForums.forEach((forum) => {
        console.log(`   - ${forum.name} (${forum.slug})`);
      });
      console.log('\nTo recreate forums, first archive the existing ones.\n');
      return;
    }

    // Create Forum 1
    const forum1 = await prisma.forum.create({
      data: {
        name: 'Foro Diario 1',
        description:
          'Foro general para discusiones diarias sobre Colombia y la comunidad.',
        slug: `daily-1-${dateStr}`,
        topic: ForumTopic.DAILY_1,
        startDate,
        endDate,
        isActive: true,
        isArchived: false,
      },
    });

    console.log('✅ Created Forum 1:');
    console.log(`   ID: ${forum1.id}`);
    console.log(`   Slug: ${forum1.slug}`);
    console.log(`   Active: ${forum1.isActive}\n`);

    // Create Forum 2
    const forum2 = await prisma.forum.create({
      data: {
        name: 'Foro Diario 2',
        description:
          'Segundo foro para temas variados y conversaciones alternativas.',
        slug: `daily-2-${dateStr}`,
        topic: ForumTopic.DAILY_2,
        startDate,
        endDate,
        isActive: true,
        isArchived: false,
      },
    });

    console.log('✅ Created Forum 2:');
    console.log(`   ID: ${forum2.id}`);
    console.log(`   Slug: ${forum2.slug}`);
    console.log(`   Active: ${forum2.isActive}\n`);

    console.log('🎉 Forums initialized successfully!');
    console.log(`\nYou can now access the forums at:`);
    console.log(`   http://localhost:3000/foros\n`);
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

