# Guide de Déploiement - Les Rois des Bois

## 📋 Prérequis

- Docker & Docker Compose installés
- Git
- Accès à MongoDB (local ou cloud)
- SMTP credentials (pour emails)

## 🚀 Déploiement avec Docker

### 1. Configuration

Créer un fichier `.env` à la racine du projet :

```env
# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# MongoDB (pour connexion externe si nécessaire)
MONGODB_URI=mongodb://localhost:27017/les-rois-des-bois

# SMTP (pour emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@lesroisdesbois.com

# Redis (pour job queue)
REDIS_HOST=redis
REDIS_PORT=6379

# Frontend URL
FRONTEND_URL=http://localhost:80
```

### 2. Build et Démarrage

```bash
# Build toutes les images
docker-compose build

# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ supprime les données)
docker-compose down -v
```

### 3. Services Disponibles

- **Frontend** : http://localhost
- **Backend API** : http://localhost:5000
- **MongoDB** : localhost:27017
- **Redis** : localhost:6379

### 4. Initialisation

Après le premier démarrage :

```bash
# Créer l'admin
docker-compose exec backend npm run create-admin

# Seed les données (optionnel)
docker-compose exec backend npm run seed
```

## 📦 Déploiement Manuel

### Backend

```bash
cd backend
npm install
npm run dev  # Développement
# ou
npm start    # Production
```

### Frontend

```bash
cd frontend
npm install
npm run dev  # Développement
# ou
npm run build
npm run preview  # Production
```

## 🌐 Variables d'Environnement

Voir `backend/.env.example` pour la liste complète.

## 🔒 Sécurité

1. **Changez JWT_SECRET** en production
2. **Utilisez HTTPS** en production
3. **Configurez firewall** pour MongoDB
4. **Sauvegardez régulièrement** la base de données
5. **Utilisez variables d'environnement** sensibles

## 📝 Notes

- Les fichiers uploads sont persistés dans `./backend/uploads`
- MongoDB data est persisté dans volume Docker
- Redis data est persisté dans volume Docker

## 🐛 Troubleshooting

### MongoDB ne démarre pas
```bash
docker-compose logs mongodb
```

### Backend ne peut pas se connecter à MongoDB
Vérifiez `MONGODB_URI` dans `.env`

### Frontend ne charge pas
Vérifiez les logs nginx :
```bash
docker-compose logs frontend
```

