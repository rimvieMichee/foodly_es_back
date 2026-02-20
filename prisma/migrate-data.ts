import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateData() {
  console.log('🔄 Migration des données existantes...\n');

  try {
    // 1. Récupérer le premier restaurant (Chez Fatou)
    const restaurant = await prisma.restaurant.findFirst({
      where: { email: 'contact@chezfatou.bf' },
    });

    if (!restaurant) {
      console.log('❌ Aucun restaurant trouvé. Exécutez d\'abord le seed.');
      return;
    }

    console.log(`✅ Restaurant trouvé: ${restaurant.name} (${restaurant.id})\n`);

    // 2. Migrer les MenuItems sans restaurantId
    const menuItemsWithoutRestaurant = await prisma.menuItem.findMany({
      where: { restaurantId: null },
    });

    if (menuItemsWithoutRestaurant.length > 0) {
      console.log(`📦 Migration de ${menuItemsWithoutRestaurant.length} produits...`);
      
      for (const item of menuItemsWithoutRestaurant) {
        await prisma.menuItem.update({
          where: { id: item.id },
          data: { restaurantId: restaurant.id },
        });
      }
      
      console.log(`✅ ${menuItemsWithoutRestaurant.length} produits migrés\n`);
    } else {
      console.log('✓ Tous les produits ont déjà un restaurantId\n');
    }

    // 3. Migrer les Tables sans restaurantId
    const tablesWithoutRestaurant = await prisma.table.findMany({
      where: { restaurantId: null },
    });

    if (tablesWithoutRestaurant.length > 0) {
      console.log(`🪑 Migration de ${tablesWithoutRestaurant.length} tables...`);
      
      for (const table of tablesWithoutRestaurant) {
        await prisma.table.update({
          where: { id: table.id },
          data: { restaurantId: restaurant.id },
        });
      }
      
      console.log(`✅ ${tablesWithoutRestaurant.length} tables migrées\n`);
    } else {
      console.log('✓ Toutes les tables ont déjà un restaurantId\n');
    }

    // 4. Migrer les Orders sans restaurantId
    const ordersWithoutRestaurant = await prisma.order.findMany({
      where: { restaurantId: null },
    });

    if (ordersWithoutRestaurant.length > 0) {
      console.log(`📋 Migration de ${ordersWithoutRestaurant.length} commandes...`);
      
      for (const order of ordersWithoutRestaurant) {
        await prisma.order.update({
          where: { id: order.id },
          data: { restaurantId: restaurant.id },
        });
      }
      
      console.log(`✅ ${ordersWithoutRestaurant.length} commandes migrées\n`);
    } else {
      console.log('✓ Toutes les commandes ont déjà un restaurantId\n');
    }

    console.log('🎉 Migration terminée avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
