import { config } from "dotenv";
config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Delete existing products
  await prisma.product.deleteMany();

  await prisma.product.createMany({
    data: [
      { name: "Jollof Rice + Poulet", description: "Riz jollof avec poulet grille et salade", price: 2500, category: "RESTAURANT", shopName: "Mama's Kitchen" },
      { name: "Fried Rice Special", description: "Riz frit avec crevettes et legumes", price: 3000, category: "RESTAURANT", shopName: "Mama's Kitchen" },
      { name: "Suya Platter", description: "Brochettes de boeuf epicees", price: 1500, category: "RESTAURANT", shopName: "Suya Spot" },
      { name: "Egusi Soup + Pounded Yam", description: "Soupe egusi avec igname pilee", price: 2000, category: "RESTAURANT", shopName: "Mama's Kitchen" },
      { name: "Shawarma Poulet", description: "Shawarma poulet avec frites", price: 1800, category: "RESTAURANT", shopName: "Quick Bites" },
      { name: "Pizza Margherita", description: "Pizza tomate, mozzarella, basilic", price: 4500, category: "RESTAURANT", shopName: "Pizza House" },
      { name: "Burger Classic", description: "Burger boeuf, fromage, salade, tomate", price: 3500, category: "RESTAURANT", shopName: "Quick Bites" },
      { name: "Eau Minerale 1.5L", description: "Bouteille eau minerale", price: 200, category: "GROCERY", shopName: "Mini Market" },
      { name: "Coca-Cola 50cl", description: "Coca-Cola fraiche", price: 300, category: "GROCERY", shopName: "Mini Market" },
      { name: "Pain de Mie", description: "Pain de mie tranche", price: 500, category: "GROCERY", shopName: "Mini Market" },
      { name: "Paracetamol", description: "Boite de 12 comprimes", price: 500, category: "PHARMACY", shopName: "PharmaDirect" },
      { name: "Ecouteurs Bluetooth", description: "Ecouteurs sans fil", price: 5000, category: "ELECTRONICS", shopName: "TechShop" },
    ],
  });
  console.log("12 products seeded!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
