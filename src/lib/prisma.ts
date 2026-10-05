import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prismaInstanceV12?: PrismaClient
}

function createPrismaClient(): PrismaClient {
  const existing = globalForPrisma.prismaInstanceV12
  if (existing && "announcement" in existing) {
    return existing
  }
  const fresh = new PrismaClient()
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prismaInstanceV12 = fresh
  }
  return fresh
}

export const prisma = createPrismaClient()

export default prisma
