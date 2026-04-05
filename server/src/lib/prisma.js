const { PrismaClient } = require("@prisma/client");

const prisma = global.__myfinancePrisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__myfinancePrisma = prisma;
}

module.exports = {
  prisma
};
