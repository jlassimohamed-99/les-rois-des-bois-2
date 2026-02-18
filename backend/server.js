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

console.log('📁 Server starting...');
console.log('📁 __dirname:', __dirname);
console.log('📁 NODE_ENV:', process.env.NODE_ENV);
console.log('📁 PORT:', process.env.PORT || 5000);

// Ensure uploads directory and subdirectories exist
const uploadsDir = path.join(__dirname, 'uploads');
const uploadSubdirs = ['categories', 'products', 'special-products', 'settings', 'expenses', 'general'];

console.log('📁 Creating uploads directory:', uploadsDir);
fs.mkdirSync(uploadsDir, { recursive: true });
console.log('✅ Main uploads directory created');

uploadSubdirs.forEach(subdir => {
  const subdirPath = path.join(uploadsDir, subdir);
  fs.mkdirSync(subdirPath, { recursive: true });
  console.log(`✅ Created upload subdirectory: ${subdir}`);
});

console.log('✅ All upload directories initialized');

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
  // Support comma-separated list of URLs
  const frontendUrls = process.env.FRONTEND_URL.split(',').map(url => url.trim());
  allowedOrigins.push(...frontendUrls);
}

// Allow localhost origins only in non-production environments for development
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173', 'http://localhost:3000');
}

// Debug: Log allowed origins
console.log('🌐 [CORS] Allowed origins:', allowedOrigins);

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

      // Log rejected origins for debugging
      console.warn('⚠️ [CORS] Rejected origin:', origin);
      console.warn('⚠️ [CORS] Allowed origins:', allowedOrigins);
      
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
      'X-Cashier-Id'
    ],
    exposedHeaders: ['Authorization'],
    optionsSuccessStatus: 200, // Some legacy browsers (IE11) choke on 204
    preflightContinue: false,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware - log all incoming requests
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📥 [${timestamp}] ${req.method} ${req.path}`);
  console.log(`📥 [REQUEST] Headers:`, {
    host: req.headers.host,
    origin: req.headers.origin,
    'content-type': req.headers['content-type'],
    'content-length': req.headers['content-length'],
    'user-agent': req.headers['user-agent']?.substring(0, 50),
  });
  if (Object.keys(req.query || {}).length > 0) {
    console.log(`📥 [REQUEST] Query params:`, req.query);
  }
  if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') && req.body) {
    const bodyKeys = Object.keys(req.body);
    console.log(`📥 [REQUEST] Body keys (${bodyKeys.length}):`, bodyKeys);
    // Don't log full body for large uploads, just keys
    if (!req.headers['content-type']?.includes('multipart/form-data')) {
      console.log(`📥 [REQUEST] Body preview:`, JSON.stringify(req.body).substring(0, 200));
    }
  }
  next();
});

// Rate limiting (temporarily disabled to fix connection issues)
// app.use('/api/', apiLimiter);
// app.use('/api/auth', authLimiter);
// app.use('/api/client', clientLimiter);

// Serve uploaded files - MUST be before API routes
// This allows direct access to uploaded files via /uploads/* URLs
const uploadsStaticPath = path.join(__dirname, 'uploads');
console.log('📁 Configuring static file serving for uploads:', uploadsStaticPath);
console.log('📁 Uploads will be accessible at: /uploads/*');

app.use('/uploads', (req, res, next) => {
  console.log(`📁 [STATIC] Request for upload file: ${req.path}`);
  next();
}, express.static(uploadsStaticPath, {
  setHeaders: (res, filePath) => {
    console.log(`📁 [STATIC] Serving file: ${filePath}`);
    // Set proper headers for images
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || 
        filePath.endsWith('.png') || filePath.endsWith('.gif') || 
        filePath.endsWith('.webp')) {
      const ext = filePath.split('.').pop();
      res.setHeader('Content-Type', `image/${ext}`);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      console.log(`📁 [STATIC] Set image headers for: ${ext}`);
    }
  },
  fallthrough: false, // Don't continue to next middleware if file not found
}));

// Routes
console.log('🛣️  Registering API routes...');

app.use('/api/auth', (req, res, next) => {
  console.log(`🔐 [AUTH] ${req.method} ${req.path}`);
  next();
}, authRoutes);

app.use('/api/users', (req, res, next) => {
  console.log(`👥 [USERS] ${req.method} ${req.path}`);
  next();
}, userRoutes);

app.use('/api/categories', (req, res, next) => {
  console.log(`📂 [CATEGORIES] ${req.method} ${req.path}`);
  next();
}, categoryRoutes);

app.use('/api/products', (req, res, next) => {
  console.log(`📦 [PRODUCTS] ${req.method} ${req.path}`);
  next();
}, productRoutes);

app.use('/api/special-products', (req, res, next) => {
  console.log(`⭐ [SPECIAL-PRODUCTS] ${req.method} ${req.path}`);
  next();
}, specialProductRoutes);

app.use('/api/uploads', (req, res, next) => {
  console.log(`📤 [UPLOADS] ${req.method} ${req.path}`);
  console.log(`📤 [UPLOADS] Content-Type: ${req.headers['content-type']}`);
  next();
}, uploadRoutes);
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
  console.log('🏥 [HEALTH] Health check requested');
  const healthData = {
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
  };
  console.log('🏥 [HEALTH] Health check response:', healthData);
  res.json(healthData);
});

// Root route - prevent "Cannot GET /" error
app.get('/', (req, res) => {
  console.log('🌐 [ROOT] Root route accessed');
  console.log('🌐 [ROOT] Request headers:', {
    host: req.headers.host,
    'user-agent': req.headers['user-agent'],
    origin: req.headers.origin,
  });
  
  const rootData = {
    status: 'OK',
    message: 'Les Rois des Bois API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/health',
      uploads: '/uploads',
      api: '/api/*',
    },
    server: {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
    }
  };
  
  console.log('🌐 [ROOT] Root route response:', rootData);
  res.json(rootData);
});

// Error handler with logging
app.use((err, req, res, next) => {
  console.error('❌ [ERROR] Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    statusCode: err.statusCode || 500,
  });
  errorHandler(err, req, res, next);
});

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

console.log('🔌 Connecting to MongoDB...');
console.log('🔌 MongoDB URI:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')); // Hide password

mongoose
  .connect(mongoUri, mongooseOptions)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log('🚀 SERVER STARTED SUCCESSFULLY');
      console.log('='.repeat(50));
      console.log(`🌐 Server running on port: ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}`);
      console.log(`🌐 Root URL: http://localhost:${PORT}/`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 Uploads: http://localhost:${PORT}/uploads/`);
      console.log('='.repeat(50));
    });
    
    // Log server errors
    server.on('error', (error) => {
      console.error('❌ [SERVER] Server error:', error);
    });
    
    // Log when server closes
    server.on('close', () => {
      console.log('🛑 [SERVER] Server closed');
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    process.exit(1);
  });

export default app;