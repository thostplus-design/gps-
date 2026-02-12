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
    // Supprimer les anciens produits non-restaurant
    const deleted = await prisma.product.deleteMany({
      where: { category: { not: "RESTAURANT" } }
    });
    console.log("Supprimés (non-restaurant):", deleted.count);

    // Mettre à jour les produits existants
    const existing = await prisma.product.findMany();
    console.log("Restants:", existing.length);
    existing.forEach(p => console.log(`  - ${p.id}: ${p.name}`));

    // Corriger les extras existants (Eau)
    await prisma.product.updateMany({
      where: { name: { contains: "Eau" } },
      data: { isExtra: true, shopName: "Restaurant" }
    });

    // Mettre shopName "Restaurant" pour tous
    await prisma.product.updateMany({
      where: {},
      data: { shopName: "Restaurant", category: "RESTAURANT" }
    });

    // Ajouter des repas manquants + extras
    const newProducts = [
      // Repas
      { name: "Poulet Braisé", description: "Poulet grillé aux épices africaines", price: 3000, category: "RESTAURANT", shopName: "Restaurant", cookingTimeMin: 25, isExtra: false, paymentMethod: "BOTH" },
      { name: "Attiéké Poisson", description: "Attiéké frais avec poisson grillé", price: 2500, category: "RESTAURANT", shopName: "Restaurant", cookingTimeMin: 20, isExtra: false, paymentMethod: "BOTH" },
      { name: "Alloco + Poisson", description: "Banane plantain frite avec poisson", price: 2000, category: "RESTAURANT", shopName: "Restaurant", cookingTimeMin: 15, isExtra: false, paymentMethod: "BOTH" },
      { name: "Tchep au Poulet", description: "Riz thiéboudienne au poulet", price: 2500, category: "RESTAURANT", shopName: "Restaurant", cookingTimeMin: 30, isExtra: false, paymentMethod: "BOTH" },
      { name: "Spaghetti Bolognaise", description: "Pâtes sauce tomate viande hachée", price: 2000, category: "RESTAURANT", shopName: "Restaurant", cookingTimeMin: 20, isExtra: false, paymentMethod: "BOTH" },
      // Extras
      { name: "Jus de Bissap", description: "Jus d'hibiscus frais", price: 500, category: "RESTAURANT", shopName: "Restaurant", cookingTimeMin: 0, isExtra: true, paymentMethod: "BOTH" },
      { name: "Jus de Gingembre", description: "Jus de gingembre frais", price: 500, category: "RESTAURANT", shopName: "Restaurant", cookingTimeMin: 0, isExtra: true, paymentMethod: "BOTH" },
      { name: "Coca-Cola 33cl", description: "Coca-Cola canette", price: 400, category: "RESTAURANT", shopName: "Restaurant", cookingTimeMin: 0, isExtra: true, paymentMethod: "BOTH" },
      { name: "Eau Minérale 50cl", description: "Eau minérale", price: 300, category: "RESTAURANT", shopName: "Restaurant", cookingTimeMin: 0, isExtra: true, paymentMethod: "BOTH" },
    ];

    for (const prod of newProducts) {
      // Vérifier si existe déjà (par nom)
      const exists = await prisma.product.findFirst({ where: { name: prod.name } });
      if (!exists) {
        await prisma.product.create({ data: prod });
        console.log("Créé:", prod.name);
      } else {
        console.log("Existe déjà:", prod.name);
      }
    }

    // Résultat final
    const all = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });
    console.log("\n=== Produits finaux ===");
    console.log("Total:", all.length);
    all.forEach(p => console.log(`  ${p.isExtra ? "[EXTRA]" : "[REPAS]"} ${p.name} - ${p.price} FCFA (${p.cookingTimeMin}min)`));

  } catch(e) {
    console.error("Error:", e.message?.substring(0, 500));
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
})();
