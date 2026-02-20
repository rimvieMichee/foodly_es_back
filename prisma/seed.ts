import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Créer le compte technicien par défaut
  const hashedPassword = await bcrypt.hash('foodtech', 10);

  const technician = await prisma.user.upsert({
    where: { email: 'foodtech@foodly.com' },
    update: {},
    create: {
      email: 'foodtech@foodly.com',
      password: hashedPassword,
      firstName: 'Food',
      lastName: 'Tech',
      phone: '+33 6 00 00 00 00',
      role: 'TECHNICIAN',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Compte technicien créé:', {
    email: technician.email,
    username: 'foodtech',
    password: 'foodtech',
  });

  // Créer un restaurant de démonstration
  const restaurant = await prisma.restaurant.upsert({
    where: { email: 'demo@restaurant.com' },
    update: {},
    create: {
      name: 'Restaurant Démo',
      address: '123 Rue de la Paix',
      city: 'Paris',
      country: 'France',
      phone: '+33 1 42 86 82 82',
      email: 'demo@restaurant.com',
      status: 'ACTIVE',
      subscriptionPlan: 'PREMIUM',
      subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
    },
  });

  console.log('✅ Restaurant démo créé:', restaurant.name);

  // Créer un admin pour le restaurant démo
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@restaurant.com' },
    update: {},
    create: {
      email: 'admin@restaurant.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Restaurant',
      phone: '+33 6 12 34 56 78',
      role: 'ADMIN',
      status: 'ACTIVE',
      restaurantId: restaurant.id,
    },
  });

  console.log('✅ Admin restaurant créé:', {
    email: admin.email,
    password: 'admin123',
  });

  console.log('\n🎉 Seed terminé avec succès!');
  console.log('\n📝 Comptes créés:');
  console.log('   Technicien: foodtech@foodly.com / foodtech');
  console.log('   Admin: admin@restaurant.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
