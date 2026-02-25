require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaMssql } = require("@prisma/adapter-mssql");
const mssql = require("mssql");

/** Singleton — avoid spawning multiple clients in dev (nodemon restarts) */
const globalForPrisma = globalThis;

async function initializePrisma() {
  const pool = new mssql.ConnectionPool({
    server: "DESKTOP-1SSOPMM",
    instanceName: "SQLEXPRESS",
    database: "FutureWings_Smart_Path_to_Study_Abroad",
    authentication: {
      type: "default",
    },
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
    },
  });

  const adapter = new PrismaMssql(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

let prisma = globalForPrisma.__prisma;

if (!prisma) {
  prisma = global.prismaPromise = initializePrisma();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.__prisma = prisma;
  }
}

module.exports = prisma;
