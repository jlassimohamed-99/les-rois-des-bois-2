# Les Rois des Bois - Comment Tout Fonctionne
## Guide Complet du Système

---

## 📚 Table des Matières

1. [Vue d'Ensemble du Système](#vue-densemble)
2. [Architecture & Structure](#architecture)
3. [Système d'Authentification](#authentification)
4. [Flux des Commandes](#flux-commandes)
5. [Gestion des Factures](#factures)
6. [Point de Vente (POS)](#pos)
7. [Dashboard Commercial](#commercial)
8. [E-commerce Client](#ecommerce)
9. [Analytics & Rapports](#analytics)
10. [Système de Permissions](#permissions)
11. [Stock & Inventaire](#inventaire)
12. [Produits Spéciaux](#produits-speciaux)

---

## 🎯 Vue d'Ensemble du Système {#vue-densemble}

Les Rois des Bois est une plateforme complète de gestion pour un commerce de meubles avec :
- **E-commerce** pour les clients
- **Point de Vente (POS)** pour les magasins
- **Dashboard Commercial** pour les commerciaux
- **Dashboard Admin** pour la gestion complète

### Les 4 Sources de Commandes

Toutes les commandes passent par un système unifié mais sont marquées par leur origine :

1. **📱 Catalog (E-commerce)** : `source='catalog'`
   - Commandes passées en ligne par les clients
   - Statut initial : `pending`
   - Paiement : `unpaid` (crédit) ou `paid` (carte)

2. **🏪 POS (Store Cashiers)** : `source='pos'`
   - Commandes créées par les caissiers en magasin
   - Statut initial : `completed`
   - Paiement : `paid` (cash/card immédiat)
   - Enregistre : `cashierId`, `storeId`, `saleMode` (gros/detail)

3. **💼 Commercial POS** : `source='commercial_pos'`
   - Commandes créées par les commerciaux pour leurs clients
   - Statut initial : `pending`
   - Paiement : `unpaid` (crédit) par défaut
   - Enregistre : `commercialId`, `clientId`

4. **⚙️ Admin** : `source='admin'`
   - Commandes créées manuellement par l'admin
   - Pour tous types de clients
   - Contrôle total sur les paramètres

---

## 🏗️ Architecture & Structure {#architecture}

### Backend Structure

```
backend/
├── models/          # Modèles MongoDB (Order, Invoice, User, Product, etc.)
├── controllers/     # Logique métier (order.controller.js, invoice.controller.js, etc.)
├── routes/          # Définition des routes API
├── middleware/      # Protection d'accès (auth, roles, permissions)
├── utils/           # Utilitaires (orderHelper, inventoryHelper, etc.)
├── services/        # Services externes (PDF, Email - à créer)
└── workers/         # Workers pour jobs asynchrones (à créer)
```

### Frontend Structure

```
frontend/
├── src/
│   ├── pages/           # Pages principales
│   │   ├── admin/       # Pages admin
│   │   ├── commercial/  # Pages commerciales
│   │   ├── client/      # Pages e-commerce
│   │   └── POS/         # Pages POS
│   ├── components/      # Composants réutilisables
│   ├── contexts/        # Contextes React (Auth, Cart, Theme)
│   ├── utils/           # Utilitaires (axios, imageUrl, etc.)
│   └── App.jsx          # Routage principal
```

### Base de Données

**Collections Principales :**
- `users` - Utilisateurs (admin, commercial, cashier, client)
- `orders` - Toutes les commandes (unifié)
- `invoices` - Factures liées aux commandes
- `products` - Produits réguliers
- `specialproducts` - Produits spéciaux configurables
- `stores` - Magasins
- `jobs` - File d'attente des tâches

---

## 🔐 Système d'Authentification {#authentification}

### Comment Ça Marche

1. **Login** (`POST /api/auth/login`)
   - Utilisateur entre email/password
   - Backend vérifie avec bcrypt
   - Génère un JWT token
   - Token stocké dans `localStorage` (frontend)

2. **Protection des Routes**
   - Middleware `protect` : vérifie le token JWT
   - Middleware `protectPOS` : pour POS (admin, cashiers)
   - Middleware `protectCommercial` : pour commerciaux
   - Middleware `protectClient` : pour clients

3. **Redirection par Rôle**
   ```
   admin → /admin/dashboard
   commercial → /commercial
   cashier/store_cashier → /pos
   client → /shop
   ```

### Flux d'Authentification

```
Utilisateur se connecte
    ↓
Backend vérifie credentials
    ↓
Génère JWT token (expire après 7 jours)
    ↓
Token stocké dans localStorage
    ↓
Chaque requête API inclut: Authorization: Bearer <token>
    ↓
Backend valide token sur chaque requête
    ↓
Accès accordé ou refusé selon rôle
```

---

## 📦 Flux des Commandes {#flux-commandes}

### 1. Commande E-commerce (Catalog)

**Flux Complet :**

```
Client navigue sur /shop
    ↓
Ajoute produits au panier (stocké dans localStorage/Context)
    ↓
Vide au checkout
    ↓
POST /api/client/orders
    Body: { items, shippingAddress, paymentMethod }
    ↓
Backend:
  - Valide stock
  - Crée Order avec source='catalog'
  - Statut: pending
  - Paiement: unpaid (si crédit)
    ↓
Réponse: Order créée
    ↓
Client voit confirmation
    ↓
Admin voit commande dans /admin/orders
```

**Code Flow :**
- Frontend: `frontend/src/pages/client/Checkout.jsx`
- Backend: `backend/controllers/clientOrder.controller.js`
- Route: `POST /api/client/orders`
- Model: `Order` avec `source='catalog'`

### 2. Commande POS (Store Cashier)

**Flux Complet :**

```
Caissier accède à /pos
    ↓
Affiche produits disponibles
    ↓
Ajoute produits au panier
    ↓
Sélectionne mode de vente (gros/detail)
    ↓
POST /api/pos/order
    Body: { items, paymentMethod: 'cash', saleMode: 'gros' }
    ↓
Backend:
  - Valide stock
  - Crée Order avec source='pos'
  - Enregistre cashierId, storeId, saleMode
  - Statut: completed
  - Paiement: paid
  - Déduit stock immédiatement
  - Génère facture automatique
    ↓
Réponse: Order + Invoice
    ↓
Caissier voit confirmation
    ↓
Admin voit vente dans /admin/orders (filtre source='pos')
```

**Code Flow :**
- Frontend: `frontend/src/pages/POS/POSInterface.jsx`
- Backend: `backend/controllers/pos.controller.js`
- Route: `POST /api/pos/order`
- Model: `Order` avec `source='pos'`, `cashierId`, `storeId`

### 3. Commande Commercial POS

**Flux Complet :**

```
Commercial accède à /commercial/pos
    ↓
Affiche produits disponibles
    ↓
Sélectionne un CLIENT (obligatoire)
    ↓
Ajoute produits au panier
    ↓
POST /api/commercial/orders
    Body: { clientId, items, paymentMethod: 'credit' }
    ↓
Backend:
  - Vérifie que client appartient au commercial
  - Valide stock
  - Crée Order avec source='commercial_pos'
  - Enregistre commercialId, clientId
  - Statut: pending
  - Paiement: unpaid
    ↓
Réponse: Order créée
    ↓
Commercial voit confirmation
    ↓
Apparaît dans:
  - /commercial/orders (commercial)
  - /admin/orders (admin)
```

**Code Flow :**
- Frontend: `frontend/src/pages/commercial/CommercialPOS.jsx` → `POSInterface.jsx`
- Backend: `backend/controllers/commercialOrder.controller.js`
- Route: `POST /api/commercial/orders`
- Model: `Order` avec `source='commercial_pos'`, `commercialId`

### 4. Commande Admin

**Flux Complet :**

```
Admin accède à /admin/orders/create
    ↓
Sélectionne client (ou crée nouveau)
    ↓
Ajoute produits
    ↓
POST /api/orders
    Body: { clientId, items, source: 'admin', ... }
    ↓
Backend:
  - Valide stock
  - Crée Order avec source='admin'
  - Admin contrôle tous les paramètres
    ↓
Réponse: Order créée
```

**Code Flow :**
- Frontend: `frontend/src/pages/Orders/CreateOrder.jsx`
- Backend: `backend/controllers/order.controller.js`
- Route: `POST /api/orders`
- Model: `Order` avec `source='admin'`

### Visualisation Unifiée dans Admin

Toutes les commandes apparaissent dans `/admin/orders` avec :
- **Colonne Source** : Badge indiquant l'origine (Catalog, POS, Commercial, Admin)
- **Filtres** : Par source, statut, magasin, commercial, date
- **Informations** : Store, Commercial, Cashier affichés selon la source

---

## 🧾 Gestion des Factures {#factures}

### Numérotation des Factures

Format: **ROI-INV-YYYY-XXXX**
- Exemple: `ROI-INV-2024-0001`
- Numéro séquentiel par année
- Généré automatiquement

### Création de Facture

**Depuis une Commande :**

```
Admin/Commercial accède à Order Detail
    ↓
Clique "Générer Facture"
    ↓
POST /api/invoices/from-order/:orderId
    Body: { dueDate, notes }
    ↓
Backend:
  - Vérifie qu'aucune facture n'existe déjà
  - Crée Invoice avec numéro ROI-INV-YYYY-XXXX
  - Copie items de la commande
  - Calcule totaux
  - Status: draft
    ↓
Optionnel: Enqueue PDF generation job
    ↓
Réponse: Invoice créée
```

### Structure de la Facture

```javascript
Invoice {
  invoiceNumber: "ROI-INV-2024-0001",
  orderId: ObjectId,
  clientId: ObjectId,
  commercialId: ObjectId, // Si commande commerciale
  items: [...],           // Copiés de la commande
  subtotal: Number,
  discount: Number,
  tax: Number,
  total: Number,
  paidAmount: Number,
  remainingAmount: Number,
  status: "draft" | "sent" | "paid" | "partial" | "overdue",
  dueDate: Date,
  payments: [{            // Tableau des paiements
    amount: Number,
    paymentMethod: "cash" | "card" | "bank_transfer" | "check",
    paidAt: Date,
    recordedBy: ObjectId
  }],
  pdfPath: String,        // Chemin vers PDF généré
  emailSent: Boolean
}
```

### Paiements

**Enregistrer un Paiement :**

```
POST /api/invoices/:id/pay
    Body: { amount, paymentMethod, notes }
    ↓
Backend:
  - Ajoute paiement au tableau payments[]
  - Met à jour paidAmount
  - Calcule remainingAmount
  - Met à jour status (paid/partial/unpaid)
  - Si paid: met à jour paidAt, status='paid'
    ↓
Réponse: Invoice mise à jour
```

### Génération PDF (À Implémenter)

```
POST /api/invoices/:id/generate-pdf
    ↓
Enqueue job dans BullMQ
    ↓
Worker traite:
  - Génère HTML RTL Arabic template
  - Utilise Puppeteer pour créer PDF
  - Sauvegarde PDF dans /uploads/invoices/
  - Met à jour invoice.pdfPath
    ↓
Notification envoyée quand terminé
```

---

## 🏪 Point de Vente (POS) {#pos}

### Accès POS

**Rôles Autorisés :**
- `cashier`
- `store_cashier`
- `saler`
- `admin`

### Interface POS

**Composants :**
1. **Zone Produits** (gauche)
   - Produits réguliers
   - Produits spéciaux
   - Recherche et filtres

2. **Zone Panier** (droite)
   - Items ajoutés
   - Quantités modifiables
   - Remise applicable
   - Total calculé

3. **Actions**
   - Vider panier
   - Finaliser vente
   - Imprimer reçu

### Flux POS Complet

```
1. Charger Produits
   GET /api/pos/products
   → Retourne: { regularProducts, specialProducts, categories }

2. Produits Spéciaux - Configuration Multi-Étapes
   - Étape 1: Choisir produit A (ex: plateau de table)
   - Étape 2: Choisir produit B (ex: pieds de table)
   - Étape 3: Afficher combinaison finale
   - Étape 4: Ajouter au panier avec prix final

3. Ajouter au Panier (frontend seulement)
   - Stocké dans state React
   - Calcul automatique des totaux

4. Finaliser Vente
   POST /api/pos/order
   Body: {
     items: [{ productId, quantity, unitPrice, ... }],
     discount: Number,
     paymentMethod: 'cash',
     saleMode: 'gros' | 'detail'
   }
   → Backend:
     - Valide stock
     - Crée Order (source='pos')
     - Enregistre cashierId, storeId
     - Déduit stock
     - Génère facture automatique
   → Retourne: { order, invoice }

5. Affichage Confirmation
   - Numéro de commande
   - Total
   - Option d'imprimer
```

### Stock Management dans POS

**Validation :**
- Avant d'ajouter au panier : vérifie stock disponible
- Avant de finaliser : re-vérifie stock
- Si insuffisant : erreur + désactive checkout

**Déduction :**
- Pour POS (cash) : déduction immédiate
- Pour Catalog : réservation puis déduction au changement de statut

---

## 💼 Dashboard Commercial {#commercial}

### Accès

**Rôles :** `commercial`, `admin`

**Route de Base :** `/commercial`

### Pages Disponibles

1. **Dashboard** (`/commercial`)
   - Stats personnelles (clients, commandes, revenus)
   - Graphiques de performance
   - Actions rapides

2. **Clients** (`/commercial/clients`)
   - Liste UNIQUEMENT des clients assignés
   - Recherche et filtres
   - Ajout/Édition clients
   - Profil client détaillé

3. **Commandes** (`/commercial/orders`)
   - UNIQUEMENT commandes de ses clients
   - Filtres par statut, date
   - Détails complets
   - Changement de statut

4. **Factures** (`/commercial/invoices`)
   - UNIQUEMENT factures de ses clients
   - Statut (payé/non payé/en retard)
   - Génération PDF

5. **Impayées** (`/commercial/unpaid`)
   - Focus sur les factures impayées
   - Montants en retard en rouge

6. **POS Commercial** (`/commercial/pos`)
   - Interface POS avec sélection de client obligatoire
   - Crée commandes pour clients assignés

### Isolation des Données

**Important :** Un commercial ne voit JAMAIS les données d'un autre commercial.

**Backend Protection :**
- Tous les endpoints `/api/commercial/*` utilisent `protectCommercial` middleware
- Filtre automatique par `req.commercialId`
- Les commerciaux ne peuvent pas accéder aux clients non assignés

**Exemple :**

```javascript
// GET /api/commercial/clients
// Backend filtre automatiquement:
const clients = await User.find({
  role: 'client',
  commercialId: req.commercialId  // Seulement les clients assignés
});
```

---

## 🛒 E-commerce Client {#ecommerce}

### Accès

**Rôles :** `client`, `user`

**Route de Base :** `/shop`

### Pages Disponibles

1. **Accueil** (`/shop`)
   - Hero section
   - Produits en vedette
   - Catégories

2. **Catégories** (`/shop/categories`)
   - Liste toutes les catégories
   - Navigation vers produits de catégorie

3. **Produits** (`/shop/products`)
   - Grille de produits
   - Filtres (catégorie, prix)
   - Recherche

4. **Détail Produit** (`/shop/products/:id`)
   - Galerie d'images
   - Description
   - Variants (si disponibles)
   - Ajouter au panier

5. **Produits Spéciaux** (`/shop/special-products`)
   - Liste produits spéciaux
   - Configurateur multi-étapes

6. **Panier** (`/shop/cart`)
   - Items ajoutés
   - Quantités modifiables
   - Total
   - Passer à la caisse

7. **Checkout** (`/shop/checkout`)
   - Formulaire d'adresse
   - Méthode de paiement
   - Confirmation commande

8. **Profil** (`/shop/profile`)
   - Informations personnelles
   - Historique des commandes

### Panier

**Stockage :** Context React (`CartContext`)
- Persiste dans `localStorage`
- Survit aux rafraîchissements

**Flux :**
```
Ajouter au panier → Context + localStorage
    ↓
Naviguer dans le shop
    ↓
Panier reste rempli
    ↓
Aller au checkout
    ↓
Vider panier après commande créée
```

---

## 📊 Analytics & Rapports {#analytics}

### Dashboard Admin

**Endpoints Disponibles :**
- `GET /api/analytics/sales` - Ventes agrégées
- `GET /api/analytics/top-products` - Produits les plus vendus
- `GET /api/analytics/by-store` - Ventes par magasin
- `GET /api/analytics/by-commercial` - Ventes par commercial

### Filtrage par Source

Tous les analytics peuvent être filtrés par :
- Source de commande (catalog, pos, commercial_pos, admin)
- Date range
- Store
- Commercial

**Exemple de Requête :**
```
GET /api/analytics/sales?source=pos&from=2024-01-01&to=2024-12-31
```

### Métriques Calculées

- **Revenue Total** : Somme des `total` de toutes les commandes
- **Net Income** : Revenue - Cost
- **Nombre de Commandes** : Count des orders
- **Valeur Moyenne** : Revenue / Nombre de commandes

---

## 🔒 Système de Permissions {#permissions}

### Rôles Disponibles

1. **admin**
   - Accès total à tout
   - Peut voir toutes les commandes, factures, clients
   - Peut créer/modifier/supprimer tout

2. **commercial**
   - Accès uniquement à ses clients assignés
   - Peut créer commandes pour ses clients
   - Peut générer factures pour ses clients
   - Ne voit pas les autres commerciaux

3. **store_cashier / cashier / saler**
   - Accès au POS uniquement
   - Peut créer ventes POS
   - Voit uniquement les ventes de son magasin

4. **client / user**
   - Accès à l'e-commerce
   - Voit uniquement ses propres commandes
   - Ne peut pas accéder aux dashboards admin/commercial

### Middleware de Protection

**Backend :**

```javascript
// Protection générale
protect → Vérifie JWT, charge req.user

// Protection POS
protectPOS → Vérifie JWT + rôle (cashier, admin, etc.)

// Protection Commercial
protectCommercial → Vérifie JWT + rôle (commercial, admin)
  → Ajoute req.commercialId pour filtrage automatique

// Protection Admin
protectAdmin → Vérifie JWT + rôle = 'admin'
```

**Frontend :**

```javascript
<RoleProtectedRoute allowedRoles={['admin']}>
  // Seuls les admins peuvent voir
</RoleProtectedRoute>
```

---

## 📦 Stock & Inventaire {#inventaire}

### Validation de Stock

**Avant Création de Commande :**

```
Pour chaque item:
  - Si produit régulier → Vérifie product.stock
  - Si produit spécial → Vérifie stock des composants
  - Si insuffisant → Retourne erreur avec détails
```

### Déduction de Stock

**Stratégie selon Source :**

1. **POS (source='pos')**
   - Déduction IMMÉDIATE au moment de la vente
   - Stock réduit tout de suite

2. **Catalog (source='catalog')**
   - Réservation au moment de la commande
   - Déduction complète quand statut → 'ready' ou 'delivered'

3. **Commercial POS**
   - Réservation initiale
   - Déduction selon politique de l'entreprise

### Inventaire Log

Tous les changements de stock sont enregistrés dans `InventoryLog` :
- Type de changement (increase, decrease, adjustment)
- Raison
- Utilisateur
- Timestamp

---

## 🎨 Produits Spéciaux {#produits-speciaux}

### Concept

Les produits spéciaux sont composés de 2 produits de base combinés.

**Exemple :**
- Produit Spécial : "Table Personnalisée"
- Base A : Plateau de table (variants: bois, verre, marbre)
- Base B : Pieds de table (variants: métal, bois, moderne)

### Configuration Multi-Étapes

```
Étape 1: Choisir Variant A (ex: Plateau en bois)
    ↓
Étape 2: Choisir Variant B (ex: Pieds en métal)
    ↓
Étape 3: Système trouve combinaison correspondante
    ↓
Affiche image de combinaison finale
    ↓
Étape 4: Prix final calculé
    ↓
Ajouter au panier
```

### Structure dans la Base

```javascript
SpecialProduct {
  baseProductA: ObjectId,  // Référence produit A
  baseProductB: ObjectId,  // Référence produit B
  combinations: [{
    optionA: { variant, productId },
    optionB: { variant, productId },
    finalImage: String,    // Image de la combinaison
    additionalPrice: Number
  }],
  finalPrice: Number       // Prix de base
}
```

### Dans une Commande

```javascript
OrderItem {
  productId: SpecialProduct._id,
  productType: 'special',
  variantA: { ... },      // Variant A choisi
  variantB: { ... },      // Variant B choisi
  combinationId: String,  // ID de la combinaison
  quantity: Number,
  unitPrice: Number       // finalPrice + additionalPrice
}
```

---

## 🔄 Connexions & Flux de Données

### Vue d'Ensemble des Connexions

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (E-commerce)                       │
│  /shop → Catalog → Checkout → Order (source='catalog')      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
              ┌────────────────┐
              │   ORDER MODEL  │
              │  (Unifié - 4   │
              │   sources)     │
              └────────┬───────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ↓              ↓              ↓
┌───────────┐  ┌───────────┐  ┌───────────┐
│  INVOICE  │  │ ANALYTICS │  │ INVENTORY │
│  MODEL    │  │ (Aggregate│  │   LOG     │
│           │  │  Orders)  │  │           │
└─────┬─────┘  └───────────┘  └───────────┘
      │
      ↓
┌───────────┐
│   PDF     │  ───→ Job Queue ───→ Worker ───→ PDF Generated
│ GENERATION│
└───────────┘

┌─────────────────────────────────────────────────────────────┐
│                  CASHIER (POS Store)                         │
│  /pos → POS Interface → Order (source='pos')                │
│          → Invoice (auto-generated)                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
              ┌────────────────┐
              │   ORDER MODEL  │
              └────────────────┘

┌─────────────────────────────────────────────────────────────┐
│               COMMERCIAL (Sales Dashboard)                   │
│  /commercial/pos → Select Client → Order                    │
│                  (source='commercial_pos')                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
              ┌────────────────┐
              │   ORDER MODEL  │
              │  (Filtered by  │
              │  commercialId) │
              └────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    ADMIN (Full Control)                      │
│  /admin/orders → See ALL orders from ALL sources            │
│  /admin/analytics → Aggregate across ALL sources            │
│  /admin/invoices → Manage ALL invoices                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
              ┌────────────────┐
              │   ORDER MODEL  │
              │  (No filters - │
              │   sees all)    │
              └────────────────┘
```

### Flux de Commande → Facture

```
Order Created
    ↓
Admin/Commercial génère facture
    ↓
Invoice Created (status: 'draft')
    ↓
Enqueue PDF generation job
    ↓
Worker génère PDF asynchrone
    ↓
PDF sauvegardé → invoice.pdfPath mis à jour
    ↓
Optionnel: Envoyer email avec PDF
    ↓
Client peut télécharger PDF
    ↓
Enregistrer paiements
    ↓
Invoice status → 'paid'
```

### Flux Analytics

```
Orders dans DB (tous sources)
    ↓
Aggregation Pipeline MongoDB
    ↓
Filtre par:
  - Source (catalog/pos/commercial_pos/admin)
  - Date range
  - Store
  - Commercial
    ↓
Calcule:
  - Total revenue
  - Nombre de commandes
  - Net income (revenue - cost)
  - Top products
    ↓
Retourne données agrégées
    ↓
Frontend affiche graphiques
```

---

## 🔗 Liens Entre les Parties

### Order → Invoice

- Une commande peut avoir **une seule facture**
- La facture est créée **depuis** la commande
- `Invoice.orderId` référence l'Order
- Les items de la facture sont copiés de la commande

### Order → Client

- `Order.clientId` référence le client
- Peut être `null` pour ventes POS "walk-in"
- Pour catalog/commercial : toujours présent

### Order → Commercial

- `Order.commercialId` présent si:
  - Source = 'commercial_pos'
  - Source = 'catalog' (si client a un commercial assigné)
  - Source = 'admin' (si admin l'assigne)

### Order → Store

- `Order.storeId` présent si:
  - Source = 'pos' (magasin du caissier)
  - Source = 'admin' (si admin l'assigne)

### Invoice → Payments

- Tableau `payments[]` dans Invoice
- Support paiements partiels multiples
- Chaque paiement enregistre: montant, méthode, date, enregistré par

---

## 📱 API Endpoints Principaux

### Commandes

```
GET    /api/orders              # Liste (filtrée par rôle)
GET    /api/orders/:id          # Détails
POST   /api/orders              # Créer (admin)
PUT    /api/orders/:id          # Modifier
PUT    /api/orders/:id/status   # Changer statut

POST   /api/client/orders       # Créer depuis e-commerce
POST   /api/pos/order           # Créer depuis POS
POST   /api/commercial/orders   # Créer depuis commercial POS
```

### Factures

```
GET    /api/invoices            # Liste
GET    /api/invoices/:id        # Détails
POST   /api/invoices/from-order/:orderId  # Créer depuis commande
POST   /api/invoices/:id/pay    # Enregistrer paiement
GET    /api/invoices/:id/pdf    # Télécharger PDF
POST   /api/invoices/:id/email  # Envoyer par email
```

### Analytics

```
GET    /api/analytics/sales     # Ventes agrégées
GET    /api/analytics/top-products  # Top produits
GET    /api/analytics/by-store  # Par magasin
GET    /api/analytics/by-commercial  # Par commercial
```

---

## 🎯 Points Clés à Retenir

1. **Unification** : Toutes les commandes sont dans le même modèle `Order`, différenciées par `source`
2. **Isolation** : Commerciaux ne voient que leurs clients assignés
3. **Traçabilité** : Chaque commande enregistre qui l'a créée, d'où elle vient, et toutes les infos nécessaires
4. **Flexibilité** : Admin voit tout et peut tout modifier
5. **Sécurité** : Permissions strictes à tous les niveaux

---

## 📝 Notes Techniques

### Validation Stock

- Vérification avant création de commande
- Pour produits spéciaux : vérifie stock des composants
- Erreur descriptive si insuffisant

### Numérotation

- Orders : `ORD-000001` (séquentiel)
- Invoices : `ROI-INV-2024-0001` (annuel séquentiel)
- Automatique via Mongoose pre-save hooks

### Performance

- Index sur tous les champs de recherche fréquents
- Pagination sur toutes les listes
- Aggregation pipelines optimisées pour analytics

---

Ce document explique comment tout fonctionne. Pour un guide de test détaillé, consultez `TESTING_GUIDE.md`.

