import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { securityHeaders } from './backend/middleware/security.middleware.js';
import { errorHandler } from './backend/middleware/errorHandler.middleware.js';

// Import all routes
import authRoutes from './backend/routes/auth.routes.js';
import categoryRoutes from './backend/routes/category.routes.js';
import productRoutes from './backend/routes/product.routes.js';
import specialProductRoutes from './backend/routes/specialProduct.routes.js';
import uploadRoutes from './backend/routes/upload.routes.js';
import inventoryRoutes from './backend/routes/inventory.routes.js';
import orderRoutes from './backend/routes/order.routes.js';
import invoiceRoutes from './backend/routes/invoice.routes.js';
import auditLogRoutes from './backend/routes/auditLog.routes.js';
import analyticsRoutes from './backend/routes/analytics.routes.js';
import commercialAnalyticsRoutes from './backend/routes/commercialAnalytics.routes.js';
import ordersProductsAnalyticsRoutes from './backend/routes/ordersProductsAnalytics.routes.js';
import advancedCommercialAnalyticsRoutes from './backend/routes/advancedCommercialAnalytics.routes.js';
import supplierRoutes from './backend/routes/supplier.routes.js';
import purchaseOrderRoutes from './backend/routes/purchaseOrder.routes.js';
import expenseRoutes from './backend/routes/expense.routes.js';
import expenseCategoryRoutes from './backend/routes/expenseCategory.routes.js';
import returnRoutes from './backend/routes/return.routes.js';
import crmRoutes from './backend/routes/crm.routes.js';
import posRoutes from './backend/routes/pos.routes.js';
import jobRoutes from './backend/routes/job.routes.js';
import clientAuthRoutes from './backend/routes/clientAuth.routes.js';
import clientRoutes from './backend/routes/client.routes.js';
import clientOrderRoutes from './backend/routes/clientOrder.routes.js';
import userRoutes from './backend/routes/user.routes.js';
import settingsRoutes from './backend/routes/settings.routes.js';
import commercialRoutes from './backend/routes/commercial.routes.js';
import homepageRoutes from './backend/routes/homepage.routes.js';
import supplierInvoiceRoutes from './backend/routes/supplierInvoice.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate required environment variables
const requiredEnvVars = ['NODE_ENV', 'PORT', 'JWT_SECRET'];
const missingVars = [];

requiredEnvVars.forEach((name) => {
  if (!process.env[name]) {
    missingVars.push(name);
  }
});

// Mongo URI: support both MONGO_URI and MONGODB_URI
const mongoUriEnv = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoUriEnv) {
  missingVars.push('MONGO_URI (or MONGODB_URI)');
}

// JWT expiration: support JWT_EXPIRES_IN and legacy JWT_EXPIRE
const jwtExpiresEnv = process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRE;
if (!jwtExpiresEnv) {
  missingVars.push('JWT_EXPIRES_IN (or JWT_EXPIRE)');
}

if (missingVars.length > 0) {
  console.error('❌ ERROR: Missing required environment variables:');
  missingVars.forEach((name) => console.error(`- ${name}`));
  console.error('📝 Please update your .env file before starting the server.');
  process.exit(1);
}

const app = express();

// Trust proxy when running behind a reverse proxy
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security headers
app.use(securityHeaders);

// Body parsing middleware
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files from backend/uploads
app.use('/uploads', express.static(path.join(__dirname, 'backend', 'uploads')));

// ============================================
// API ROUTES (must be before SPA fallback)
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/special-products', specialProductRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/analytics/commercials', commercialAnalyticsRoutes);
app.use('/api/analytics/commercials/advanced', advancedCommercialAnalyticsRoutes);
app.use('/api/analytics/orders-products', ordersProductsAnalyticsRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/expense-categories', expenseCategoryRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/commercial', commercialRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/supplier-invoices', supplierInvoiceRoutes);

// Client routes (public and authenticated)
app.use('/api/client/auth', clientAuthRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/client/orders', clientOrderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler for API routes
app.use('/api', errorHandler);

// ============================================
// FRONTEND (SPA) - must be after API routes
// ============================================
// Serve static files from dist folder
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback: serve index.html for all non-API routes
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return next();
  }
  // Skip uploads
  if (req.path.startsWith('/uploads')) {
    return next();
  }
  // Serve index.html for all other routes (SPA routing)
  res.sendFile(path.join(distPath, 'index.html'));
});

// ============================================
// START SERVER
// ============================================
// Connect to MongoDB
let mongoUri = mongoUriEnv;

// Determine if we should use SSL based on the connection string
const isMongoAtlas = mongoUri.includes('mongodb+srv://') || mongoUri.includes('mongodb.net');

// For non-Atlas connections, ensure SSL is disabled in the URI
if (!isMongoAtlas) {
  // Remove any existing ssl/tls parameters to avoid conflicts
  mongoUri = mongoUri.replace(/[?&](ssl|tls)=[^&]*/g, '');
  
  // Add ssl=false to explicitly disable SSL
  const separator = mongoUri.includes('?') ? '&' : '?';
  mongoUri = `${mongoUri}${separator}ssl=false`;
}

// Connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

mongoose
  .connect(mongoUri, mongooseOptions)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📦 Frontend served from: ${distPath}`);
      console.log(`🔌 API available at: http://localhost:${PORT}/api`);
      console.log(`🌐 Open: http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

export default app;

