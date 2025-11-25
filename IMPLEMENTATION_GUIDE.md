# Guide d'Implémentation - Modules Restants

Ce document fournit les instructions détaillées pour implémenter tous les modules restants du tableau de bord admin.

## 📦 Structure des Fichiers à Créer

### Backend

```
backend/
├── controllers/
│   ├── inventory.controller.js ✅ (créé)
│   ├── order.controller.js ✅ (créé)
│   ├── invoice.controller.js
│   ├── auditLog.controller.js
│   ├── analytics.controller.js
│   ├── job.controller.js
│   ├── pos.controller.js
│   ├── supplier.controller.js
│   ├── purchaseOrder.controller.js
│   ├── expense.controller.js
│   ├── return.controller.js
│   └── crm.controller.js
├── routes/
│   ├── inventory.routes.js ✅ (créé)
│   ├── order.routes.js ✅ (créé)
│   ├── invoice.routes.js
│   ├── auditLog.routes.js
│   ├── analytics.routes.js
│   ├── job.routes.js
│   ├── pos.routes.js
│   ├── supplier.routes.js
│   ├── purchaseOrder.routes.js
│   ├── expense.routes.js
│   ├── return.routes.js
│   └── crm.routes.js
├── utils/
│   ├── auditLogger.js ✅ (créé)
│   ├── inventoryHelper.js ✅ (créé)
│   ├── orderHelper.js ✅ (créé)
│   ├── pdfGenerator.js
│   └── emailService.js
├── queue/
│   ├── queue.js
│   ├── workers/
│   │   ├── pdfWorker.js
│   │   ├── imageWorker.js
│   │   └── reportWorker.js
└── models/ ✅ (tous créés)
```

### Frontend

```
frontend/src/
├── pages/
│   ├── Inventory/
│   │   ├── InventoryManagement.jsx
│   │   ├── InventoryLogs.jsx
│   │   └── StockAlerts.jsx
│   ├── Orders/
│   │   ├── OrdersList.jsx
│   │   ├── OrderDetail.jsx
│   │   └── CreateOrder.jsx
│   ├── Invoices/
│   │   ├── InvoicesList.jsx
│   │   ├── InvoiceDetail.jsx
│   │   └── CreateInvoice.jsx
│   ├── AuditLogs/
│   │   └── AuditLogs.jsx
│   ├── Analytics/
│   │   ├── AnalyticsDashboard.jsx
│   │   ├── SalesReports.jsx
│   │   └── ProfitabilityReports.jsx
│   ├── Jobs/
│   │   ├── JobQueue.jsx
│   │   └── JobDetail.jsx
│   ├── POS/
│   │   ├── POSDashboard.jsx
│   │   ├── CreateSale.jsx
│   │   └── SalesHistory.jsx
│   ├── Suppliers/
│   │   ├── SuppliersList.jsx
│   │   ├── SupplierDetail.jsx
│   │   └── CreateSupplier.jsx
│   ├── PurchaseOrders/
│   │   ├── POList.jsx
│   │   ├── PODetail.jsx
│   │   └── CreatePO.jsx
│   ├── Expenses/
│   │   ├── ExpensesList.jsx
│   │   └── CreateExpense.jsx
│   ├── Returns/
│   │   ├── ReturnsList.jsx
│   │   ├── ReturnDetail.jsx
│   │   └── CreateReturn.jsx
│   └── CRM/
│       ├── ClientsList.jsx
│       ├── ClientDetail.jsx
│       ├── LeadsList.jsx
│       └── CommercialPerformance.jsx
└── components/
    ├── Inventory/
    ├── Orders/
    ├── Invoices/
    ├── Analytics/
    ├── POS/
    └── Shared/
```

## 🔧 Étapes d'Implémentation

### Étape 1: Invoice Management

#### Contrôleur (invoice.controller.js)

```javascript
import Invoice from '../models/Invoice.model.js';
import Payment from '../models/Payment.model.js';
import Order from '../models/Order.model.js';
import { createAuditLog } from '../utils/auditLogger.js';

export const getInvoices = async (req, res, next) => {
  // Similar to getOrders
};

export const createInvoice = async (req, res, next) => {
  // Create invoice from order
  // Calculate totals
  // Generate invoice number
  // Queue PDF generation
};

export const recordPayment = async (req, res, next) => {
  // Create payment record
  // Update invoice paidAmount and status
  // Update order paymentStatus if linked
};

export const sendInvoiceEmail = async (req, res, next) => {
  // Queue email job
};
```

#### Routes (invoice.routes.js)

```javascript
router.get('/', protect, getInvoices);
router.get('/:id', protect, getInvoice);
router.post('/', protect, createInvoice);
router.post('/:id/payments', protect, recordPayment);
router.get('/:id/payments', protect, getPayments);
router.post('/:id/send-email', protect, sendInvoiceEmail);
router.get('/:id/pdf', protect, getInvoicePDF);
```

### Étape 2: Audit Logs

#### Contrôleur (auditLog.controller.js)

```javascript
import { getAuditLogs } from '../utils/auditLogger.js';

export const getAuditLogsController = async (req, res, next) => {
  const { resourceType, resourceId, action, userId, startDate, endDate, page, limit } = req.query;
  
  const result = await getAuditLogs(
    { resourceType, resourceId, action, userId, startDate, endDate },
    { page, limit }
  );
  
  res.status(200).json({
    success: true,
    data: result.logs,
    pagination: result.pagination,
  });
};
```

### Étape 3: Analytics

#### Contrôleur (analytics.controller.js)

