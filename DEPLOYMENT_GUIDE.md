# 🚀 Guide de Déploiement - Foodly Backend

## 📋 Informations de la Base de Données

- **Host**: 102.180.50.92
- **Port**: 5432
- **Database**: foodly
- **Username**: postgres
- **Password**: 12345678

## 🔧 Étape 1 : Configuration de l'environnement

### 1.1 Modifier le fichier .env

Ouvrez le fichier `.env` à la racine du projet `foodly_back` et modifiez-le comme suit :

```env
# Database
DATABASE_URL="postgresql://postgres:12345678@102.180.50.92:5432/foodly?schema=public"

# JWT
JWT_SECRET="foodly-super-secret-jwt-key-production-2026-change-this"
JWT_EXPIRATION="7d"

# Server
PORT=8080
NODE_ENV=production

# CORS - Ajustez selon vos domaines frontend
CORS_ORIGIN="*"

# Cloudinary (optionnel - pour l'upload d'images)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Firebase (optionnel - pour les notifications push)
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
```

## 🗄️ Étape 2 : Initialiser la base de données

### 2.1 Générer le client Prisma

```bash
cd /Users/sahelys/AndroidStudioProjects/solidar/foodly/foodly_back
npx prisma generate
```

### 2.2 Créer les tables (migrations)

```bash
npx prisma migrate deploy
```

Si vous n'avez pas encore de migrations, créez-en une :

```bash
npx prisma migrate dev --name init
```

### 2.3 Initialiser les données (restaurants et comptes)

```bash
npx ts-node prisma/init-db.ts
```

Cette commande va créer :
- ✅ Restaurant "Chez Fatou"
- ✅ Compte SUPER_ADMIN : `foodtech@foodly.com` / `foodtech`
- ✅ Compte ADMIN : `admin@chezfatou.bf` / `admin123`

## 👥 Comptes créés

### Compte pour foodly_technique (SUPER_ADMIN)
- **Email**: foodtech@foodly.com
- **Mot de passe**: foodtech
- **Rôle**: SUPER_ADMIN
- **Accès**: Gestion de tous les restaurants

### Compte pour foodly_admin (ADMIN - Chez Fatou)
- **Email**: admin@chezfatou.bf
- **Mot de passe**: admin123
- **Rôle**: ADMIN
- **Restaurant**: Chez Fatou
- **Accès**: Gestion du restaurant Chez Fatou uniquement

## 🚀 Étape 3 : Démarrer le serveur

### En développement
```bash
npm run start:dev
```

### En production
```bash
npm run build
npm run start:prod
```

## 🔍 Étape 4 : Vérifier la connexion

### Test de connexion à la base de données
```bash
npx prisma studio
```

Cela ouvrira une interface web sur `http://localhost:5555` pour visualiser vos données.

### Test de l'API
```bash
curl http://localhost:8080/health
```

## 📝 Étape 5 : Tester les comptes

### Test connexion SUPER_ADMIN
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "foodtech@foodly.com",
    "password": "foodtech"
  }'
```

### Test connexion ADMIN
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@chezfatou.bf",
    "password": "admin123"
  }'
```

## 🔐 Sécurité - IMPORTANT

### Avant de déployer en production :

1. **Changez le JWT_SECRET** dans `.env` par une valeur aléatoire et sécurisée
2. **Configurez CORS_ORIGIN** avec vos domaines frontend réels
3. **Changez les mots de passe** des comptes de test
4. **Activez HTTPS** sur votre serveur
5. **Configurez un firewall** pour limiter l'accès à la base de données

### Générer un JWT_SECRET sécurisé
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🌐 Déploiement sur un serveur distant

### Option 1 : PM2 (Process Manager)
```bash
npm install -g pm2
npm run build
pm2 start dist/main.js --name foodly-api
pm2 save
pm2 startup
```

### Option 2 : Docker
```bash
docker build -t foodly-api .
docker run -p 8080:8080 --env-file .env foodly-api
```

### Option 3 : Render / Heroku / Railway
Suivez les instructions de la plateforme et configurez les variables d'environnement.

## 🐛 Dépannage

### Erreur de connexion à la base de données
- Vérifiez que PostgreSQL est démarré sur 102.180.50.92
- Vérifiez les credentials (username, password)
- Vérifiez que le port 5432 est ouvert
- Testez la connexion : `psql -h 102.180.50.92 -U postgres -d foodly`

### Les migrations ne fonctionnent pas
```bash
npx prisma migrate reset
npx prisma migrate deploy
```

### Prisma Client non généré
```bash
npx prisma generate
```

## 📞 Support

Pour toute question, contactez l'équipe de développement.
