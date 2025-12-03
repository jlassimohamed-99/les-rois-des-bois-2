# 🎯 Commercial Analytics Dashboard - Plan Complet

## 📋 Vue d'ensemble

Tableau de bord d'analytique commercial complet avec filtres avancés, visualisations interactives, et capacités d'export.

---

## 🗂️ Architecture Backend

### ✅ APIs Créées

**Base URL:** `/api/analytics/commercials/advanced`

#### 1. Vue d'ensemble des analytics
- **Endpoint:** `GET /overview`
- **Filtres:** commercialIds, orderSource, startDate, endDate, expenseCategory
- **Retour:** KPIs complets pour chaque commercial

#### 2. Revenus dans le temps
- **Endpoint:** `GET /revenue-over-time`
- **Filtres:** commercialIds, orderSource, startDate, endDate, groupBy
- **Retour:** Données pour graphique linéaire (POS vs E-commerce)

#### 3. Répartition des commandes
- **Endpoint:** `GET /orders-breakdown`
- **Retour:** Répartition POS vs E-commerce avec statuts

#### 4. Top produits
- **Endpoint:** `GET /top-products`
- **Filtres:** sourceView (pos/ecommerce/all), limit
- **Retour:** Meilleurs produits vendus

#### 5. Analytics des dépenses
- **Endpoint:** `GET /expense-analytics`
- **Retour:** Répartition par catégorie, tendances mensuelles, comparaison

#### 6. Table des commandes
- **Endpoint:** `GET /orders-table`
- **Pagination:** page, limit
- **Retour:** Liste paginée des commandes avec filtres

#### 7. Table des dépenses
- **Endpoint:** `GET /expenses-table`
- **Retour:** Liste paginée des dépenses

#### 8. Classement des commerciaux
- **Endpoint:** `GET /leaderboard`
- **Tri:** revenue, orders, profit, conversion, activity
- **Retour:** Classement avec rankings

#### 9. Analytics d'annulation
- **Endpoint:** `GET /cancellations`
- **Retour:** Annulations par source, raisons, top commerciaux

---

## 🎨 Architecture Frontend

### Composants à créer

#### 1. **AdvancedCommercialAnalyticsDashboard.jsx**
- Composant principal du tableau de bord
- Gère l'état global des filtres
- Coordonne tous les sous-composants

