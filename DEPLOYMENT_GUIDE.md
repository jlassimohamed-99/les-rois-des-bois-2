# Guide de Déploiement - Les Rois des Bois

## 🖥️ Déploiement Manuel

### Backend

```bash
cd backend
npm install

# Créer .env avec les variables
cp .env.example .env
# Éditer .env avec vos valeurs

# Démarrer MongoDB localement ou utiliser MongoDB Atlas
# Démarrer Redis localement

# Démarrer le serveur
npm run dev  # Development
npm start    # Production
```

### Frontend

```bash
cd frontend
npm install

# Créer .env avec VITE_API_URL
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Build pour production
npm run build

# Serveur de production (avec serve par exemple)
npx serve -s dist -p 80
```

---

## 📝 Variables d'Environnement Détaillées

### Backend (.env)

```env
# Server
NODE_ENV=production
PORT=5000
FRONTEND_URL=http://localhost

# Database
MONGODB_URI=mongodb://localhost:27017/les-rois-des-bois
# Ou pour MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/les-rois-des-bois

# JWT
JWT_SECRET=changez-moi-en-production-64-caracteres-minimum
JWT_EXPIRE=7d

# Redis (optionnel pour job queue)
REDIS_HOST=localhost
REDIS_PORT=6379
USE_JOB_QUEUE=false  # Mettre à true si Redis disponible

# SMTP (optionnel pour emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@lesroisdesbois.com

# File Uploads (optionnel)
UPLOAD_MAX_SIZE=10485760  # 10MB
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔧 Post-Déploiement

### 1. Créer Admin

```bash
cd backend
npm run create-admin
```

### 2. Vérifier Services

- ✅ Backend répond sur port 5000
- ✅ Frontend accessible
- ✅ MongoDB connecté
- ✅ Redis accessible (si utilisé)

### 3. Premier Login

- Email : admin@lesroisdesbois.com
- Password : admin123
- **⚠️ Changer le mot de passe immédiatement !**

---

## 🚀 Déploiement Production

### Recommandations :

1. **Sécurité** :
   - Changez tous les mots de passe par défaut
   - Utilisez un JWT_SECRET fort et unique
   - Configurez HTTPS (reverse proxy avec Nginx)
   - Activez le rate limiting

2. **Performance** :
   - Utilisez MongoDB Atlas pour la base de données
   - Configurez Redis pour le cache
   - Activez la compression gzip
   - Utilisez un CDN pour les assets statiques

3. **Monitoring** :
   - Configurez les logs
   - Surveillez l'utilisation des ressources
   - Configurez des alertes

---

## 📞 Support

Pour toute question de déploiement, consultez :
- `HOW_IT_WORKS.md` - Fonctionnement du système
- `TESTING_GUIDE.md` - Guide de test complet

