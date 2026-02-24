/**
 * Prisma Client Singleton
 * 
 * Prevents multiple instances of Prisma Client in development.
 * In production, a single instance is always used.
 */

const { PrismaClient } = require("@prisma/client");

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // In development mode, use global to prevent hot-reload issues
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

module.exports = prisma;
