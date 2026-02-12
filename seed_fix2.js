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
    // 1. Mettre tous les produits en catégorie RESTAURANT + shopName "Restaurant"
    await prisma.product.updateMany({
      where: {},
      data: { category: "RESTAURANT", shopName: "Restaurant" }
    });
    console.log("Tous mis en RESTAURANT + shopName Restaurant");

    // 2. Marquer les boissons/extras comme isExtra
    const extraNames = ["Eau Minerale", "Coca-Cola", "Pain de Mie", "Paracetamol", "Ecouteurs", "Eau"];
    const all = await prisma.product.findMany();
    for (const p of all) {
      const shouldBeExtra = extraNames.some(n => p.name.includes(n));
      if (shouldBeExtra && !p.isExtra) {
        await prisma.product.update({ where: { id: p.id }, data: { isExtra: true, cookingTimeMin: 0 } });
        console.log("Marqué extra:", p.name);
      }
    }

    // 3. Désactiver les produits non pertinents (pharmacie, électronique)
    const hideNames = ["Paracetamol", "Ecouteurs"];
    for (const p of all) {
      if (hideNames.some(n => p.name.includes(n))) {
        await prisma.product.update({ where: { id: p.id }, data: { isAvailable: false } });
        console.log("Désactivé:", p.name);
      }
    }

    // 4. Ajouter de nouveaux repas et extras
    const newProducts = [
      { name: "Poulet Braisé", description: "Poulet grillé aux épices africaines", price: 3000, category: "RESTAURANT", shopName: "Restaurant", cookingTimeMin: 25, isExtra: false, paymentMethod: "BOTH" },
      { name: "Attiéké Poisson", description: "Attiéké frais avec poisson grillé", price: 2500, category: "RESTAURANT", shopName: "Restaurant", cookingTimeMin: 20, isExtra: false, paymentMethod: "BOTH" },
      { name: "Alloco + Poisson", description: "Banane plantain frite avec poisson", price: 2000, category: "RESTAURANT", shopName: "Restaurant", cookingTimeMin: 15, isExtra: false, paymentMethod: "BOTH" },
      { name: "Tchep au Poulet", description: "Riz thiéboudienne au poulet", price: 2500, category: "RESTAURANT", shopName: "Restaurant", cookingTimeMin: 30, isExtra: false, paymentMethod: "BOTH" },
      { name: "Spaghetti Bolognaise", description: "Pâtes sauce tomate viande hachée", price: 2000, category: "RESTAURANT", shopName: "Restaurant", cookingTimeMin: 20, isExtra: false, paymentMethod: "BOTH" },
      { name: "Jus de Bissap", description: "Jus d'hibiscus frais", price: 500, category: "RESTAURANT", shopName: "Restaurant", cookingTimeMin: 0, isExtra: true, paymentMethod: "BOTH" },
      { name: "Jus de Gingembre", description: "Jus de gingembre frais", price: 500, category: "RESTAURANT", shopName: "Restaurant", cookingTimeMin: 0, isExtra: true, paymentMethod: "BOTH" },
      { name: "Coca-Cola 33cl", description: "Coca-Cola canette", price: 400, category: "RESTAURANT", shopName: "Restaurant", cookingTimeMin: 0, isExtra: true, paymentMethod: "BOTH" },
      { name: "Eau Minérale 50cl", description: "Eau minérale", price: 300, category: "RESTAURANT", shopName: "Restaurant", cookingTimeMin: 0, isExtra: true, paymentMethod: "BOTH" },
    ];

    for (const prod of newProducts) {
      const exists = await prisma.product.findFirst({ where: { name: prod.name } });
      if (!exists) {
        await prisma.product.create({ data: prod });
        console.log("Créé:", prod.name);
      } else {
        console.log("Existe déjà:", prod.name);
      }
    }

    // 5. Corriger le prix de "Riz au gras" qui est à 25000
    await prisma.product.updateMany({
      where: { name: "Riz au gras" },
      data: { price: 2500 }
    });
    console.log("Prix corrigé: Riz au gras -> 2500");

    // Résultat final
    const final_ = await prisma.product.findMany({ 
      where: { isAvailable: true },
      orderBy: { createdAt: "asc" } 
    });
    console.log("\n=== Produits disponibles ===");
    console.log("Total:", final_.length);
    final_.forEach(p => console.log(`  ${p.isExtra ? "[EXTRA]" : "[REPAS]"} ${p.name} - ${p.price} FCFA`));

  } catch(e) {
    console.error("Error:", e.message?.substring(0, 500));
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
})();
