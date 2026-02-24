# 🚀 Guide de déploiement sur Render

Ce guide vous explique comment déployer le backend Foodly sur Render avec PostgreSQL.

## 📋 Prérequis

1. Un compte GitHub
2. Un compte Render (gratuit) : https://render.com
3. Le code poussé sur GitHub

## 🔧 Étape 1 : Préparer le repository GitHub

### 1.1 Initialiser Git (si ce n'est pas déjà fait)

```bash
cd foodly_back
git init
git add .
git commit -m "Initial commit - Foodly Backend"
```

### 1.2 Créer un repository sur GitHub

1. Allez sur https://github.com/new
2. Créez un nouveau repository (ex: `foodly-backend`)
3. **Ne pas** initialiser avec README, .gitignore ou licence

### 1.3 Pousser le code

```bash
git remote add origin https://github.com/VOTRE_USERNAME/foodly-backend.git
git branch -M main
git push -u origin main
```

## 🌐 Étape 2 : Déployer sur Render

### Option A : Déploiement automatique avec render.yaml (Recommandé)

1. **Connectez-vous à Render** : https://dashboard.render.com

2. **Créer un nouveau Blueprint** :
    - Cliquez sur "New +" → "Blueprint"
    - Connectez votre repository GitHub
    - Sélectionnez le repository `foodly-backend`
    - Render détectera automatiquement le fichier `render.yaml`

3. **Configurer les variables d'environnement** :
    - Le `JWT_SECRET` sera généré automatiquement
    - La `DATABASE_URL` sera liée automatiquement à la base de données PostgreSQL
    - Vous pouvez modifier `CORS_ORIGIN` si nécessaire

4. **Déployer** :
    - Cliquez sur "Apply"
    - Render va créer :
        - Une base de données PostgreSQL
        - Un service web NestJS
    - Le déploiement prend environ 5-10 minutes

### Option B : Déploiement manuel

#### 2.1 Créer la base de données PostgreSQL

1. Dans le dashboard Render, cliquez sur "New +" → "PostgreSQL"
2. Configurez :
    - **Name** : `foodly-db`
    - **Database** : `foodly_db`
    - **User** : `foodly_user` (ou laissez par défaut)
    - **Region** : Frankfurt (ou le plus proche de vous)
    - **Plan** : Free
3. Cliquez sur "Create Database"
4. **Notez l'URL de connexion** (Internal Database URL)

#### 2.2 Créer le service web

1. Cliquez sur "New +" → "Web Service"
2. Connectez votre repository GitHub
3. Configurez :
    - **Name** : `foodly-api`
    - **Region** : Frankfurt (même région que la DB)
    - **Branch** : `main`
    - **Root Directory** : (laisser vide)
    - **Runtime** : Node
    - **Build Command** : `npm install && npm run build && npx prisma migrate deploy`
    - **Start Command** : `npm run start:prod`
    - **Plan** : Free

4. **Variables d'environnement** :
   Cliquez sur "Advanced" → "Add Environment Variable" et ajoutez :

   ```
   NODE_ENV=production
   PORT=8080
   DATABASE_URL=[Collez l'Internal Database URL de votre PostgreSQL]
   JWT_SECRET=[Générez une clé secrète forte, ex: openssl rand -base64 32]
   JWT_EXPIRATION=7d
   CORS_ORIGIN=*
   ```

5. Cliquez sur "Create Web Service"

## ✅ Étape 3 : Vérifier le déploiement

### 3.1 Attendre la fin du build

Le déploiement prend environ 5-10 minutes. Vous verrez les logs en temps réel.

### 3.2 Tester l'API

Une fois déployé, votre API sera accessible sur :

```
https://foodly-api.onrender.com
```

Testez les endpoints :

- **API Base** : `https://foodly-api.onrender.com/api`
- **Swagger Docs** : `https://foodly-api.onrender.com/api/docs`
- **Health Check** : `https://foodly-api.onrender.com/api/auth/login` (devrait retourner 400 ou 401)

### 3.3 Tester avec curl

