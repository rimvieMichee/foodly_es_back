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

async function backupDatabase() {
  try {
    console.log('🔄 Début du backup de la base de données...');

    // Récupérer toutes les données
    const [users, addresses, restaurants, menuItems, tables, orders, orderItems, dailyMenus] = await Promise.all([
      prisma.user.findMany(),
      prisma.address.findMany(),
      prisma.restaurant.findMany(),
      prisma.menuItem.findMany(),
      prisma.table.findMany(),
      prisma.order.findMany(),
      prisma.orderItem.findMany(),
      prisma.dailyMenu.findMany(),
    ]);

    // Créer l'objet de backup
    const backupData: BackupData = {
      timestamp: new Date().toISOString(),
      database: process.env.DATABASE_URL?.split('@')[1]?.split('/')[1] || 'unknown',
      users,
      addresses,
      restaurants,
      menuItems,
      tables,
      orders,
      orderItems,
      dailyMenus,
    };

    // Créer le dossier backups s'il n'existe pas
    const backupsDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    // Générer le nom du fichier avec timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.json`;
    const filepath = path.join(backupsDir, filename);

    // Écrire le fichier de backup
    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2), 'utf-8');

    // Statistiques
    console.log('\n✅ Backup créé avec succès !');
    console.log(`📁 Fichier: ${filepath}`);
    console.log('\n📊 Statistiques:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Addresses: ${addresses.length}`);
    console.log(`   - Restaurants: ${restaurants.length}`);
    console.log(`   - Menu Items: ${menuItems.length}`);
    console.log(`   - Tables: ${tables.length}`);
    console.log(`   - Orders: ${orders.length}`);
    console.log(`   - Order Items: ${orderItems.length}`);
    console.log(`   - Daily Menus: ${dailyMenus.length}`);
    console.log(`\n💾 Taille du fichier: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`);

    return filepath;
  } catch (error) {
    console.error('❌ Erreur lors du backup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le backup
backupDatabase()
  .then((filepath) => {
    console.log(`\n🎉 Backup terminé: ${filepath}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Échec du backup:', error);
    process.exit(1);
  });
