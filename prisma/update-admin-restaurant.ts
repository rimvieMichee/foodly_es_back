import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Mise à jour du restaurantId pour admin@chezfatou.bf...');

  // Trouver le restaurant "Chez Fatou"
  const restaurant = await prisma.restaurant.findUnique({
    where: { email: 'contact@chezfatou.bf' },
  });

  if (!restaurant) {
    console.error('Restaurant "Chez Fatou" non trouvé');
    process.exit(1);
  }

  console.log('Restaurant trouvé:', restaurant.name, '- ID:', restaurant.id);

  // Mettre à jour l'utilisateur admin
  const admin = await prisma.user.update({
    where: { email: 'admin@chezfatou.bf' },
    data: {
      restaurantId: restaurant.id,
    },
  });

  console.log('Admin mis à jour:', {
    email: admin.email,
    restaurantId: admin.restaurantId,
  });

  console.log('\nMise à jour terminée avec succès!');
  console.log('Reconnectez-vous à foodly_admin pour obtenir le nouveau token JWT');
}

main()
  .catch((e) => {
    console.error(' Erreur lors de la mise à jour:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
