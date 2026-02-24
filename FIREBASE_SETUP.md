# 🔥 Configuration Firebase Cloud Messaging (FCM) pour Foodly

Ce guide vous explique comment configurer Firebase Cloud Messaging pour envoyer des notifications push dans l'application Foodly.

---

## 📋 Étape 1: Créer un Projet Firebase

1. **Allez sur [Firebase Console](https://console.firebase.google.com/)**
2. **Cliquez sur "Ajouter un projet"**
3. **Nom du projet:** `Foodly` (ou le nom de votre choix)
4. **Activez Google Analytics** (optionnel mais recommandé)
5. **Cliquez sur "Créer le projet"**

---

## 📱 Étape 2: Ajouter l'Application Android/iOS

### Pour Android (Flutter):
1. Dans la console Firebase, cliquez sur **"Ajouter une application"** → **Android**
2. **Nom du package Android:** `com.example.foodly` (ou votre package name)
3. **Téléchargez le fichier `google-services.json`**
4. **Placez-le dans:** `/foodly/android/app/google-services.json`

### Pour iOS (si nécessaire):
1. Cliquez sur **"Ajouter une application"** → **iOS**
2. **Bundle ID:** `com.example.foodly`
3. **Téléchargez `GoogleService-Info.plist`**
4. **Placez-le dans:** `/foodly/ios/Runner/GoogleService-Info.plist`

---

## 🔑 Étape 3: Générer la Clé Privée pour le Backend

1. Dans Firebase Console, allez dans **⚙️ Paramètres du projet** (en haut à gauche)
2. Allez dans l'onglet **"Comptes de service"**
3. Cliquez sur **"Générer une nouvelle clé privée"**
4. Un fichier JSON sera téléchargé (ex: `foodly-firebase-adminsdk-xxxxx.json`)

**Contenu du fichier JSON:**
```json
{
  "type": "service_account",
  "project_id": "foodly-xxxxx",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nXXXXX\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@foodly-xxxxx.iam.gserviceaccount.com",
  "client_id": "xxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

---

## 🔧 Étape 4: Configurer les Variables d'Environnement

1. **Ouvrez le fichier `.env` dans `foodly_back/`**
2. **Ajoutez les variables suivantes:**

```env
# Firebase Cloud Messaging (FCM)
FIREBASE_PROJECT_ID="foodly-xxxxx"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@foodly-xxxxx.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXXX\n-----END PRIVATE KEY-----"
```

**⚠️ IMPORTANT:**
- Copiez la valeur de `project_id` du fichier JSON → `FIREBASE_PROJECT_ID`
- Copiez la valeur de `client_email` → `FIREBASE_CLIENT_EMAIL`
- Copiez la valeur de `private_key` → `FIREBASE_PRIVATE_KEY`
- **Gardez les `\n` dans la clé privée** (ils sont importants)

---

## 📦 Étape 5: Installer les Dépendances Flutter

Dans le projet Flutter (`/foodly`), ajoutez les packages FCM:

```bash
cd foodly
flutter pub add firebase_core firebase_messaging
```

---

## 🔔 Étape 6: Configurer FCM dans Flutter

### 1. Modifier `android/build.gradle`:
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

### 2. Modifier `android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'
```

### 3. Créer un service FCM dans Flutter:

**Fichier: `lib/helpers/services/fcm_service.dart`**
```dart
import 'package:firebase_messaging/firebase_messaging.dart';

class FCMService {
  static final FirebaseMessaging _messaging = FirebaseMessaging.instance;

  static Future<void> initialize() async {
    // Demander la permission
    NotificationSettings settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      print('✅ FCM Permission granted');
    }

    // Récupérer le token FCM
    String? token = await _messaging.getToken();
    print('📱 FCM Token: $token');
    
    // TODO: Envoyer ce token au backend pour le stocker dans la DB
    
    // Écouter les messages en foreground
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('📩 Message reçu: ${message.notification?.title}');
      // TODO: Afficher une notification locale
    });

    // Écouter les clics sur les notifications
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      print('🔔 Notification cliquée: ${message.data}');
      // TODO: Naviguer vers l'écran approprié
    });
  }
}
```

### 4. Initialiser FCM dans `main.dart`:
```dart
import 'package:firebase_core/firebase_core.dart';
import 'package:foodly/helpers/services/fcm_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialiser Firebase
  await Firebase.initializeApp();
  
  // Initialiser FCM
  await FCMService.initialize();
  
  runApp(MyApp());
}
```

---

## 🧪 Étape 7: Tester l'Envoi de Notifications

### Test depuis le Backend:

**1. Démarrez le backend:**
```bash
cd foodly_back
npm run start:dev
```

**2. Récupérez le token FCM depuis l'app Flutter** (affiché dans les logs)

**3. Testez avec Postman ou curl:**
```bash
POST http://localhost:8080/notifications/test
Content-Type: application/json

{
  "token": "VOTRE_TOKEN_FCM_ICI"
}
```

**Réponse attendue:**
```json
{
  "success": true,
  "messageId": "projects/foodly-xxxxx/messages/xxxxx"
}
```

---

## 📋 API Endpoints Disponibles

### 1. Envoyer une notification simple
```
POST /notifications/send
{
  "token": "fcm_token",
  "title": "Titre",
  "message": "Message",
  "data": { "key": "value" }
}
```

### 2. Envoyer à plusieurs appareils
```
POST /notifications/send-multiple
{
  "tokens": ["token1", "token2"],
  "title": "Titre",
  "message": "Message"
}
```

### 3. Test rapide
```
POST /notifications/test
{
  "token": "fcm_token"
}
```

---

## 🔗 Intégration avec les Commandes

Le service de notifications est déjà prêt pour:

1. **Nouvelle commande créée** → Notifier le serveur
2. **Changement de statut** → Notifier le client/serveur
3. **Commande prête** → Notifier le serveur

**Exemple d'utilisation dans OrdersService:**
```typescript
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    private notificationsService: NotificationsService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const order = await this.prisma.order.create({...});
    
    // Envoyer notification
    await this.notificationsService.sendNewOrderNotification(
      serverFcmToken,
      {
        orderId: order.id,
        tableNumber: order.tableNumber,
        totalAmount: order.totalAmount,
        itemCount: order.items.length,
      }
    );
    
    return order;
  }
}
```

---

## ✅ Checklist de Configuration

- [ ] Projet Firebase créé
- [ ] Application Android/iOS ajoutée
- [ ] `google-services.json` placé dans `/foodly/android/app/`
- [ ] Clé privée Firebase générée
- [ ] Variables d'environnement ajoutées dans `.env`
- [ ] Packages Flutter installés (`firebase_core`, `firebase_messaging`)
- [ ] FCM initialisé dans `main.dart`
- [ ] Test de notification réussi

---

## 🆘 Dépannage

### Erreur: "Error sending notification"
- Vérifiez que les variables d'environnement sont correctes
- Vérifiez que le token FCM est valide (il expire après quelques mois)

### Notifications non reçues sur Android
- Vérifiez que `google-services.json` est bien placé
- Vérifiez les permissions dans `AndroidManifest.xml`

### Erreur: "PERMISSION_DENIED"
- Vérifiez que FCM est activé dans Firebase Console
- Vérifiez que la clé privée est correcte

---

## 📚 Ressources

- [Firebase Console](https://console.firebase.google.com/)
- [Documentation Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Documentation Firebase Messaging Flutter](https://firebase.flutter.dev/docs/messaging/overview/)

---

**🎉 Votre système de notifications push est maintenant configuré !**
