# Foodly Backend API

Backend API pour le système de gestion de restaurant Foodly, construit avec NestJS, Prisma et PostgreSQL.

## 🚀 Technologies

- **NestJS** - Framework Node.js progressif
- **Prisma** - ORM moderne pour TypeScript
- **PostgreSQL** - Base de données relationnelle
- **JWT** - Authentification par token
- **Swagger** - Documentation API automatique
- **TypeScript** - Typage statique

## 📋 Prérequis

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm ou yarn

## 🛠️ Installation

### 1. Cloner le projet

```bash
cd foodly_back
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Modifier les valeurs dans `.env` :

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/foodly_db?schema=public"

# JWT
JWT_SECRET="votre-secret-jwt-super-securise"
JWT_EXPIRATION="7d"

# Server
PORT=8080
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:4200,http://localhost:3000"
```

### 4. Créer la base de données PostgreSQL

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE foodly_db;

# Quitter psql
\q
```

### 5. Générer le client Prisma et exécuter les migrations

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer et appliquer les migrations
npm run prisma:migrate
```

### 6. (Optionnel) Seed la base de données avec des données de test

Créer un fichier `prisma/seed.ts` pour ajouter des données initiales, puis :

```bash
npm run prisma:seed
```

## 🏃 Démarrage

### Mode développement

```bash
npm run start:dev
```

L'API sera accessible sur `http://localhost:8080/api`

### Mode production

```bash
# Build
npm run build

# Démarrer
npm run start:prod
```

## 📚 Documentation API

Une fois l'application démarrée, la documentation Swagger est disponible sur :

```
http://localhost:8080/api/docs
```

## 🗂️ Structure du projet

```
foodly_back/
├── prisma/
│   ├── schema.prisma          # Schéma de base de données
│   └── migrations/            # Migrations Prisma
├── src/
│   ├── auth/                  # Module d'authentification
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── guards/           # Guards JWT
│   │   └── strategies/       # Stratégies Passport
│   ├── users/                # Module utilisateurs/serveurs
│   ├── menu-items/           # Module items du menu
│   ├── tables/               # Module tables
│   ├── orders/               # Module commandes
│   ├── dashboard/            # Module statistiques
│   ├── prisma/               # Service Prisma
│   ├── app.module.ts         # Module principal
│   └── main.ts               # Point d'entrée
├── .env                      # Variables d'environnement
├── .env.example              # Exemple de configuration
├── package.json
└── tsconfig.json
```

## 🔑 Endpoints principaux

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Utilisateurs (Serveurs)
- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Créer un utilisateur
- `GET /api/users/:id` - Détails d'un utilisateur
- `PATCH /api/users/:id` - Modifier un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur

### Menu Items (Produits)
- `GET /api/menu-items` - Liste des produits
- `POST /api/menu-items` - Créer un produit
- `GET /api/menu-items/:id` - Détails d'un produit
- `PATCH /api/menu-items/:id` - Modifier un produit
- `PATCH /api/menu-items/:id/toggle-availability` - Changer la disponibilité
- `DELETE /api/menu-items/:id` - Supprimer un produit

### Tables
- `GET /api/tables` - Liste des tables
- `POST /api/tables` - Créer une table
- `GET /api/tables/:id` - Détails d'une table
- `PATCH /api/tables/:id` - Modifier une table
- `PATCH /api/tables/:id/status` - Changer le statut
- `DELETE /api/tables/:id` - Supprimer une table

### Commandes
- `GET /api/orders` - Liste des commandes
- `POST /api/orders` - Créer une commande
- `GET /api/orders/:id` - Détails d'une commande
- `GET /api/orders/table/:tableId` - Commandes d'une table
- `PATCH /api/orders/:id` - Modifier une commande
- `PATCH /api/orders/:id/status` - Changer le statut
- `DELETE /api/orders/:id` - Supprimer une commande

### Dashboard
- `GET /api/dashboard/stats` - Statistiques générales
- `GET /api/dashboard/revenue-by-month` - Revenus par mois
- `GET /api/dashboard/orders-by-category` - Commandes par catégorie

## 🔐 Authentification

L'API utilise JWT pour l'authentification. Après connexion, incluez le token dans les requêtes :

```bash
Authorization: Bearer <votre_token_jwt>
```

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Couverture de code
npm run test:cov
```

## 🛠️ Commandes Prisma utiles

```bash
# Ouvrir Prisma Studio (interface graphique)
npm run prisma:studio

# Créer une nouvelle migration
npx prisma migrate dev --name nom_de_la_migration

# Réinitialiser la base de données
npx prisma migrate reset

# Formater le schéma Prisma
npx prisma format
```

## 📦 Déploiement

### Variables d'environnement de production

Assurez-vous de configurer correctement :
- `DATABASE_URL` avec vos credentials de production
- `JWT_SECRET` avec une clé sécurisée
- `NODE_ENV=production`
- `CORS_ORIGIN` avec vos domaines autorisés

### Build et démarrage

```bash
npm run build
npm run start:prod
```

## 🤝 Intégration avec les applications clientes

### Application mobile Flutter
L'API est conçue pour fonctionner avec l'application mobile Foodly (serveurs).

### Application admin Angular
L'API fournit tous les endpoints nécessaires pour le dashboard admin Foodly.

## 📝 Notes importantes

1. **Sécurité** : Changez le `JWT_SECRET` en production
2. **CORS** : Configurez `CORS_ORIGIN` avec vos domaines
3. **Base de données** : Utilisez une base PostgreSQL dédiée en production
4. **Migrations** : Toujours tester les migrations avant de les appliquer en production

## 🐛 Dépannage

### Erreur de connexion à la base de données
Vérifiez que PostgreSQL est démarré et que `DATABASE_URL` est correct.

### Erreur Prisma Client
Régénérez le client Prisma :
```bash
npm run prisma:generate
```

### Port déjà utilisé
Changez le `PORT` dans `.env`

## 📄 Licence

MIT

## 👥 Auteurs

Équipe Foodly
