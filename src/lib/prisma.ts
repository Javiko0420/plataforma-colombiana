import { PrismaClient } from '@prisma/client';

// Evita múltiples instancias en desarrollo debido al Hot Reload
const prismaClientSingleton = () => {
  return new PrismaClient({
    // Logs de queries solo en desarrollo: en producción añaden overhead
    // por query y ruido (potencialmente con datos) en los logs.
    log:
      process.env.NODE_ENV === 'production'
        ? ['error']
        : ['query', 'error', 'warn'],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

// Usa la instancia existente si hay una, si no, crea una nueva
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;