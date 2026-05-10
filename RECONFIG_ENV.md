# 🔧 Reconfiguration des variables d'environnement

## ⚠️ Problème

Après le déploiement, certaines variables d'environnement ont été supprimées du fichier `.env` sur le serveur.

## ✅ Solution

Sur le serveur (`japonais@japa:~/rimvie/foodly/back`), éditez le fichier `.env` :

```bash
nano .env
```

### 1. Cloudinary (OBLIGATOIRE pour l'upload d'images)

Ajoutez ces lignes :

```env
# Cloudinary
CLOUDINARY_CLOUD_NAME="dhqyjvlop"
CLOUDINARY_API_KEY="621627373235425"
CLOUDINARY_API_SECRET="hK4lMaYS5xRnKrWs_i__goRIUeM"
```

### 2. Firebase (OPTIONNEL pour les notifications push)

Si vous avez les credentials Firebase, ajoutez :

```env
# Firebase Cloud Messaging (FCM)
FIREBASE_PROJECT_ID="votre-firebase-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@votre-project-id.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVotre clé privée ici\n-----END PRIVATE KEY-----"
```

**Note** : Si vous n'avez pas Firebase, ce n'est pas grave. Les notifications ne seront simplement pas envoyées (vous verrez le message "⚠️ Firebase not configured").

### 3. Redémarrer le backend

```bash
pm2 restart foodly-back
```

## 🔑 Erreur JWT "restaurantId is missing"

Cette erreur apparaît car les utilisateurs connectés ont des **anciens tokens JWT** qui ne contiennent pas le `restaurantId`.

### Solution

**Les utilisateurs doivent se déconnecter et se reconnecter** pour obtenir un nouveau token avec le `restaurantId`.

Dans foodly_admin et foodly_technique :
1. Cliquer sur "Déconnexion"
2. Se reconnecter avec les identifiants

Le nouveau token contiendra le `restaurantId` et l'erreur disparaîtra.

## 📋 Checklist complète

- [ ] Cloudinary configuré dans `.env`
- [ ] Firebase configuré dans `.env` (optionnel)
- [ ] Backend redémarré (`pm2 restart foodly-back`)
- [ ] Tous les utilisateurs se sont déconnectés/reconnectés
- [ ] Test d'upload d'image fonctionne
- [ ] Plus d'erreur "restaurantId is missing"

## 🧪 Vérification

### 1. Vérifier que Cloudinary est configuré

```bash
curl http://localhost:5001/api/upload/test
```

Devrait retourner :
```json
{
  "message": "Test endpoint working",
  "cloudinary": {
    "configured": true
  }
}
```

### 2. Vérifier les logs

```bash
pm2 logs foodly-back --lines 50
```

Vous ne devriez plus voir :
- ❌ "restaurantId is missing from JWT token"
- ❌ "Invalid Signature" (Cloudinary)

Vous pourriez encore voir (c'est normal si Firebase n'est pas configuré) :
- ⚠️ "Firebase not configured. Notification not sent."

## 💾 Template complet du fichier .env

Voici un template complet pour référence :

```env
# Database
DATABASE_URL="postgresql://postgres:12345678@102.180.50.92:5432/foodly?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="7d"

# Server
PORT=5001
NODE_ENV=production

# CORS
CORS_ORIGIN="http://localhost:4200,http://localhost:3000"

# Cloudinary (OBLIGATOIRE)
CLOUDINARY_CLOUD_NAME="dhqyjvlop"
CLOUDINARY_API_KEY="621627373235425"
CLOUDINARY_API_SECRET="hK4lMaYS5xRnKrWs_i__goRIUeM"

# Firebase Cloud Messaging (OPTIONNEL)
FIREBASE_PROJECT_ID="votre-firebase-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@votre-project-id.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVotre clé privée\n-----END PRIVATE KEY-----"
```

## 🚀 Après reconfiguration

1. **Redémarrer le backend** : `pm2 restart foodly-back`
2. **Vérifier les logs** : `pm2 logs foodly-back`
3. **Se reconnecter** dans foodly_admin et foodly_technique
4. **Tester l'upload** d'une image de produit
5. **Vérifier** qu'il n'y a plus d'erreurs

## 📞 Support

Si vous rencontrez toujours des problèmes après avoir suivi ces étapes, vérifiez :
- Les logs du backend : `pm2 logs foodly-back`
- La console du navigateur (F12) dans foodly_admin
- Que le fichier `.env` est bien dans `/home/japonais/rimvie/foodly/back/`
