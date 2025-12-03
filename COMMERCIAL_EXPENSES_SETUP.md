# Commercial Expenses - Setup & Implementation Guide

## ✅ Ce qui a été implémenté

### Backend

1. **Modèles de base de données mis à jour**
   - ✅ `ExpenseCategory` - Ajout de `isCommercialExpense` et `subcategories`
   - ✅ `Expense` - Ajout de `commercialId`, `subcategory`, `customSubcategory`

2. **Contrôleurs**
   - ✅ `expense.controller.js` - Validation et support pour dépenses commerciales
   - ✅ Filtrage par `commercialId` et `subcategory`

3. **Routes**
   - ✅ `POST /api/uploads/expense/receipt` - Upload de reçus (images/PDF)
   - ✅ Routes expense existantes mises à jour

4. **Scripts**
   - ✅ `initCommercialExpenseCategory.js` - Script d'initialisation

### Frontend

1. **ExpenseModal mis à jour**
   - ✅ Détection automatique de la catégorie "Commercial Expenses"
   - ✅ Sélecteur de commercial
   - ✅ Dropdown de sous-catégories (Fuel, Toll, Transport, Other)
   - ✅ Champ texte libre pour "Autre"
   - ✅ Upload de reçu avec prévisualisation
   - ✅ Validation en temps réel

2. **ExpensesList**
   - ✅ Bouton pour gérer les catégories
   - ✅ Génération de PDF mensuel

3. **ExpenseCategories**
   - ✅ Page complète de gestion des catégories

---

## 🚀 Étapes pour démarrer

### 1. Initialiser la catégorie Commercial Expenses

```bash
cd backend
npm run init-commercial-expenses
```

Cette commande crée automatiquement la catégorie "Commercial Expenses" avec les sous-catégories:
- Fuel
- Frais péage autoroute (toll)
- Transport
- Autre (other)

### 2. Démarrer les serveurs

```bash
# Backend
cd backend
npm run dev

# Frontend (dans un autre terminal)
cd frontend
npm run dev
```

### 3. Tester les dépenses commerciales

1. Aller à `/admin/expenses`
2. Cliquer sur "إضافة مصروف"
3. Sélectionner "Commercial Expenses" dans la catégorie
4. Remplir les champs:
   - Sélectionner un commercial
   - Choisir le type de dépense (Fuel, Toll, Transport, Other)
   - Si "Other" → entrer la description
   - Uploader un reçu (obligatoire)
   - Montant et date

---

## 📝 Structure des sous-catégories

Les sous-catégories sont définies comme suit:
- `fuel` → "Fuel"
- `toll` → "Frais péage autoroute"
- `transport` → "Transport"
- `other` → "Autre" (nécessite un champ texte libre)

---

## 🎯 Fonctionnalités implémentées

### Dépenses commerciales
- ✅ Catégorie spéciale "Commercial Expenses"
- ✅ Sous-catégories dynamiques
- ✅ Liaison avec le commercial
- ✅ Upload de reçu (image ou PDF)
- ✅ Validation complète

### Gestion des catégories
- ✅ CRUD complet pour les catégories
- ✅ Réordonnancement
- ✅ Validation (prévention des doublons)

---

## ⚠️ À implémenter (Phase 2)

### Dashboard Analytics (Partie 2 de la demande)

#### Backend
1. **Controller Analytics** (`backend/controllers/commercialAnalytics.controller.js`)
   - Calcul des métriques de performance
   - Agrégation des données de ventes
   - Calcul des dépenses par commercial
   - Métriques de productivité

2. **Routes Analytics** (`backend/routes/commercialAnalytics.routes.js`)
   - `GET /api/analytics/commercials` - Liste avec métriques
   - `GET /api/analytics/commercials/:id` - Détails d'un commercial
   - `GET /api/analytics/commercials/:id/expenses` - Dépenses détaillées
   - `GET /api/analytics/commercials/:id/sales` - Performance de ventes
   - `GET /api/analytics/commercials/:id/productivity` - Productivité
   - `GET /api/analytics/commercials/compare` - Comparaison
   - `GET /api/analytics/commercials/:id/export` - Export PDF/Excel

#### Frontend
1. **Dashboard Analytics** (`frontend/src/pages/Analytics/CommercialAnalyticsDashboard.jsx`)
   - Cartes KPI en haut
   - Graphiques de performance
   - Tableau de comparaison
   - Filtres et sélecteurs de dates

2. **Page de détails** (`frontend/src/pages/Analytics/CommercialDetail.jsx`)
   - Vue complète d'un commercial
   - Tous les graphiques et métriques
   - Timeline d'activités