```bash
# Test de connexion
curl https://foodly-api.onrender.com/api/auth/login

# Créer un utilisateur
curl -X POST https://foodly-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@foodly.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "Foodly",
    "phone": "+33612345678",
    "role": "ADMIN"
  }'
```

## 🔄 Étape 4 : Déploiements automatiques

Render redéploie automatiquement à chaque push sur la branche `main`.

```bash
# Faire des modifications
git add .
git commit -m "Update API"
git push origin main
# Render redéploie automatiquement
```

## 🛠️ Gestion de la base de données

### Accéder à la base de données

#### Via Render Dashboard

1. Allez dans votre service PostgreSQL
2. Cliquez sur "Connect" → "External Connection"
3. Utilisez les credentials fournis avec un client PostgreSQL (pgAdmin, DBeaver, etc.)

#### Via Prisma Studio (en local)

```bash
# Dans votre .env local, utilisez l'External Database URL de Render
DATABASE_URL="postgresql://..."

# Lancez Prisma Studio
npm run prisma:studio
```

### Exécuter des migrations

Les migrations sont automatiquement exécutées lors du build grâce à :

```bash
npx prisma migrate deploy
```

Si vous devez exécuter manuellement :

1. Connectez-vous au shell Render
2. Exécutez : `npx prisma migrate deploy`

## 📊 Monitoring et Logs

### Voir les logs

1. Allez dans votre service web sur Render
2. Cliquez sur "Logs"
3. Vous verrez les logs en temps réel

### Métriques

Render Free tier inclut :

- 750 heures/mois
- 512 MB RAM
- La base de données expire après 90 jours d'inactivité

## 🔐 Sécurité

### Variables d'environnement importantes

1. **JWT_SECRET** : Générez une clé forte
   ```bash
   openssl rand -base64 32
   ```

2. **CORS_ORIGIN** : En production, spécifiez vos domaines
   ```
   CORS_ORIGIN=https://foodly-admin.netlify.app,https://votre-app.com
   ```

3. **DATABASE_URL** : Utilisez toujours l'Internal Database URL pour de meilleures performances

## 🚨 Dépannage

### Le build échoue

**Problème** : Erreur lors de `npm install`
**Solution** : Vérifiez que `package.json` est correct et que toutes les dépendances sont listées

**Problème** : Erreur Prisma
**Solution** : Vérifiez que `DATABASE_URL` est correctement configuré

### L'application ne démarre pas

**Problème** : Port déjà utilisé
**Solution** : Render utilise automatiquement la variable `PORT`, assurez-vous que votre `main.ts`
utilise `process.env.PORT`

**Problème** : Erreur de connexion à la base de données
**Solution** : Utilisez l'**Internal Database URL** et non l'External

### L'API est lente

**Problème** : Le service Free tier s'endort après 15 minutes d'inactivité
**Solution** :

- Utilisez un service de ping (ex: UptimeRobot)
- Passez au plan payant ($7/mois) pour éviter le sleep

## 🔗 Connecter les applications clientes

### Application mobile Flutter

Modifiez l'URL de l'API dans votre code Flutter :

```dart
const String API_BASE_URL = 'https://foodly-api.onrender.com/api';
```

### Application admin Angular

Modifiez `environment.prod.ts` :

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://foodly-api.onrender.com/api'
};
```

## 📝 Checklist de déploiement

- [ ] Code poussé sur GitHub
- [ ] Base de données PostgreSQL créée sur Render
- [ ] Service web créé et configuré
- [ ] Variables d'environnement configurées
- [ ] Build réussi
- [ ] Migrations exécutées
- [ ] API accessible via HTTPS
- [ ] Swagger docs fonctionnel
- [ ] Test de création d'utilisateur réussi
- [ ] CORS configuré pour vos domaines
- [ ] Applications clientes connectées à la nouvelle URL

## 🎉 Félicitations !

Votre backend Foodly est maintenant déployé en production sur Render ! 🚀

**URL de l'API** : `https://foodly-api.onrender.com/api`
**Documentation** : `https://foodly-api.onrender.com/api/docs`
