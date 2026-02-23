import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Application de la migration subcategory...');

  try {
    // Ajouter la colonne subcategory à la table menu_items
    await prisma.$executeRaw`ALTER TABLE "menu_items" ADD COLUMN IF NOT EXISTS "subcategory" TEXT;`;
    
    console.log('✅ Migration appliquée avec succès!');
    console.log('La colonne subcategory a été ajoutée à la table menu_items');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
