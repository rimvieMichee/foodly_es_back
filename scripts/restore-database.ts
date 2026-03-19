import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface BackupData {
  timestamp: string;
  database: string;
  users: any[];
  addresses: any[];
  restaurants: any[];
  menuItems: any[];
  tables: any[];
  orders: any[];
  orderItems: any[];
  dailyMenus: any[];
}

async function restoreDatabase(backupFilePath: string) {
  try {
    console.log('🔄 Début de la restauration de la base de données...');
    console.log(`📁 Fichier: ${backupFilePath}`);

    // Vérifier que le fichier existe
    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Le fichier de backup n'existe pas: ${backupFilePath}`);
    }

    // Lire le fichier de backup
    const backupContent = fs.readFileSync(backupFilePath, 'utf-8');
    const backupData: BackupData = JSON.parse(backupContent);

    console.log(`\n📅 Date du backup: ${backupData.timestamp}`);
    console.log(`🗄️  Base de données: ${backupData.database}`);

    // Confirmation de l'utilisateur (optionnel en production)
    console.log('\n⚠️  ATTENTION: Cette opération va supprimer toutes les données existantes !');
    console.log('📊 Données à restaurer:');
    console.log(`   - Users: ${backupData.users.length}`);
    console.log(`   - Addresses: ${backupData.addresses.length}`);
    console.log(`   - Restaurants: ${backupData.restaurants.length}`);
    console.log(`   - Menu Items: ${backupData.menuItems.length}`);
    console.log(`   - Tables: ${backupData.tables.length}`);
    console.log(`   - Orders: ${backupData.orders.length}`);
    console.log(`   - Order Items: ${backupData.orderItems.length}`);
    console.log(`   - Daily Menus: ${backupData.dailyMenus.length}`);

    // Supprimer toutes les données existantes (dans l'ordre inverse des dépendances)
    console.log('\n🗑️  Suppression des données existantes...');
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.dailyMenu.deleteMany();
    await prisma.table.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.address.deleteMany();
    await prisma.user.deleteMany();
    await prisma.restaurant.deleteMany();

    // Restaurer les données (dans l'ordre des dépendances)
    console.log('\n📥 Restauration des données...');

    // Restaurants en premier (pas de dépendances)
    if (backupData.restaurants.length > 0) {
      await prisma.restaurant.createMany({ data: backupData.restaurants });
      console.log(`✓ Restaurants restaurés: ${backupData.restaurants.length}`);
    }

    // Users (dépend de restaurants)
    if (backupData.users.length > 0) {
      await prisma.user.createMany({ data: backupData.users });
      console.log(`✓ Users restaurés: ${backupData.users.length}`);
    }

    // Addresses (dépend de users)
    if (backupData.addresses.length > 0) {
      await prisma.address.createMany({ data: backupData.addresses });
      console.log(`✓ Addresses restaurées: ${backupData.addresses.length}`);
    }

    // Menu Items (dépend de restaurants)
    if (backupData.menuItems.length > 0) {
      await prisma.menuItem.createMany({ data: backupData.menuItems });
      console.log(`✓ Menu Items restaurés: ${backupData.menuItems.length}`);
    }

    // Tables (dépend de restaurants)
    if (backupData.tables.length > 0) {
      await prisma.table.createMany({ data: backupData.tables });
      console.log(`✓ Tables restaurées: ${backupData.tables.length}`);
    }

    // Daily Menus (dépend de restaurants)
    if (backupData.dailyMenus.length > 0) {
      await prisma.dailyMenu.createMany({ data: backupData.dailyMenus });
      console.log(`✓ Daily Menus restaurés: ${backupData.dailyMenus.length}`);
    }

    // Orders (dépend de restaurants, tables, users)
    if (backupData.orders.length > 0) {
      await prisma.order.createMany({ data: backupData.orders });
      console.log(`✓ Orders restaurés: ${backupData.orders.length}`);
    }

    // Order Items (dépend de orders, menuItems)
    if (backupData.orderItems.length > 0) {
      await prisma.orderItem.createMany({ data: backupData.orderItems });
      console.log(`✓ Order Items restaurés: ${backupData.orderItems.length}`);
    }

    console.log('\n✅ Restauration terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la restauration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Récupérer le chemin du fichier depuis les arguments
const backupFile = process.argv[2];

if (!backupFile) {
  console.error('❌ Usage: ts-node restore-database.ts <chemin-du-backup>');
  console.error('   Exemple: ts-node restore-database.ts backups/backup-2026-02-25T16-00-00-000Z.json');
  process.exit(1);
}

// Résoudre le chemin complet
const backupPath = path.isAbsolute(backupFile) 
  ? backupFile 
  : path.join(__dirname, '..', backupFile);

// Exécuter la restauration
restoreDatabase(backupPath)
  .then(() => {
    console.log('\n🎉 Restauration terminée !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Échec de la restauration:', error);
    process.exit(1);
  });