```javascript
import Order from '../models/Order.model.js';
import Invoice from '../models/Invoice.model.js';
import Product from '../models/Product.model.js';

export const getSalesOverTime = async (req, res, next) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;
  
  // MongoDB aggregation pipeline
  const pipeline = [
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
        status: { $ne: 'canceled' },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: groupBy === 'day' ? '%Y-%m-%d' : groupBy === 'week' ? '%Y-%U' : '%Y-%m',
            date: '$createdAt',
          },
        },
        sales: { $sum: 1 },
        revenue: { $sum: '$total' },
      },
    },
    { $sort: { _id: 1 } },
  ];
  
  const data = await Order.aggregate(pipeline);
  res.json({ success: true, data });
};

export const getRevenueByCategory = async (req, res, next) => {
  // Aggregation with Product and Category
};

export const getTopProducts = async (req, res, next) => {
  // Aggregation on Order items
};
```

### Étape 4: Job Queue System

#### Configuration (queue/queue.js)

```javascript
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

export const pdfQueue = new Queue('pdf-generation', { connection });
export const imageQueue = new Queue('image-processing', { connection });
export const reportQueue = new Queue('report-generation', { connection });

// Workers
export const pdfWorker = new Worker('pdf-generation', async (job) => {
  // Generate PDF logic
}, { connection });

export const imageWorker = new Worker('image-processing', async (job) => {
  // Process images
}, { connection });
```

#### Contrôleur (job.controller.js)

```javascript
import { pdfQueue, imageQueue, reportQueue } from '../queue/queue.js';

export const getJobs = async (req, res, next) => {
  const { status, type, page, limit } = req.query;
  const queue = type === 'pdf' ? pdfQueue : type === 'image' ? imageQueue : reportQueue;
  
  const jobs = await queue.getJobs([status || 'waiting', 'active', 'completed', 'failed']);
  // Paginate and return
};

export const retryJob = async (req, res, next) => {
  const job = await queue.getJob(req.params.id);
  await job.retry();
};
```

### Étape 5: POS Module

#### Contrôleur (pos.controller.js)

```javascript
import Sale from '../models/Sale.model.js';
import Store from '../models/Store.model.js';
import { adjustStock } from '../utils/inventoryHelper.js';

export const createSale = async (req, res, next) => {
  // Create sale
  // Deduct stock immediately
  // Generate receipt
  // Queue receipt PDF
};

export const getStoreDashboard = async (req, res, next) => {
  const { storeId } = req.params;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [todaySales, ongoingOrders, lowStock] = await Promise.all([
    Sale.countDocuments({ storeId, createdAt: { $gte: today } }),
    Order.countDocuments({ storeId, status: { $in: ['pending', 'preparing', 'ready'] } }),
    Product.find({ stock: { $lte: 10 } }),
  ]);
  
  res.json({ success: true, data: { todaySales, ongoingOrders, lowStock } });
};
```

### Étape 6: Supplier & Billing

Les contrôleurs suivent le même pattern que les autres modules CRUD.

### Étape 7: Returns & Refunds

#### Contrôleur (return.controller.js)

```javascript
import Return from '../models/Return.model.js';
import CreditNote from '../models/CreditNote.model.js';
import { adjustStock } from '../utils/inventoryHelper.js';

export const createReturn = async (req, res, next) => {
  // Create return request
  // Calculate refund amount
};

export const approveReturn = async (req, res, next) => {
  // Approve return
  // Create credit note
  // Restock items if needed
};

export const restockItems = async (req, res, next) => {
  // Restock returned items
  // Update inventory logs
};
```

### Étape 8: CRM

#### Contrôleur (crm.controller.js)

```javascript
import User from '../models/User.model.js';
import Lead from '../models/Lead.model.js';
import Order from '../models/Order.model.js';

export const getClients = async (req, res, next) => {
  // Get users with clientType
};

export const assignCommercial = async (req, res, next) => {
  // Assign commercial to client
};

export const getCommercialPerformance = async (req, res, next) => {
  // Aggregate sales, revenue, clients for commercial
};
```

## 🎨 Frontend - Composants Clés

### DataTable Component (réutilisable)

```jsx
// components/Shared/DataTable.jsx
const DataTable = ({ columns, data, onRowClick, pagination, onPageChange }) => {
  // Table with sorting, filtering, pagination
};
```

### FilterBar Component

```jsx
// components/Shared/FilterBar.jsx
const FilterBar = ({ filters, onFilterChange, onReset }) => {
  // Date range, status, search filters
};
```

### Chart Components

```jsx
// components/Analytics/SalesChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const SalesChart = ({ data }) => {
  return (
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="revenue" stroke="#f59e0b" />
    </LineChart>
  );
};
```

## 📝 Notes Importantes

1. **Permissions**: Ajouter des vérifications de permissions dans chaque route
2. **Validation**: Utiliser express-validator pour valider les entrées
3. **Error Handling**: Gérer les erreurs de manière cohérente
4. **Audit Logs**: Logger toutes les actions importantes
5. **Stock Management**: Toujours valider et ajuster le stock correctement
6. **PDF Generation**: Utiliser des queues pour les PDFs lourds
7. **Email**: Configurer un service d'email (SendGrid, Nodemailer)
8. **Redis**: Nécessaire pour BullMQ (job queue)

## 🚀 Ordre d'Implémentation Recommandé

1. ✅ Models (fait)
2. ✅ Inventory Management (fait)
3. ✅ Orders Management (fait)
4. Invoice Management
5. Audit Logs
6. Analytics
7. Job Queue
8. POS
9. Suppliers & Purchase Orders
10. Returns & Refunds
11. CRM
12. Frontend pages

Chaque module peut être implémenté indépendamment en suivant les patterns établis.

