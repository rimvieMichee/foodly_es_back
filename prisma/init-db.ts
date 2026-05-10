import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Initialisation de la base de données...\n');

  // 1. Créer le restaurant "Chez Fatou"
  console.log('📍 Création du restaurant "Chez Fatou"...');
  const restaurant = await prisma.restaurant.upsert({
    where: { id: 'chez-fatou-restaurant-id' },
    update: {},
    create: {
      id: 'chez-fatou-restaurant-id',
      name: 'Chez Fatou',
      address: 'Avenue Kwame Nkrumah',
      quartier: 'Koulouba',
      city: 'Ouagadougou',
      country: 'Burkina Faso',
      phone: '+226 25 30 45 67',
      email: 'contact@chezfatou.bf',
      status: 'ACTIVE',
      subscriptionPlan: 'PREMIUM',
      subscriptionEndDate: new Date('2027-12-31'),
    },
  });
  console.log('✅ Restaurant créé:', restaurant.name);

  // 2. Créer le compte TECHNICIAN pour foodly_technique
  console.log('\n👤 Création du compte TECHNICIAN (foodly_technique)...');
  const hashedPasswordTech = await bcrypt.hash('foodtech', 10);
  const technician = await prisma.user.upsert({
    where: { email: 'foodtech@foodly.com' },
    update: {},
    create: {
      email: 'foodtech@foodly.com',
      password: hashedPasswordTech,
      firstName: 'Food',
      lastName: 'Tech',
      phone: '+226 00 00 00 00',
      role: 'TECHNICIAN',
      status: 'ACTIVE',
    },
  });
  console.log('✅ TECHNICIAN créé:', technician.email);

  // 3. Créer le compte ADMIN pour foodly_admin (Chez Fatou)
  console.log('\n👤 Création du compte ADMIN (foodly_admin - Chez Fatou)...');
  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@chezfatou.bf' },
    update: {},
    create: {
      email: 'admin@chezfatou.bf',
      password: hashedPasswordAdmin,
      firstName: 'Admin',
      lastName: 'Chez Fatou',
      phone: '+226 25 30 45 67',
      role: 'ADMIN',
      status: 'ACTIVE',
      restaurantId: restaurant.id,
    },
  });
  console.log('✅ ADMIN créé:', admin.email);

  console.log('\n✨ Initialisation terminée avec succès!\n');
  console.log('📋 Récapitulatif:');
  console.log('─────────────────────────────────────────────');
  console.log('🏢 Restaurant: Chez Fatou');
  console.log('📧 TECHNICIAN: foodtech@foodly.com / foodtech');
  console.log('📧 ADMIN: admin@chezfatou.bf / admin123');
  console.log('─────────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
