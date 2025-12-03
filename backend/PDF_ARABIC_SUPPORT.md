# Support de l'Arabe dans les PDFs

## Problème
PDFKit ne supporte pas nativement l'arabe avec les polices par défaut (Helvetica). Cela cause l'affichage de caractères incorrects dans les PDFs générés.

## Solution
Utilisation de Puppeteer pour générer des PDFs à partir de templates HTML qui supportent naturellement l'arabe et le RTL.

## Installation

### 1. Installer les dépendances
```bash
cd backend
npm install puppeteer handlebars
```

### 2. Puppeteer installera automatiquement Chromium
Puppeteer téléchargera automatiquement une version de Chromium lors de l'installation. Cela peut prendre quelques minutes.

### 3. Vérifier l'installation
Le système devrait maintenant pouvoir générer des PDFs avec support complet de l'arabe.

## Fichiers modifiés

- `backend/services/htmlToPdfService.js` - Nouveau service pour générer PDFs à partir de HTML
- `backend/services/commercialAnalyticsPdfService.js` - Modifié pour utiliser HTML templates
- `backend/services/expensePdfService.js` - À modifier pour utiliser HTML templates
- `backend/templates/commercialAnalytics.html` - Template HTML pour analytics commerciaux
- `backend/package.json` - Ajout de puppeteer et handlebars

## Notes

- Les templates HTML utilisent `dir="rtl"` et `lang="ar"` pour un support complet du RTL
- Les polices Arial et Tahoma supportent l'arabe nativement
- Les PDFs générés sont compatibles avec tous les lecteurs PDF

## En cas d'erreur

Si Puppeteer ne peut pas être installé ou utilisé, le système affichera une erreur claire.
Pour les environnements sans interface graphique, Puppeteer fonctionne en mode headless.


