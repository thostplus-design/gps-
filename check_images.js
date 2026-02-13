require("dotenv").config();
const pg = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

(async () => {
  try {
    const products = await prisma.product.findMany({ select: { id: true, name: true, image: true } });
    products.forEach(p => console.log(`${p.name} => image: ${p.image || "(null)"}`));
  } catch(e) {
    console.error(e.message?.substring(0, 200));
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
})();
