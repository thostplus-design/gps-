const pg = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

(async () => {
  try {
    const products = await prisma.product.findMany();
    console.log("Products:", products.length);
    console.log(JSON.stringify(products, null, 2));
  } catch(e) {
    console.error("ERROR:", e.message?.substring(0, 500));
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
})();
