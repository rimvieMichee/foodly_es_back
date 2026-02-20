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

  // Créer un restaurant de démonstration pour le Burkina Faso
  const restaurant = await prisma.restaurant.upsert({
    where: { email: 'contact@chezfatou.bf' },
    update: {},
    create: {
      name: 'Chez Fatou',
      address: 'Avenue Kwame Nkrumah',
      city: 'Ouagadougou',
      country: 'Burkina Faso',
      phone: '+226 25 30 45 67',
      email: 'contact@chezfatou.bf',
      status: 'ACTIVE',
      subscriptionPlan: 'PREMIUM',
      subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
    },
  });

  console.log('✅ Restaurant démo créé:', restaurant.name);

  // Créer un admin pour le restaurant démo
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@chezfatou.bf' },
    update: {},
    create: {
      email: 'admin@chezfatou.bf',
      password: adminPassword,
      firstName: 'Fatou',
      lastName: 'Ouédraogo',
      phone: '+226 70 12 34 56',
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
  console.log('   Admin: admin@chezfatou.bf / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
