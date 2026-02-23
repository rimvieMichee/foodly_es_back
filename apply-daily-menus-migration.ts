import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Application de la migration daily_menus...');

  try {
    // Créer la table daily_menus
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "daily_menus" (
        "id" TEXT NOT NULL,
        "restaurantId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "originalPrice" DOUBLE PRECISION NOT NULL,
        "discountedPrice" DOUBLE PRECISION NOT NULL,
        "discountPercent" INTEGER NOT NULL,
        "menuItemIds" TEXT[],
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "validUntil" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "daily_menus_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // Ajouter la contrainte de clé étrangère
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'daily_menus_restaurantId_fkey'
        ) THEN
          ALTER TABLE "daily_menus" 
          ADD CONSTRAINT "daily_menus_restaurantId_fkey" 
          FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") 
          ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
      END $$;
    `;
    
    console.log('✅ Migration appliquée avec succès!');
    console.log('La table daily_menus a été créée');
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
