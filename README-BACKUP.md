# 📦 Guide de Backup et Restauration de la Base de Données

Ce guide explique comment sauvegarder et restaurer les données de la base de données Foodly.

## 🔧 Scripts disponibles

### 1. Backup de la base de données

Crée un fichier JSON contenant toutes les données de la base de données.

```bash
npm run db:backup
```

**Ce qui est sauvegardé :**
- ✅ Users (utilisateurs)
- ✅ Addresses (adresses)
- ✅ Restaurants
- ✅ Menu Items (items du menu)
- ✅ Tables
- ✅ Orders (commandes)
- ✅ Order Items (items de commande)
- ✅ Daily Menus (menus du jour)

**Fichier généré :**
- Emplacement : `foodly_back/backups/backup-YYYY-MM-DDTHH-mm-ss-sssZ.json`
- Format : JSON avec indentation pour lisibilité
- Contient : timestamp, nom de la base, toutes les données

**Exemple de sortie :**
```
🔄 Début du backup de la base de données...

✅ Backup créé avec succès !
📁 Fichier: /path/to/foodly_back/backups/backup-2026-02-25T16-30-00-000Z.json

📊 Statistiques:
   - Users: 15
   - Addresses: 12
   - Restaurants: 3
   - Menu Items: 45
   - Tables: 20
   - Orders: 150
   - Order Items: 320
   - Daily Menus: 8

💾 Taille du fichier: 245.67 KB
```

### 2. Restauration de la base de données

Restaure les données depuis un fichier de backup.

```bash
npm run db:restore backups/backup-2026-02-25T16-30-00-000Z.json
```

**⚠️ ATTENTION :**
- Cette opération **supprime toutes les données existantes**
- Les données sont restaurées dans l'ordre des dépendances
- Assurez-vous d'avoir un backup récent avant de restaurer

**Exemple de sortie :**
```
🔄 Début de la restauration de la base de données...
📁 Fichier: backups/backup-2026-02-25T16-30-00-000Z.json

📅 Date du backup: 2026-02-25T16:30:00.000Z
🗄️  Base de données: foodly

⚠️  ATTENTION: Cette opération va supprimer toutes les données existantes !
📊 Données à restaurer:
   - Users: 15
   - Addresses: 12
   - Restaurants: 3
   - Menu Items: 45
   - Tables: 20
   - Orders: 150
   - Order Items: 320
   - Daily Menus: 8

🗑️  Suppression des données existantes...
📥 Restauration des données...
✓ Restaurants restaurés: 3
✓ Users restaurés: 15
✓ Addresses restaurées: 12
✓ Menu Items restaurés: 45
✓ Tables restaurées: 20
✓ Daily Menus restaurés: 8
✓ Orders restaurés: 150
✓ Order Items restaurés: 320

✅ Restauration terminée avec succès !
```

## 📋 Cas d'usage

### Backup régulier (recommandé)

```bash
# Backup quotidien
npm run db:backup

# Renommer le backup pour le garder
mv backups/backup-2026-02-25T16-30-00-000Z.json backups/backup-daily-2026-02-25.json
```

### Avant une migration importante

```bash
# 1. Créer un backup
npm run db:backup

# 2. Effectuer la migration
npm run prisma:migrate

# 3. Si problème, restaurer
npm run db:restore backups/backup-2026-02-25T16-30-00-000Z.json
```

### Copier les données vers un autre environnement

```bash
# Sur l'environnement source
npm run db:backup

# Copier le fichier vers l'environnement cible
scp backups/backup-*.json user@target-server:/path/to/foodly_back/backups/

# Sur l'environnement cible
npm run db:restore backups/backup-2026-02-25T16-30-00-000Z.json
```

### Backup avant déploiement

```bash
# Créer un backup de sécurité
npm run db:backup

# Déployer
npm run build
npm run start:prod
```

## 🔒 Sécurité

### Bonnes pratiques

1. **Ne pas versionner les backups** : Ajoutez `backups/` au `.gitignore`
2. **Chiffrer les backups sensibles** : Utilisez GPG ou similaire
3. **Stocker hors serveur** : Copiez les backups vers un stockage externe
4. **Rotation des backups** : Gardez seulement les N derniers backups
5. **Tester les restaurations** : Vérifiez régulièrement que les backups fonctionnent

### Exemple de chiffrement

```bash
# Chiffrer un backup
gpg --symmetric --cipher-algo AES256 backups/backup-2026-02-25.json

# Déchiffrer
gpg --decrypt backups/backup-2026-02-25.json.gpg > backups/backup-2026-02-25.json
```

## 📁 Structure du fichier de backup

```json
{
  "timestamp": "2026-02-25T16:30:00.000Z",
  "database": "foodly",
  "users": [...],
  "addresses": [...],
  "restaurants": [...],
  "menuItems": [...],
  "tables": [...],
  "orders": [...],
  "orderItems": [...],
  "dailyMenus": [...]
}
```

## 🛠️ Dépannage

### Erreur : "Le fichier de backup n'existe pas"

Vérifiez le chemin du fichier :
```bash
ls -la backups/
npm run db:restore backups/nom-correct-du-fichier.json
```

### Erreur : "Cannot connect to database"

Vérifiez votre `.env` et que la base de données est accessible :
```bash
# Tester la connexion
npm run prisma:studio
```

### Erreur lors de la restauration

Si la restauration échoue, vérifiez :
1. Les contraintes de clés étrangères
2. Les formats de données (dates, enums, etc.)
3. Les logs d'erreur pour identifier la table problématique

## 📞 Support

Pour toute question ou problème, consultez la documentation Prisma :
- https://www.prisma.io/docs/concepts/components/prisma-client
- https://www.prisma.io/docs/guides/database/seed-database
