# Référence Rapide - Les Rois des Bois

## 📌 Points Clés en 30 Secondes

### Les 4 Sources de Commandes
- **Catalog** (`source='catalog'`) → E-commerce clients
- **POS** (`source='pos'`) → Ventes magasin (cashiers)
- **Commercial POS** (`source='commercial_pos'`) → Commerciaux
- **Admin** (`source='admin'`) → Commandes manuelles admin

### Rôles & Accès
- **admin** → Voit tout, contrôle tout
- **commercial** → Voit uniquement ses clients assignés
- **cashier/store_cashier** → Accès POS uniquement
- **client/user** → E-commerce uniquement

### Flux Principal
```
Commande Créée → Order (source) → Invoice (si générée) → Payments → Analytics
```

---

## 🔗 Connexions Principales

```
Order
  ├── clientId → User (client)
  ├── commercialId → User (commercial) [si applicable]
  ├── storeId → Store [si POS]
  ├── cashierId → User (cashier) [si POS]
  └── source → 'catalog' | 'pos' | 'commercial_pos' | 'admin'

Invoice
  ├── orderId → Order
  ├── clientId → User (client)
  ├── commercialId → User (commercial) [si applicable]
  └── payments[] → Array de paiements

User (Client)
  └── commercialId → User (commercial assigné)

User (Commercial)
  └── clients → Tous les User avec commercialId = ce commercial
```

---

## 🎯 Endpoints Principaux

### Commandes
- `GET /api/orders?source=...` - Liste (filtrée)
- `POST /api/orders` - Créer (admin)
- `POST /api/client/orders` - Créer depuis e-commerce
- `POST /api/pos/order` - Créer depuis POS
- `POST /api/commercial/orders` - Créer depuis commercial

### Factures
- `POST /api/invoices/from-order/:orderId` - Créer depuis commande
- `POST /api/invoices/:id/pay` - Enregistrer paiement
- `GET /api/invoices/:id/pdf` - Télécharger PDF

---

## 📊 Modèles Clés

### Order
```javascript
{
  orderNumber: "ORD-000001",
  source: "catalog" | "pos" | "commercial_pos" | "admin",
  clientId: ObjectId,
  commercialId: ObjectId,  // Si applicable
  storeId: ObjectId,       // Si POS
  cashierId: ObjectId,     // Si POS
  status: "pending" | "completed" | ...,
  items: [...],
  total: Number
}
```

### Invoice
```javascript
{
  invoiceNumber: "ROI-INV-2024-0001",
  orderId: ObjectId,
  clientId: ObjectId,
  commercialId: ObjectId,  // Si applicable
  total: Number,
  paidAmount: Number,
  remainingAmount: Number,
  status: "draft" | "paid" | "unpaid" | ...,
  payments: [{ amount, method, paidAt, ... }]
}
```

---

## ✅ Checklist Rapide de Test

1. [ ] Login avec chaque rôle
2. [ ] Créer commande catalog → Vérifier dans admin
3. [ ] Créer vente POS → Vérifier source='pos'
4. [ ] Créer commande commercial → Vérifier isolation
5. [ ] Générer facture → Vérifier numérotation
6. [ ] Filtrer par source dans admin orders
7. [ ] Vérifier permissions (commercial isolé)

---

Pour plus de détails, voir :
- `HOW_IT_WORKS.md` - Explication complète
- `TESTING_GUIDE.md` - Tests détaillés

