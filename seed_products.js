require("dotenv").config();
const pg = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

(async () => {
  try {
    const products = await prisma.product.findMany();
    console.log("Products existants:", products.length);
    products.forEach(p => console.log(`  - ${p.name} | ${p.price} FCFA | ${p.category} | extra:${p.isExtra}`));
  } catch(e) {
    console.error("Error:", e.code, e.message?.substring(0, 300));
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
})();
