import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Créer un restaurant de démonstration pour le Burkina Faso
  // Vérifier si le restaurant existe déjà
  let restaurant = await prisma.restaurant.findFirst({
    where: { name: 'Chez Fatou', city: 'Ouagadougou' },
  });

  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: {
        name: 'Chez Fatou',
        address: 'Avenue Kwame Nkrumah',
        quartier: 'Koulouba',
        city: 'Ouagadougou',
        country: 'Burkina Faso',
        phone: '+226 25 30 45 67',
        email: 'contact@chezfatou.bf',
        status: 'ACTIVE',
        subscriptionPlan: 'PREMIUM',
        subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
      },
    });
  }

  console.log('✅ Restaurant démo créé:', restaurant.name);

  // Créer le compte technicien par défaut avec restaurantId
  const hashedPassword = await bcrypt.hash('foodtech', 10);

  const technician = await prisma.user.upsert({
    where: { email: 'foodtech@foodly.com' },
    update: {
      restaurantId: restaurant.id, // Forcer la mise à jour du restaurantId
    },
    create: {
      email: 'foodtech@foodly.com',
      password: hashedPassword,
      firstName: 'Food',
      lastName: 'Tech',
      phone: '+33 6 00 00 00 00',
      role: 'TECHNICIAN',
      status: 'ACTIVE',
      restaurantId: restaurant.id,
    },
  });

  console.log('✅ Compte technicien créé:', {
    email: technician.email,
    username: 'foodtech',
    password: 'foodtech',
  });

  // Créer un admin pour le restaurant démo
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@chezfatou.bf' },
    update: {
      restaurantId: restaurant.id, // Forcer la mise à jour du restaurantId
    },
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

  // Créer un serveur pour le restaurant démo
  const serverPassword = await bcrypt.hash('12345678', 10);
  const server = await prisma.user.upsert({
    where: { email: 'madi@gmail.com' },
    update: {
      restaurantId: restaurant.id,
    },
    create: {
      email: 'madi@gmail.com',
      password: serverPassword,
      firstName: 'Madi',
      lastName: 'Sawadogo',
      phone: '+226 70 11 22 33',
      role: 'SERVER',
      status: 'ACTIVE',
      restaurantId: restaurant.id,
    },
  });

  console.log('✅ Serveur créé:', {
    email: server.email,
    password: '12345678',
  });

  console.log('\n🎉 Seed terminé avec succès!');
  console.log('\n📝 Comptes créés:');
  console.log('   Technicien: foodtech@foodly.com / foodtech');
  console.log('   Admin: admin@chezfatou.bf / admin123');
  console.log('   Serveur: madi@gmail.com / 12345678');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