#### 2. **FiltersPanel.jsx**
- Filtres multi-sélection pour commerciaux
- Sélection de source de commande (All/E-commerce/POS)
- Sélecteur de plage de dates (Aujourd'hui/Semaine/Mois/Personnalisé)
- Filtre de catégorie de dépense
- Boutons Appliquer/Réinitialiser

#### 3. **KPICards.jsx**
- Cartes KPI individuelles réutilisables
- Mise à jour en temps réel basée sur les filtres
- Animations de chargement

#### 4. **RevenueChart.jsx**
- Graphique linéaire avec Recharts
- Deux lignes: POS Revenue et E-commerce Revenue
- Légende interactive

#### 5. **OrdersBreakdownChart.jsx**
- Graphique en barres
- Boutons de bascule pour afficher/masquer POS/E-commerce

#### 6. **TopProductsChart.jsx**
- Graphique en barres horizontal
- Onglets pour POS/E-commerce/Combiné
- Affichage top N produits

#### 7. **ExpenseAnalyticsCharts.jsx**
- Graphique en donut pour répartition
- Graphique linéaire pour tendances mensuelles
- Table de comparaison entre commerciaux

#### 8. **CommercialLeaderboard.jsx**
- Table avec tri
- Colonnes: Rang, Nom, Revenus, Commandes, Profit, Taux de conversion
- Navigation vers profil détaillé

#### 9. **CancellationAnalytics.jsx**
- Graphique en barres pour source
- Graphique en camembert pour raisons
- Table des commerciaux avec plus haut taux

#### 10. **OrdersTable.jsx**
- Table paginée avec tri
- Filtres intégrés
- Export CSV/Excel

#### 11. **ExpensesTable.jsx**
- Table paginée
- Affichage des reçus (images)
- Export

#### 12. **CommercialProfile.jsx**
- Page détaillée d'un commercial
- Toutes les commandes et dépenses
- Graphiques de performance mensuelle
- Historique client

---

## 📊 Structure des Données

### Format de réponse API - Overview

```json
{
  "success": true,
  "data": [
    {
      "commercialId": "string",
      "commercialName": "string",
      "commercialEmail": "string",
      "totalRevenue": 0,
      "totalOrders": 0,
      "ecommerceOrders": 0,
      "posOrders": 0,
      "canceledOrders": 0,
      "averageOrderValue": 0,
      "totalCustomersReached": 0,
      "ecommerceRevenue": 0,
      "posRevenue": 0,
      "ecommerceShare": 0,
      "posShare": 0,
      "conversionRate": 0,
      "totalExpenses": 0,
      "expensesByType": {
        "fuel": 0,
        "toll": 0,
        "transport": 0,
        "other": 0
      },
      "profit": 0,
      "expenseToRevenueRatio": 0
    }
  ],
  "filters": {
    "commercialIds": "all",
    "orderSource": "all",
    "startDate": "2025-01-01",
    "endDate": "2025-12-31",
    "expenseCategory": "all"
  }
}
```

---

## 🎯 Filtres Disponibles

### 1. Commercial Filter
- Type: Multi-select dropdown
- Options: Tous les commerciaux + "All"
- Format API: `commercialIds=id1,id2,id3` ou `commercialIds=all`

### 2. Order Source Filter
- Type: Radio buttons / Tabs
- Options:
  - `all` - Toutes les commandes
  - `ecommerce` - Commandes e-commerce uniquement
  - `pos` - Commandes POS uniquement
- Format API: `orderSource=all|ecommerce|pos`

### 3. Date Range Filter
- Type: Sélecteur de dates avec presets
- Presets:
  - Aujourd'hui
  - Cette semaine
  - Ce mois
  - Personnalisé (date picker)
- Format API: `startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

### 4. Expense Category Filter
- Type: Dropdown
- Options:
  - `all` - Toutes les catégories
  - `fuel` - Carburant
  - `toll` - Péage
  - `transport` - Transport
  - `other` - Autre
- Format API: `expenseCategory=all|fuel|toll|transport|other`

---

## 📈 KPIs Affichés

### Sales KPIs
1. **Total Revenue** - Revenu total
2. **Number of Orders** - Nombre de commandes
3. **Average Order Value** - Valeur moyenne par commande
4. **Orders Cancelled** - Commandes annulées
5. **Conversion Rate** - Taux de conversion
6. **Total Customers Reached** - Nombre de clients uniques
7. **POS vs E-commerce Share** - Pourcentage par source

### Expense KPIs
1. **Total Commercial Expenses** - Total des dépenses
2. **Expenses by Type** - Par type (Fuel, Toll, Transport, Other)
3. **Profit** - Revenus - Dépenses
4. **Expense-to-Revenue Ratio** - Ratio dépenses/revenus

### Commercial Performance KPIs
1. **Leads Added** - Leads ajoutés (placeholder)
2. **Quotes Sent** - Devis envoyés (placeholder)
3. **Quote → Order Conversion** - Taux de conversion (placeholder)
4. **Follow-up Performance** - Performance suivi (placeholder)
5. **Activity Timeline Score** - Score d'activité (placeholder)

---

## 🎨 Design UI/UX

### Couleurs
- Primaire: #FFD700 (Or)
- Secondaire: #FFA500 (Orange)
- Succès: #27ae60 (Vert)
- Erreur: #e74c3c (Rouge)
- Info: #3498db (Bleu)
- Fond: #f8f9fa (Gris clair)

### Composants
- Cards avec ombres douces
- Graphiques interactifs avec Recharts
- Tables avec pagination et tri
- Modales pour détails
- Loading states avec skeletons
- Toast notifications pour feedback

---

## 📦 Fonctionnalités à Implémenter

### Phase 1: Backend ✅
- [x] APIs avec filtres avancés
- [x] Calcul des KPIs
- [x] Endpoints pour graphiques
- [ ] Tests unitaires

### Phase 2: Frontend Core
- [ ] Composant de filtres
- [ ] Cartes KPI
- [ ] Graphiques de base
- [ ] Tables avec pagination

### Phase 3: Visualisations Avancées
- [ ] Graphiques interactifs
- [ ] Classement des commerciaux
- [ ] Analytics d'annulation
- [ ] Comparaisons visuelles

### Phase 4: Profil Commercial
- [ ] Page de profil détaillée
- [ ] Historique complet
- [ ] Graphiques de performance

### Phase 5: Export & Reports
- [ ] Export PDF
- [ ] Export Excel
- [ ] Export CSV
- [ ] Rapports mensuels/annuels

### Phase 6: Fonctionnalités Intelligentes
- [ ] Alertes pour dépenses extrêmes
- [ ] Alertes pour annulations
- [ ] Système de scoring
- [ ] Résumé AI (placeholder)

---

## 🚀 Prochaines Étapes

1. **Créer le composant principal du dashboard**
2. **Implémenter le panneau de filtres**
3. **Créer les cartes KPI**
4. **Ajouter les graphiques**
5. **Implémenter les tables**
6. **Ajouter les capacités d'export**

---

## 📝 Notes Techniques

### Mapping Order Source
- `catalog` → `ecommerce`
- `pos`, `commercial_pos`, `admin` → `pos`

### Dates
- Format: ISO 8601 (YYYY-MM-DD)
- Timezone: UTC
- Filtres: Inclusif des deux dates (start à 00:00, end à 23:59:59)

### Pagination
- Par défaut: page=1, limit=50
- Format de réponse avec pagination metadata

### Performance
- Utilisation d'aggregations MongoDB
- Index sur commercialId, source, createdAt, date
- Caching optionnel pour données fréquemment consultées