3. **Composants de visualisation**
   - KPICard
   - SalesPerformanceChart
   - ExpenseBreakdownChart
   - ComparisonTable

---

## 📊 Métriques à calculer

### Performance des ventes
- Total revenue par commercial
- Nombre total de commandes
- Valeur moyenne des commandes
- Nouveaux clients acquis
- Clients récurrents
- Taux de conversion
- Graphiques jour/semaine/mois

### Dépenses
- Total des dépenses par commercial
- Par sous-catégorie (Fuel, Toll, Transport, Other)
- Tendances mensuelles
- Ratio dépenses/revenus
- Profitabilité (Revenus - Dépenses)

### Productivité
- Appels effectués
- Leads ajoutés
- Devis envoyés
- Taux de conversion devis → commande
- Temps de réponse moyen

---

## 🔧 Configuration requise

### Backend
Toutes les dépendances sont déjà installées.

### Frontend
```bash
# Installer si nécessaire
npm install react-datepicker xlsx jspdf jspdf-autotable
```

---

## 📁 Fichiers créés/modifiés

### Backend ✅
- `backend/models/ExpenseCategory.model.js` - ✅ Mis à jour
- `backend/models/Expense.model.js` - ✅ Mis à jour
- `backend/controllers/expense.controller.js` - ✅ Mis à jour
- `backend/routes/upload.routes.js` - ✅ Mis à jour
- `backend/routes/expenseCategory.routes.js` - ✅ Créé
- `backend/controllers/expenseCategory.controller.js` - ✅ Créé
- `backend/scripts/initCommercialExpenseCategory.js` - ✅ Créé
- `backend/services/expensePdfService.js` - ✅ Créé
- `backend/routes/expense.routes.js` - ✅ Mis à jour
- `backend/server.js` - ✅ Route ajoutée

### Frontend ✅
- `frontend/src/pages/Expenses/ExpenseModal.jsx` - ✅ Mis à jour (support commercial expenses)
- `frontend/src/pages/Expenses/ExpensesList.jsx` - ✅ Mis à jour
- `frontend/src/pages/Expenses/ExpenseCategories.jsx` - ✅ Créé
- `frontend/src/App.jsx` - ✅ Routes ajoutées

### Frontend ⚠️ À créer
- `frontend/src/pages/Analytics/CommercialAnalyticsDashboard.jsx`
- `frontend/src/pages/Analytics/CommercialDetail.jsx`
- `frontend/src/components/Analytics/` (divers composants de graphiques)

### Backend ⚠️ À créer
- `backend/controllers/commercialAnalytics.controller.js`
- `backend/routes/commercialAnalytics.routes.js`

---

## 🎨 Interface utilisateur

### ExpenseModal - Dépenses commerciales

Quand "Commercial Expenses" est sélectionné:
1. **Sélecteur de commercial** (requis)
   - Liste déroulante avec tous les commerciaux
   - Affiche nom et email

2. **Type de dépense** (requis)
   - Fuel
   - Frais péage autoroute
   - Transport
   - Autre → affiche un champ texte libre

3. **Upload de reçu** (requis)
   - Support images (jpg, png, gif, webp)
   - Support PDF
   - Prévisualisation pour images
   - Indicateur pour PDF
   - Limite: 10MB

4. **Autres champs**
   - Montant
   - Date
   - Notes (optionnel)

---

## 🔒 Validation

### Dépenses commerciales
- ✅ Commercial requis
- ✅ Sous-catégorie requise
- ✅ Si "Autre" → description requise
- ✅ Reçu requis (image ou PDF)
- ✅ Taille max: 10MB

### Général
- ✅ Catégorie requise
- ✅ Montant requis (> 0)
- ✅ Date requise

---

## 📱 Responsive

Tous les composants sont responsive et fonctionnent sur mobile.

---

## 🧪 Test rapide

1. **Créer une catégorie Commercial Expenses:**
   ```bash
   cd backend
   npm run init-commercial-expenses
   ```

2. **Tester l'ajout d'une dépense:**
   - Aller à `/admin/expenses`
   - Cliquer "إضافة مصروف"
   - Sélectionner "Commercial Expenses"
   - Vérifier que les champs spéciaux apparaissent

3. **Vérifier les filtres:**
   - Filtrer par catégorie
   - Filtrer par commercial (quand implémenté dans ExpensesList)

---

## 📞 Support

Pour toute question ou problème:
1. Vérifier les logs backend
2. Vérifier la console navigateur
3. Vérifier que la catégorie Commercial Expenses existe

---

## 🚧 Prochaines étapes (Analytics Dashboard)

Voir `COMMERCIAL_EXPENSES_IMPLEMENTATION.md` pour les détails complets de l'implémentation du dashboard analytics.


