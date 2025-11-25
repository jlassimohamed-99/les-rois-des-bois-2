import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
});

const saleSchema = new mongoose.Schema(
  {
    saleNumber: {
      type: String,
      unique: true,
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    cashierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [saleItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'mixed'],
      required: true,
    },
    cashReceived: {
      type: Number,
      default: 0,
      min: 0,
    },
    change: {
      type: Number,
      default: 0,
      min: 0,
    },
    receiptPath: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Generate sale number
saleSchema.pre('save', async function (next) {
  if (!this.saleNumber) {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const count = await mongoose.model('Sale').countDocuments({
      saleNumber: new RegExp(`^SALE-${dateStr}`),
    });
    this.saleNumber = `SALE-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Indexes
saleSchema.index({ saleNumber: 1 });
saleSchema.index({ storeId: 1, createdAt: -1 });
saleSchema.index({ cashierId: 1, createdAt: -1 });
saleSchema.index({ createdAt: -1 });

export default mongoose.model('Sale', saleSchema);

