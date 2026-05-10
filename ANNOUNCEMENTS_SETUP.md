# 🔧 Configuration du système d'annonces

## 📋 Étapes de déploiement

### 1. Migration de la base de données

```bash
cd /Users/sahelys/AndroidStudioProjects/solidar/foodly/foodly_back

# Générer la migration
npx prisma migrate dev --name add_announcements

# Ou sur le serveur
npx prisma migrate deploy
```

### 2. Générer le module Announcements

```bash
# Générer le module
nest g module announcements

# Générer le controller
nest g controller announcements

# Générer le service
nest g service announcements
```

### 3. Créer les DTOs

Créer les fichiers suivants :
- `src/announcements/dto/create-announcement.dto.ts`
- `src/announcements/dto/update-announcement.dto.ts`

### 4. Redémarrer le backend

```bash
# En local
npm run start:dev

# Sur le serveur
npm run build
pm2 restart foodly-back
```

## 🎯 Endpoints disponibles

### GET /api/announcements/active/:restaurantId
Récupère toutes les annonces actives d'un restaurant

**Réponse:**
```json
[
  {
    "id": "uuid",
    "title": "Promotion spéciale",
    "description": "50% sur tous les plats",
    "imageUrl": "https://...",
    "isActive": true,
    "link": null,
    "validFrom": "2026-04-01T00:00:00.000Z",
    "validUntil": "2026-04-30T00:00:00.000Z",
    "displayOrder": 0
  }
]
```

### POST /api/announcements
Créer une nouvelle annonce (Admin uniquement)

**Body:**
```json
{
  "restaurantId": "uuid",
  "title": "Titre de l'annonce",
  "description": "Description",
  "imageUrl": "https://...",
  "isActive": true,
  "validFrom": "2026-04-01",
  "validUntil": "2026-04-30",
  "displayOrder": 0
}
```

### PATCH /api/announcements/:id
Mettre à jour une annonce

### DELETE /api/announcements/:id
Supprimer une annonce

## 📱 Intégration Flutter

Dans `DashboardController`, ajouter :

```dart
RxList<AnnouncementModel> announcements = <AnnouncementModel>[].obs;

Future<void> fetchAnnouncements() async {
  try {
    final restaurantId = await LocalStorage.getRestaurantId();
    if (restaurantId == null) return;
    
    final response = await _dio.get(
      '${AppConstant.baseURl}/announcements/active/$restaurantId',
    );
    
    if (response.statusCode == 200 && response.data != null) {
      announcements.value = (response.data as List)
          .map((json) => AnnouncementModel.fromJson(json))
          .toList();
    }
  } catch (e) {
    print('Erreur chargement annonces: $e');
  }
}
```

## 🎨 Foodly Admin

Créer la section "Annonces" dans le sidebar avec :
- Liste des annonces
- Formulaire de création/édition
- Upload d'image
- Activation/désactivation
- Ordre d'affichage
