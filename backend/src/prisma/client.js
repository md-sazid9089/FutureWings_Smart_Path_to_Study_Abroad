const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const { PrismaClient } = require("@prisma/client");

/** Singleton — avoid spawning multiple clients in dev (nodemon restarts) */
const globalForPrisma = globalThis;

let prisma = globalForPrisma.__prisma;

if (!prisma) {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.__prisma = prisma;
  }
}

module.exports = prisma;
