# 🔧 Correction de la gestion des tokens FCM invalides

## ❌ Problème

Les logs affichaient constamment cette erreur :
```
❌ Error sending notification: FirebaseMessagingError: Requested entity was not found.
messaging/registration-token-not-registered
```

Cette erreur apparaît quand un utilisateur a un **token FCM invalide** dans la base de données (désinstallation de l'app, cache vidé, token expiré, etc.).

## ✅ Solution implémentée

### 1. Modification de `notifications.service.ts`

- **Avant** : L'erreur était lancée (`throw error`) et affichée dans les logs
- **Après** : L'erreur est capturée et retourne un objet avec `invalidToken: true`

```typescript
// Gérer les tokens invalides ou non enregistrés
if (error.code === 'messaging/registration-token-not-registered' || 
    error.code === 'messaging/invalid-registration-token') {
  console.warn('⚠️  Invalid or unregistered FCM token. Token should be removed from database.');
  return { success: false, error: error.message, invalidToken: true };
}
```

### 2. Modification de `orders.service.ts`

- **Avant** : Le token invalide restait dans la base de données
- **Après** : Le token invalide est **automatiquement supprimé** de la base de données

```typescript
// Si le token est invalide, le supprimer de la base de données
if (notificationResult?.invalidToken) {
  console.log(`🗑️  Removing invalid FCM token for user ${updatedOrder.server.id}`);
  await this.prisma.user.update({
    where: { id: updatedOrder.server.id },
    data: { fcmToken: null },
  });
}
```

## 🚀 Déploiement

### Sur votre machine locale

```bash
# Les fichiers sont déjà modifiés
cd /Users/sahelys/AndroidStudioProjects/solidar/foodly/foodly_back
```

### Sur le serveur

```bash
# Copier les fichiers modifiés
scp src/notifications/notifications.service.ts japonais@japa:~/rimvie/foodly/back/src/notifications/
scp src/orders/orders.service.ts japonais@japa:~/rimvie/foodly/back/src/orders/

# Se connecter au serveur
ssh japonais@japa

# Aller dans le dossier du backend
cd ~/rimvie/foodly/back

# Rebuild
npm run build

# Redémarrer
pm2 restart foodly-back

# Vérifier les logs
pm2 logs foodly-back --lines 30
```

## 📊 Résultat attendu

### Avant
```
❌ Error sending notification: FirebaseMessagingError: Requested entity was not found.
[Stack trace complet de 15 lignes]
Erreur lors de l'envoi de la notification: FirebaseMessagingError: Requested entity was not found.
[Stack trace complet de 15 lignes encore]
```

### Après
```
⚠️  Invalid or unregistered FCM token. Token should be removed from database.
🗑️  Removing invalid FCM token for user abc-123-def
```

## 🎯 Avantages

1. **Logs plus propres** : Plus de stack traces de 30 lignes
2. **Auto-nettoyage** : Les tokens invalides sont automatiquement supprimés
3. **Performance** : Le système n'essaie plus d'envoyer des notifications à des tokens invalides
4. **Clarté** : Messages d'avertissement simples et compréhensibles

## 🔄 Cycle de vie d'un token FCM

1. **Utilisateur se connecte** → Token FCM généré et stocké
2. **Notification envoyée** → Succès ✅
3. **Utilisateur désinstalle l'app** → Token devient invalide
4. **Notification envoyée** → Échec ⚠️ → **Token supprimé automatiquement** 🗑️
5. **Utilisateur réinstalle l'app** → Nouveau token généré et stocké
6. **Notification envoyée** → Succès ✅

## 📝 Notes

- Les utilisateurs avec des tokens valides continuent de recevoir les notifications normalement
- Quand un utilisateur se reconnecte, un nouveau token est automatiquement généré
- Cette solution évite l'accumulation de tokens invalides dans la base de données

## ✅ Checklist de déploiement

- [ ] Fichiers copiés sur le serveur
- [ ] Backend rebuild (`npm run build`)
- [ ] Backend redémarré (`pm2 restart foodly-back`)
- [ ] Logs vérifiés (plus d'erreurs de stack trace)
- [ ] Test : changer le statut d'une commande
- [ ] Vérifier que le message est `⚠️ Invalid or unregistered FCM token` au lieu de l'erreur complète
