# Guide de Test Complet - Les Rois des Bois
## Tests Détaillés de A à Z

---

## 📋 Table des Matières

1. [Préparation & Configuration](#preparation)
2. [Tests d'Authentification](#tests-auth)
3. [Tests E-commerce (Client)](#tests-client)
4. [Tests POS (Caissier)](#tests-pos)
5. [Tests Dashboard Commercial](#tests-commercial)
6. [Tests Admin](#tests-admin)
7. [Tests de Flux Complets](#tests-flux)
8. [Tests de Permissions](#tests-permissions)
9. [Tests de Performance](#tests-performance)
10. [Vérification des Erreurs](#tests-errors)

---

## 🔧 Préparation & Configuration {#preparation}

### 1. Setup Initial

**Backend :**
```bash
cd backend
npm install
# Créer fichier .env avec:
# - MONGODB_URI
# - JWT_SECRET
# - PORT=5000
npm run dev
```

**Frontend :**
```bash
cd frontend
npm install
npm run dev
```

**Vérifications :**
- ✅ Backend accessible sur `http://localhost:5000`
- ✅ Frontend accessible sur `http://localhost:5173`
- ✅ MongoDB connecté et accessible
- ✅ Base de données créée

### 2. Données de Test Nécessaires

Avant de tester, vous devez avoir :

**Utilisateurs :**
- 1 Admin
- 2 Commerciaux
- 2 Caissiers (store_cashier)
- 5 Clients (assignés aux commerciaux)

**Produits :**
- 10 Produits réguliers (avec stock > 10)
- 2 Produits spéciaux (avec combinaisons)

**Magasins :**
- 2 Magasins

**Commandes de Test :**
- Quelques commandes existantes de chaque source

### 3. Outils de Test Recommandés

- **Navigateur** : Chrome/Firefox (DevTools ouvert)
- **Postman** : Pour tester les APIs directement
- **MongoDB Compass** : Pour vérifier la base de données

---

## 🔐 Tests d'Authentification {#tests-auth}

### Test 1.1 : Login Admin

**Étapes :**
1. Aller sur `http://localhost:5173/login`
2. Entrer email et password d'un admin
3. Cliquer sur "Se connecter"

**Résultat Attendu :**
- ✅ Redirection vers `/admin/dashboard`
- ✅ Token stocké dans localStorage
- ✅ Menu admin visible
- ✅ Pas d'erreurs dans la console

**Vérification Backend :**
- Ouvrir DevTools → Network → Voir requête `POST /api/auth/login`
- Vérifier réponse contient `token`
- Vérifier status 200

### Test 1.2 : Login Commercial

**Étapes :**
1. Se déconnecter
2. Se connecter avec un compte commercial

**Résultat Attendu :**
- ✅ Redirection vers `/commercial`
- ✅ Dashboard commercial visible
- ✅ Menu commercial visible (pas menu admin)

### Test 1.3 : Login Caissier

**Étapes :**
1. Se déconnecter
2. Se connecter avec un compte caissier

**Résultat Attendu :**
- ✅ Redirection vers `/pos`
- ✅ Interface POS visible
- ✅ Pas accès aux dashboards admin/commercial

### Test 1.4 : Login Client

**Étapes :**
1. Aller sur `http://localhost:5173/shop`
2. Cliquer "Se connecter" ou créer compte
3. Se connecter avec un compte client

**Résultat Attendu :**
- ✅ Reste sur `/shop`
- ✅ Menu client visible
- ✅ Panier accessible

### Test 1.5 : Token Expiré

**Étapes :**
1. Se connecter
2. Ouvrir DevTools → Application → Local Storage
3. Modifier le token pour le rendre invalide
4. Rafraîchir la page

**Résultat Attendu :**
- ✅ Redirection vers `/login`
- ✅ Message d'erreur approprié

---

## 🛒 Tests E-commerce (Client) {#tests-client}

### Test 2.1 : Navigation E-commerce

**Étapes :**
1. Aller sur `/shop`
2. Parcourir les pages :
   - Accueil
   - Catégories
   - Produits
   - Détail produit

**Vérifications :**
- ✅ Toutes les pages se chargent
- ✅ Produits s'affichent correctement
- ✅ Images se chargent
- ✅ Recherche fonctionne
- ✅ Filtres fonctionnent

### Test 2.2 : Ajouter Produit au Panier

**Étapes :**
1. Aller sur `/shop/products`
2. Cliquer sur un produit
3. Choisir quantité
4. Cliquer "Ajouter au panier"

**Résultat Attendu :**
- ✅ Notification de succès
- ✅ Produit apparaît dans le panier
- ✅ Badge de nombre dans l'icône panier
- ✅ Quantité correcte

**Vérification :**
- Ouvrir DevTools → Application → Local Storage
- Vérifier que le panier est sauvegardé

### Test 2.3 : Produit Spécial - Configuration

**Étapes :**
1. Aller sur `/shop/special-products`
2. Cliquer sur un produit spécial
3. **Étape 1** : Choisir variant A (ex: couleur plateau)
4. **Étape 2** : Choisir variant B (ex: type de pieds)
5. **Étape 3** : Vérifier image de combinaison
6. **Étape 4** : Vérifier prix final
7. Cliquer "Ajouter au panier"

**Résultat Attendu :**
- ✅ Navigation entre étapes fonctionne
- ✅ Image de combinaison s'affiche
- ✅ Prix final calculé correctement
- ✅ Produit ajouté avec la bonne combinaison

### Test 2.4 : Gestion du Panier

**Étapes :**
1. Aller sur `/shop/cart`
2. Modifier quantité d'un produit
3. Supprimer un produit
4. Vider le panier

**Résultat Attendu :**
- ✅ Quantités modifiables
- ✅ Total recalculé automatiquement
- ✅ Suppression fonctionne
- ✅ Panier se vide complètement

### Test 2.5 : Création de Commande (Checkout)

**Prérequis :**
- Panier avec au moins 1 produit
- Client connecté

**Étapes :**
1. Aller sur `/shop/cart`
2. Cliquer "Passer à la caisse"
3. Entrer adresse de livraison
4. Choisir méthode de paiement
5. Vérifier résumé de commande
6. Cliquer "Confirmer la commande"

**Résultat Attendu :**
- ✅ Formulaire valide correctement
- ✅ Commande créée avec `source='catalog'`
- ✅ Numéro de commande affiché
- ✅ Panier vidé
- ✅ Redirection vers confirmation

**Vérification Backend :**
- MongoDB : Vérifier nouvelle commande dans collection `orders`
- Vérifier `source: 'catalog'`
- Vérifier `clientId` correspond
- Vérifier `status: 'pending'`

### Test 2.6 : Vérifier Commande dans Admin

**Étapes :**
1. Se connecter en tant qu'admin
2. Aller sur `/admin/orders`
3. Chercher la commande créée par le client

**Résultat Attendu :**
- ✅ Commande visible dans la liste
- ✅ Badge "Catalog" affiché (source)
- ✅ Informations client correctes
- ✅ Détails complets disponibles

---

## 🏪 Tests POS (Caissier) {#tests-pos}

### Test 3.1 : Accès POS

**Étapes :**
1. Se connecter en tant que caissier
2. Vérifier redirection vers `/pos`

**Résultat Attendu :**
- ✅ Interface POS complète
- ✅ Liste des produits chargée
- ✅ Panier vide prêt

### Test 3.2 : Charger Produits POS

**Étapes :**
1. Dans l'interface POS
2. Vérifier chargement des produits

**Résultat Attendu :**
- ✅ Produits réguliers affichés
- ✅ Produits spéciaux affichés
- ✅ Catégories fonctionnelles
- ✅ Recherche fonctionne

**Vérification Backend :**
- DevTools → Network → `GET /api/pos/products`
- Vérifier réponse contient `regularProducts` et `specialProducts`

### Test 3.3 : Vente Simple (Produit Régulier)

**Étapes :**
1. Cliquer sur un produit régulier
2. Si variants : choisir variant
3. Entrer quantité
4. Produit ajouté au panier
5. Cliquer "Finaliser la vente"

**Résultat Attendu :**
- ✅ Produit dans panier
- ✅ Total calculé
- ✅ Vente finalisée
- ✅ Confirmation avec numéro de commande

**Vérification Backend :**
- Vérifier nouvelle commande avec `source='pos'`
- Vérifier `cashierId` = ID du caissier connecté
- Vérifier `storeId` = magasin du caissier
- Vérifier `status: 'completed'`
- Vérifier `paymentStatus: 'paid'`
- Vérifier stock déduit

### Test 3.4 : Vente Produit Spécial (POS)

**Étapes :**
1. Cliquer sur un produit spécial
2. **Étape 1** : Choisir variant A
3. **Étape 2** : Choisir variant B
4. **Étape 3** : Voir combinaison finale
5. **Étape 4** : Ajouter au panier
6. Finaliser vente

**Résultat Attendu :**
- ✅ Configuration multi-étapes fonctionne
- ✅ Combinaison enregistrée correctement
- ✅ Prix final correct
- ✅ Vente créée avec bonnes informations

### Test 3.5 : Vente avec Remise

**Étapes :**
1. Ajouter produits au panier
2. Dans le panier, entrer une remise (ex: 50 TND)
3. Vérifier total recalculé
4. Finaliser vente

**Résultat Attendu :**
- ✅ Remise appliquée
- ✅ Total = Subtotal - Remise
- ✅ Remise enregistrée dans commande

### Test 3.6 : Vérifier Stock Insuffisant

**Étapes :**
1. Prendre un produit avec stock = 2
2. Ajouter 3 au panier
3. Essayer de finaliser

**Résultat Attendu :**
- ✅ Erreur affichée : "Stock insuffisant"
- ✅ Vente ne peut pas être finalisée
- ✅ Message indique stock disponible

### Test 3.7 : Vérifier Vente dans Admin

**Étapes :**
1. Après une vente POS
2. Se connecter en admin
3. Aller sur `/admin/orders`
4. Chercher la vente

**Résultat Attendu :**
- ✅ Commande visible avec badge "POS"
- ✅ Nom du caissier affiché
- ✅ Magasin affiché
- ✅ Statut "completed"

---

## 💼 Tests Dashboard Commercial {#tests-commercial}

### Test 4.1 : Accès Dashboard Commercial

**Étapes :**
1. Se connecter en tant que commercial
2. Vérifier redirection vers `/commercial`

**Résultat Attendu :**
- ✅ Dashboard commercial visible
- ✅ Stats personnelles affichées
- ✅ Menu commercial complet

### Test 4.2 : Voir Mes Clients

**Étapes :**
1. Aller sur `/commercial/clients`
2. Vérifier la liste

**Résultat Attendu :**
- ✅ UNIQUEMENT clients assignés à ce commercial
- ✅ Pas de clients d'autres commerciaux
- ✅ Recherche fonctionne

**Test de Sécurité :**
- Vérifier dans MongoDB que seuls les clients avec `commercialId` = ID du commercial connecté sont retournés

### Test 4.3 : Ajouter Nouveau Client

**Étapes :**
1. Sur `/commercial/clients`
2. Cliquer "Ajouter client"
3. Remplir formulaire
4. Sauvegarder

**Résultat Attendu :**
- ✅ Client créé
- ✅ `commercialId` automatiquement = commercial connecté
- ✅ Client apparaît dans la liste
- ✅ Client visible uniquement pour ce commercial

### Test 4.4 : Créer Commande pour Client

**Étapes :**
1. Aller sur `/commercial/pos`
2. Cliquer "Sélectionner client"
3. Choisir un client assigné
4. Ajouter produits
5. Finaliser commande

**Résultat Attendu :**
- ✅ Client sélectionné affiché
- ✅ Commande créée avec `source='commercial_pos'`
- ✅ `commercialId` = commercial connecté
- ✅ `clientId` = client sélectionné
- ✅ Statut: `pending`
- ✅ Paiement: `unpaid`

**Vérification :**
- Vérifier que le commercial ne peut pas sélectionner un client non assigné

### Test 5.5 : Voir Mes Commandes

**Étapes :**
1. Aller sur `/commercial/orders`
2. Vérifier la liste

**Résultat Attendu :**
- ✅ UNIQUEMENT commandes de ses clients assignés
- ✅ Toutes les sources (catalog, commercial_pos)
- ✅ Filtres fonctionnent

**Test de Sécurité :**
- Créer commande pour client d'un autre commercial
- Vérifier qu'elle n'apparaît PAS dans la liste du premier commercial

### Test 4.6 : Changer Statut Commande

**Étapes :**
1. Ouvrir détail d'une commande
2. Changer statut (ex: pending → processing)
3. Sauvegarder

**Résultat Attendu :**
- ✅ Statut mis à jour
- ✅ Timeline mise à jour
- ✅ Activité enregistrée

### Test 4.7 : Générer Facture

**Étapes :**
1. Ouvrir détail d'une commande
2. Cliquer "Générer facture"
3. Entrer date d'échéance
4. Confirmer

**Résultat Attendu :**
- ✅ Facture créée avec numéro ROI-INV-YYYY-XXXX
- ✅ Items copiés de la commande
- ✅ Facture liée à la commande
- ✅ Facture visible dans `/commercial/invoices`

### Test 4.8 : Voir Factures Impayées

**Étapes :**
1. Aller sur `/commercial/unpaid`
2. Vérifier la liste

**Résultat Attendu :**
- ✅ UNIQUEMENT factures impayées de ses clients
- ✅ Factures en retard en rouge
- ✅ Total impayé par client affiché

---

## ⚙️ Tests Admin {#tests-admin}

### Test 5.1 : Voir TOUTES les Commandes

**Étapes :**
1. Se connecter en admin
2. Aller sur `/admin/orders`
3. Vérifier filtres

**Résultat Attendu :**
- ✅ Toutes les commandes visibles (toutes sources)
- ✅ Filtre par source fonctionne :
  - Catalog
  - POS
  - Commercial POS
  - Admin
- ✅ Badges de source corrects
- ✅ Informations store/commercial/cashier affichées

### Test 5.2 : Filtrer par Source

**Test pour chaque source :**

1. **Catalog :**
   - Filtrer par `source=catalog`
   - Vérifier uniquement commandes e-commerce
   - Vérifier `clientId` présent

2. **POS :**
   - Filtrer par `source=pos`
   - Vérifier uniquement ventes POS
   - Vérifier `cashierId` et `storeId` présents
   - Vérifier statut `completed`

3. **Commercial POS :**
   - Filtrer par `source=commercial_pos`
   - Vérifier uniquement commandes commerciales
   - Vérifier `commercialId` et `clientId` présents

4. **Admin :**
   - Filtrer par `source=admin`
   - Vérifier commandes créées manuellement par admin

### Test 5.3 : Créer Commande Admin

**Étapes :**
1. Aller sur `/admin/orders/create`
2. Sélectionner ou créer client
3. Ajouter produits
4. Définir tous les paramètres
5. Sauvegarder

**Résultat Attendu :**
- ✅ Commande créée avec `source='admin'`
- ✅ Tous les champs configurables
- ✅ Commande apparaît dans la liste

### Test 5.4 : Assigner Commercial à Client

**Étapes :**
1. Aller sur `/admin/crm` (Clients)
2. Ouvrir détail d'un client
3. Assigner un commercial
4. Sauvegarder

**Résultat Attendu :**
- ✅ Commercial assigné
- ✅ Client apparaît dans la liste du commercial
- ✅ Commercial peut créer commandes pour ce client

### Test 5.5 : Analytics par Source

**Étapes :**
1. Aller sur `/admin/analytics`
2. Vérifier filtres par source
3. Voir graphiques

**Résultat Attendu :**
- ✅ Filtre par source fonctionne
- ✅ Revenus calculés par source
- ✅ Graphiques mis à jour
- ✅ Comparaison entre sources possible

### Test 5.6 : Voir Toutes les Factures

**Étapes :**
1. Aller sur `/admin/invoices`
2. Vérifier liste complète

**Résultat Attendu :**
- ✅ Toutes les factures visibles
- ✅ Filtres fonctionnent
- ✅ Statuts corrects
- ✅ Liens vers commandes fonctionnent

---

## 🔄 Tests de Flux Complets {#tests-flux}

### Test 6.1 : Flux Complet E-commerce → Facture → Paiement

**Scénario End-to-End :**

1. **Client place commande :**
   - Client se connecte sur `/shop`
   - Ajoute produits au panier
   - Passe commande
   - ✅ Commande créée avec `source='catalog'`

2. **Admin voit commande :**
   - Admin va sur `/admin/orders`
   - ✅ Commande visible avec badge "Catalog"
   - Ouvre détails
   - ✅ Informations client complètes

3. **Admin génère facture :**
   - Clique "Générer facture"
   - Définit date d'échéance
   - ✅ Facture créée avec numéro ROI-INV-YYYY-XXXX

4. **PDF généré (quand implémenté) :**
   - Job enqueue pour génération PDF
   - ✅ PDF généré asynchrone
   - ✅ PDF téléchargeable

5. **Enregistrer paiement :**
   - Admin ouvre facture
   - Clique "Enregistrer paiement"
   - Entree montant et méthode
   - ✅ Paiement enregistré
   - ✅ Statut facture → "paid"
   - ✅ Statut commande peut être mis à jour

**Vérifications Finales :**
- MongoDB : Vérifier Order avec Invoice liée
- MongoDB : Vérifier Invoice avec paiements enregistrés
- Analytics : Vérifier que commande apparaît dans les stats

### Test 6.2 : Flux POS → Vente → Facture Auto

**Scénario :**

1. **Caissier crée vente :**
   - Caissier sur `/pos`
   - Ajoute produits
   - Finalise vente
   - ✅ Commande créée avec `source='pos'`, statut `completed`

2. **Facture auto-générée :**
   - ✅ Facture créée automatiquement
   - ✅ Statut: `paid`
   - ✅ Liée à la commande

3. **Admin voit vente :**
   - Admin va sur `/admin/orders`
   - Filtre par `source=pos`
   - ✅ Vente visible avec infos cashier et store

4. **Vérifier stock :**
   - ✅ Stock déduit immédiatement
   - ✅ InventoryLog enregistré

### Test 6.3 : Flux Commercial → Client → Commande → Facture

**Scénario :**

1. **Commercial crée commande :**
   - Commercial sur `/commercial/pos`
   - Sélectionne client assigné
   - Ajoute produits
   - Finalise
   - ✅ Commande avec `source='commercial_pos'`

2. **Commercial suit commande :**
   - Va sur `/commercial/orders`
   - ✅ Commande visible
   - Change statut si nécessaire

3. **Commercial génère facture :**
   - Ouvre détails commande
   - Génère facture
   - ✅ Facture créée
   - ✅ Facture visible dans `/commercial/invoices`

4. **Client paie :**
   - Commercial enregistre paiement
   - ✅ Statut facture → "paid"
   - ✅ Analytics mis à jour

### Test 6.4 : Produit Spécial End-to-End

**Scénario :**

1. **Client configure produit spécial :**
   - Va sur `/shop/special-products`
   - Choisit un produit
   - Configure étape par étape
   - Ajoute au panier

2. **Commande créée :**
   - Passe commande
   - ✅ OrderItem contient `variantA`, `variantB`, `combinationId`

3. **Facture générée :**
   - Admin génère facture
   - ✅ Items contiennent informations de combinaison

4. **Vérifier dans DB :**
   - ✅ Combinaison enregistrée correctement
   - ✅ Image de combinaison référencée

---

## 🔒 Tests de Permissions {#tests-permissions}

### Test 7.1 : Isolation Commercial

**Test Critique :**

1. **Créer 2 commerciaux :**
   - Commercial A
   - Commercial B

2. **Assigner clients :**
   - Client 1, 2, 3 → Commercial A
   - Client 4, 5 → Commercial B

3. **Commercial A se connecte :**
   - Va sur `/commercial/clients`
   - ✅ Voit uniquement clients 1, 2, 3
   - ✅ NE VOIT PAS clients 4, 5

4. **Commercial B se connecte :**
   - Va sur `/commercial/clients`
   - ✅ Voit uniquement clients 4, 5
   - ✅ NE VOIT PAS clients 1, 2, 3

5. **Tester API directement :**
   - Commercial A : `GET /api/commercial/clients`
   - ✅ Retourne seulement ses clients
   - ✅ Status 200

   - Commercial A : `GET /api/commercial/clients?clientId=<client_de_B>`
   - ✅ Erreur 403 ou client non trouvé

### Test 7.2 : Caissier Ne Peut Pas Voir Admin

**Étapes :**
1. Se connecter en caissier
2. Essayer d'accéder à `/admin/dashboard` directement dans l'URL

**Résultat Attendu :**
- ✅ Redirection vers `/pos`
- ✅ Message d'erreur si nécessaire

### Test 7.3 : Client Ne Peut Pas Voir Dashboard

**Étapes :**
1. Se connecter en client
2. Essayer `/admin/dashboard`
3. Essayer `/commercial`

**Résultat Attendu :**
- ✅ Accès refusé
- ✅ Redirection vers `/shop`

### Test 7.4 : Admin Voit Tout

**Étapes :**
1. Se connecter en admin
2. Accéder à :
   - `/admin/dashboard` ✅
   - `/admin/orders` ✅
   - `/commercial` ✅
   - `/pos` ✅

**Résultat Attendu :**
- ✅ Accès à tous les dashboards
- ✅ Voit toutes les commandes
- ✅ Peut créer commandes pour n'importe quel client

---

## 📊 Tests Analytics {#tests-analytics}

### Test 8.1 : Analytics Globales

**Étapes :**
1. Admin va sur `/admin/analytics`
2. Vérifier métriques :
   - Revenu total
   - Nombre de commandes
   - Revenu net

**Vérifications :**
- ✅ Chiffres cohérents avec les commandes dans la DB
- ✅ Graphiques s'affichent
- ✅ Pas d'erreurs

### Test 8.2 : Analytics par Source

**Étapes :**
1. Filtrer par source = "catalog"
2. Vérifier revenus
3. Filtrer par source = "pos"
4. Vérifier revenus
5. Filtrer par source = "commercial_pos"
6. Vérifier revenus

**Résultat Attendu :**
- ✅ Chaque source montre des chiffres différents
- ✅ Total = somme de toutes les sources
- ✅ Graphiques se mettent à jour

### Test 8.3 : Analytics Commercial

**Étapes :**
1. Commercial va sur `/commercial`
2. Vérifier stats personnelles :
   - Nombre de clients
   - Nombre de commandes
   - Revenu généré

**Résultat Attendu :**
- ✅ Stats uniquement pour ce commercial
- ✅ Ne compte pas les commandes d'autres commerciaux
- ✅ Revenus corrects

### Test 8.4 : Analytics par Magasin

**Étapes :**
1. Admin va sur `/admin/analytics`
2. Sélectionner un magasin
3. Vérifier ventes de ce magasin

**Résultat Attendu :**
- ✅ Uniquement ventes POS de ce magasin
- ✅ Revenus du magasin
- ✅ Graphiques mis à jour

---

## ⚡ Tests de Performance {#tests-performance}

### Test 9.1 : Charge de Commandes

**Étapes :**
1. Créer 100 commandes de test (via script ou manuellement)
2. Aller sur `/admin/orders`
3. Vérifier temps de chargement

**Résultat Attendu :**
- ✅ Pagination fonctionne
- ✅ Chargement < 2 secondes
- ✅ Pas d'erreurs

### Test 9.2 : Recherche Rapide

**Étapes :**
1. Dans `/admin/orders`
2. Rechercher par numéro de commande
3. Rechercher par nom de client

**Résultat Attendu :**
- ✅ Résultats instantanés
- ✅ Index MongoDB utilisés
- ✅ Pas de timeout

---

## ❌ Tests de Gestion des Erreurs {#tests-errors}

### Test 10.1 : Stock Insuffisant

**Étapes :**
1. Prendre produit avec stock = 1
2. Créer 2 commandes pour ce produit en même temps
3. Voir comportement

**Résultat Attendu :**
- ✅ Première commande réussit
- ✅ Deuxième commande échoue avec message clair
- ✅ Pas de stock négatif

### Test 10.2 : Client Invalide

**Étapes :**
1. Commercial essaie de créer commande pour client non assigné
2. (Modifier clientId dans la requête)

**Résultat Attendu :**
- ✅ Erreur 403
- ✅ Message: "Client non assigné"
- ✅ Commande non créée

### Test 10.3 : Token Manquant

**Étapes :**
1. Supprimer token du localStorage
2. Essayer d'accéder à une page protégée

**Résultat Attendu :**
- ✅ Redirection vers `/login`
- ✅ Message d'erreur approprié

---

## ✅ Checklist de Test Finale

### Authentification
- [ ] Login admin fonctionne
- [ ] Login commercial fonctionne
- [ ] Login caissier fonctionne
- [ ] Login client fonctionne
- [ ] Déconnexion fonctionne
- [ ] Token expiré géré correctement

### E-commerce
- [ ] Navigation fonctionne
- [ ] Produits s'affichent
- [ ] Ajout au panier fonctionne
- [ ] Configuration produit spécial fonctionne
- [ ] Checkout fonctionne
- [ ] Commande créée avec source='catalog'

### POS
- [ ] Interface POS charge
- [ ] Produits disponibles
- [ ] Vente simple fonctionne
- [ ] Vente produit spécial fonctionne
- [ ] Remise fonctionne
- [ ] Commande créée avec source='pos'

### Commercial
- [ ] Dashboard charge
- [ ] Voit uniquement ses clients
- [ ] Peut créer commandes pour ses clients
- [ ] Voit uniquement ses commandes
- [ ] Peut générer factures
- [ ] Isolation des données fonctionne

### Admin
- [ ] Voit toutes les commandes
- [ ] Filtres par source fonctionnent
- [ ] Peut créer commandes
- [ ] Peut assigner commerciaux
- [ ] Analytics fonctionnent
- [ ] Voit toutes les factures

### Factures
- [ ] Création depuis commande fonctionne
- [ ] Numérotation ROI-INV-YYYY-XXXX correcte
- [ ] Enregistrement de paiement fonctionne
- [ ] Statuts se mettent à jour

### Permissions
- [ ] Commercial isolé correctement
- [ ] Caissier ne voit pas admin
- [ ] Client ne voit pas dashboards
- [ ] Admin voit tout

### Performance
- [ ] Listes paginées fonctionnent
- [ ] Recherche rapide
- [ ] Pas de timeout

---

## 📝 Notes de Test

### Données de Test Recommandées

**Créer via script ou manuellement :**

```javascript
// Exemple de commandes de test
Orders:
  - 5 commandes catalog (source='catalog')
  - 3 ventes POS (source='pos')
  - 4 commandes commercial (source='commercial_pos')
  - 2 commandes admin (source='admin')

Factures:
  - Quelques factures payées
  - Quelques factures impayées
  - Quelques factures en retard
```

### Problèmes Courants

1. **Erreur "Token invalide"**
   - Vérifier que JWT_SECRET est défini
   - Vérifier token dans localStorage

2. **Produits ne chargent pas**
   - Vérifier connexion MongoDB
   - Vérifier route `/api/pos/products` ou `/api/commercial/products`

3. **Permissions refusées**
   - Vérifier rôle utilisateur dans DB
   - Vérifier middleware protect

---

## 🎯 Scénarios de Test Prioritaires

**À tester en premier (critiques) :**

1. ✅ Création commande catalog → Vérifier dans admin
2. ✅ Création vente POS → Vérifier source='pos'
3. ✅ Création commande commercial → Vérifier isolation
4. ✅ Génération facture → Vérifier numérotation
5. ✅ Filtrage par source dans admin orders

**Testez ces scénarios en premier pour valider les fonctionnalités de base !**

---

Ce guide couvre tous les tests nécessaires. Testez systématiquement chaque scénario et notez les problèmes rencontrés pour correction.

