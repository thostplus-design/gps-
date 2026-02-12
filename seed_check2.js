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
    products.forEach(p => console.log("-", p.name, p.price, p.category));
  } catch(e) {
    console.error("FULL_ERROR:", JSON.stringify(e, null, 2));
    // Try raw query instead
    try {
      const result = await pool.query('SELECT * FROM products LIMIT 5');
      console.log("RAW QUERY:", result.rows.length, "rows");
      result.rows.forEach(r => console.log("-", r.name, r.price));
    } catch(e2) {
      console.error("RAW ERROR:", e2.message);
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
})();
