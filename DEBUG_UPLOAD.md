# 🔍 Guide de débogage - Upload d'images

## ✅ Changements effectués

### Backend (`foodly_back`)
- ✅ Ajout de logs détaillés dans `upload.controller.ts`
- ✅ Messages d'erreur plus explicites
- ✅ Credentials Cloudinary ajoutés au `.env` local

### Frontend (`foodly_admin`)
- ✅ Ajout de logs détaillés dans `image-upload.component.ts`
- ✅ Affichage des erreurs détaillées

## 🚀 Déploiement sur le serveur

### 1. Mettre à jour le backend sur le serveur

```bash
# Se connecter au serveur
ssh user@102.180.50.92

# Aller dans le dossier du backend
cd /chemin/vers/foodly_back

# Récupérer les dernières modifications (si vous utilisez Git)
git pull origin main

# Ou copier le fichier modifié
# scp src/upload/upload.controller.ts user@102.180.50.92:/chemin/vers/foodly_back/src/upload/

# Ajouter les credentials Cloudinary dans .env
nano .env
```

Ajoutez ces lignes dans le fichier `.env` :
```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=dhqyjvlop
CLOUDINARY_API_KEY=621627373235425
CLOUDINARY_API_SECRET=hK4lMaYS5xRnKrWs_i__goRIUeMES_IN
```

```bash
# Rebuild le backend
npm run build

# Redémarrer le backend
pm2 restart foodly-api
# ou
npm run start:prod

# Voir les logs en temps réel
pm2 logs foodly-api
```

### 2. Rebuild et redéployer le frontend

```bash
# Sur votre machine locale
cd /Users/sahelys/AndroidStudioProjects/solidar/foodly/foodly_admin

# Rebuild
npm run build

# Copier vers le serveur
scp -r dist/foodly_admin/* user@102.180.50.92:/var/www/foodly_admin/
```

## 🧪 Tests et diagnostic

### Test 1 : Vérifier que Cloudinary est configuré

Sur le serveur :
```bash
cd /chemin/vers/foodly_back
cat .env | grep CLOUDINARY
```

Vous devriez voir :
```
CLOUDINARY_CLOUD_NAME=dhqyjvlop
CLOUDINARY_API_KEY=621627373235425
CLOUDINARY_API_SECRET=hK4lMaYS5xRnKrWs_i__goRIUeMES_IN
```

### Test 2 : Vérifier les logs du backend

```bash
# Voir les logs en temps réel
pm2 logs foodly-api --lines 100

# ou si vous utilisez npm
# Les logs s'afficheront dans le terminal
```

Quand vous essayez d'uploader une image, vous devriez voir :
```
📤 Upload request received
File: { originalname: '...', mimetype: 'image/...', size: ... }
☁️  Uploading to Cloudinary...
✅ Upload successful: https://res.cloudinary.com/...
```

### Test 3 : Vérifier les logs du frontend

Ouvrez la console du navigateur (F12) et essayez d'uploader une image. Vous devriez voir :
```
📤 Starting upload... { fileName: '...', fileSize: ..., fileType: 'image/...' }
🔑 Token: Present
🌐 Upload URL: http://102.180.50.92:5001/api/upload/image
```

Si l'upload échoue, vous verrez :
```
❌ Upload error details: { status: 400, statusText: '...', error: {...}, message: '...' }
```

### Test 4 : Test avec curl

```bash
# D'abord, se connecter pour obtenir un token
curl -X POST http://102.180.50.92:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@chezfatou.bf","password":"admin123"}'

# Copier le token de la réponse
TOKEN="votre_token_ici"

# Tester l'upload
curl -X POST http://102.180.50.92:5001/api/upload/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/chemin/vers/une/image.jpg"
```

## 🔍 Erreurs possibles et solutions

### Erreur : "No file uploaded"
**Cause** : Le fichier n'arrive pas au backend
**Solution** : 
- Vérifier que le FormData contient bien le fichier
- Vérifier que le nom du champ est "file" (pas "image")

### Erreur : "Only image files are allowed"
**Cause** : Le type MIME du fichier n'est pas reconnu
**Solution** : 
- Vérifier que le fichier est bien une image (JPEG, PNG, WebP)
- Vérifier le type MIME dans les logs

### Erreur : "Failed to upload image: ..."
**Cause** : Erreur Cloudinary
**Solutions** :
1. Vérifier que les credentials Cloudinary sont corrects
2. Vérifier que le compte Cloudinary est actif
3. Vérifier les logs pour voir l'erreur exacte de Cloudinary

### Erreur 401 Unauthorized
**Cause** : Token JWT manquant ou invalide
**Solution** :
- Se reconnecter dans l'application
- Vérifier que le token est bien stocké dans localStorage
- Vérifier que le token est bien envoyé dans le header Authorization

## 📊 Checklist de vérification

- [ ] Credentials Cloudinary ajoutés dans `.env` du serveur
- [ ] Backend redémarré après modification du `.env`
- [ ] Code backend mis à jour avec les logs
- [ ] Code frontend mis à jour avec les logs
- [ ] Frontend rebuild et redéployé
- [ ] Logs backend visibles (pm2 logs ou terminal)
- [ ] Console navigateur ouverte (F12)
- [ ] Test d'upload effectué
- [ ] Logs analysés pour identifier l'erreur exacte

## 💡 Prochaines étapes

1. **Déployez les changements** sur le serveur
2. **Ouvrez la console** du navigateur (F12)
3. **Essayez d'uploader** une image
4. **Regardez les logs** dans la console et sur le serveur
5. **Partagez les logs** pour qu'on puisse identifier le problème exact

Les logs vous diront exactement où se situe le problème !
