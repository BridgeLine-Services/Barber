import { PrismaClient } from '@prisma/client'

// ============================================================================
// Prisma Singleton — Production-hardened
// - Prevents multiple instances in dev hot-reload
// - Logs only errors in production (not queries)
// - Includes graceful shutdown hooks
// ============================================================================

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Graceful shutdown — close connections on process termination
// Prevents connection pool exhaustion on serverless cold starts
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}
