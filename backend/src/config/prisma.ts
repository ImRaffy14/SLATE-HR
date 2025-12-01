import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const connectPrisma = async () => {
  await prisma.$connect();
};
const disconnectPrisma = async () => {
  await prisma.$disconnect();
};

export { connectPrisma, disconnectPrisma };
export default prisma;