import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Correction du restaurantId pour le compte technicien...');

  try {
    // Récupérer le premier restaurant (Chez Fatou)
    const restaurant = await prisma.restaurant.findFirst({
      where: { email: 'contact@chezfatou.bf' }
    });

    if (!restaurant) {
      console.error('❌ Restaurant "Chez Fatou" introuvable');
      process.exit(1);
    }

    console.log(`✅ Restaurant trouvé: ${restaurant.name} (${restaurant.id})`);

    // Mettre à jour le compte technicien
    const technician = await prisma.user.update({
      where: { email: 'foodtech@foodly.com' },
      data: {
        restaurantId: restaurant.id
      }
    });

    console.log('✅ Compte technicien mis à jour avec succès!');
    console.log(`   Email: ${technician.email}`);
    console.log(`   RestaurantId: ${technician.restaurantId}`);
    console.log('\n🎉 Correction terminée! Vous pouvez maintenant créer des produits.');
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
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
