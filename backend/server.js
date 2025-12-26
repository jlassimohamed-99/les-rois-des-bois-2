import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { securityHeaders } from './middleware/security.middleware.js';
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import productRoutes from './routes/product.routes.js';
import specialProductRoutes from './routes/specialProduct.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import orderRoutes from './routes/order.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import auditLogRoutes from './routes/auditLog.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import commercialAnalyticsRoutes from './routes/commercialAnalytics.routes.js';
import ordersProductsAnalyticsRoutes from './routes/ordersProductsAnalytics.routes.js';
import advancedCommercialAnalyticsRoutes from './routes/advancedCommercialAnalytics.routes.js';
import supplierRoutes from './routes/supplier.routes.js';
import purchaseOrderRoutes from './routes/purchaseOrder.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import expenseCategoryRoutes from './routes/expenseCategory.routes.js';
import returnRoutes from './routes/return.routes.js';
import crmRoutes from './routes/crm.routes.js';
import posRoutes from './routes/pos.routes.js';
import jobRoutes from './routes/job.routes.js';
import clientAuthRoutes from './routes/clientAuth.routes.js';
import clientRoutes from './routes/client.routes.js';
import clientOrderRoutes from './routes/clientOrder.routes.js';
import userRoutes from './routes/user.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import commercialRoutes from './routes/commercial.routes.js';
import homepageRoutes from './routes/homepage.routes.js';
import supplierInvoiceRoutes from './routes/supplierInvoice.routes.js';

// Import error handler
import { errorHandler } from './middleware/errorHandler.middleware.js';

dotenv.config();

// Validate required environment variables (with backward-compatible aliases)
const requiredEnvVars = ['NODE_ENV', 'PORT', 'JWT_SECRET', 'FRONTEND_URL'];
const missingVars = [];

// Basic required vars
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
  console.error('📝 Please update your backend .env file before starting the server.');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory and subdirectories exist
const uploadsDir = path.join(__dirname, 'uploads');
const uploadSubdirs = ['categories', 'products', 'special-products', 'settings', 'expenses', 'general'];

fs.mkdirSync(uploadsDir, { recursive: true });
uploadSubdirs.forEach(subdir => {
  fs.mkdirSync(path.join(uploadsDir, subdir), { recursive: true });
});

console.log('✅ Upload directories initialized');

const app = express();

// Trust proxy when running behind a reverse proxy (e.g. Hostinger, Nginx)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security headers
app.use(securityHeaders);

// CORS configuration
const allowedOrigins = [];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Allow localhost origins only in non-production environments for development
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173', 'http://localhost:3000');
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients with no Origin header (e.g. curl, Postman)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting (temporarily disabled to fix connection issues)
// app.use('/api/', apiLimiter);
// app.use('/api/auth', authLimiter);
// app.use('/api/client', clientLimiter);

// Serve uploaded files - MUST be before API routes
// This allows direct access to uploaded files via /uploads/* URLs
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    // Set proper headers for images
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || 
        filePath.endsWith('.png') || filePath.endsWith('.gif') || 
        filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/' + filePath.split('.').pop());
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    }
  }
}));

// Routes
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

// Root route - prevent "Cannot GET /" error
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Les Rois des Bois API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      uploads: '/uploads'
    }
  });
});

// Error handler
app.use(errorHandler);

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

// Connection options - only set timeout options, don't set SSL here to avoid conflicts
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
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

export default app;

