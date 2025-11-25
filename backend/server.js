import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { securityHeaders } from './middleware/security.middleware.js';
// Temporarily disable rate limiting to fix connection issues
// import { apiLimiter, authLimiter, clientLimiter } from './middleware/rateLimiter.middleware.js';

// Import routes
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
import supplierRoutes from './routes/supplier.routes.js';
import purchaseOrderRoutes from './routes/purchaseOrder.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import returnRoutes from './routes/return.routes.js';
import crmRoutes from './routes/crm.routes.js';
import posRoutes from './routes/pos.routes.js';
import jobRoutes from './routes/job.routes.js';
import clientAuthRoutes from './routes/clientAuth.routes.js';
import clientRoutes from './routes/client.routes.js';
import clientOrderRoutes from './routes/clientOrder.routes.js';
import userRoutes from './routes/user.routes.js';
import settingsRoutes from './routes/settings.routes.js';

// Import error handler
import { errorHandler } from './middleware/errorHandler.middleware.js';

dotenv.config();

// Check for required environment variables
if (!process.env.JWT_SECRET) {
  console.error('❌ ERROR: JWT_SECRET is not defined in .env file');
  console.error('📝 Please create a .env file in the backend directory with:');
  console.error('   JWT_SECRET=your-super-secret-jwt-key-change-in-production');
  console.error('   See backend/ENV_SETUP.md for more details');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security headers
app.use(securityHeaders);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting (temporarily disabled to fix connection issues)
// app.use('/api/', apiLimiter);
// app.use('/api/auth', authLimiter);
// app.use('/api/client', clientLimiter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/settings', settingsRoutes);

// Client routes (public and authenticated)
app.use('/api/client/auth', clientAuthRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/client/orders', clientOrderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler
app.use(errorHandler);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/les-rois-des-bois')
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

