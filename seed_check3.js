const pg = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const connStr = process.env.DATABASE_URL;
console.log("Connecting to:", connStr?.substring(0, 30) + "...");

const pool = new pg.Pool({ 
  connectionString: connStr,
  ssl: { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

(async () => {
  try {
    const products = await prisma.product.findMany();
    console.log("Products:", products.length);
    products.forEach(p => console.log("-", p.name, p.price, p.category));
  } catch(e) {
    console.error("Prisma error:", e.code, e.message?.substring(0, 200));
    // Try raw
    try {
      const result = await pool.query('SELECT name, price, category FROM products LIMIT 5');
      console.log("RAW rows:", result.rows.length);
      result.rows.forEach(r => console.log("-", r.name, r.price, r.category));
    } catch(e2) {
      console.error("Raw error:", e2.message?.substring(0, 200));
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
})();
