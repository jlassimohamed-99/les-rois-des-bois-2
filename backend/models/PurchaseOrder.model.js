import mongoose from 'mongoose';

const poItemSchema = new mongoose.Schema({
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
  unitCost: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      unique: true,
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'received', 'completed', 'canceled'],
      default: 'draft',
    },
    items: [poItemSchema],
    subtotal: {
      type: Number,
      required: true,
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
    expectedDeliveryDate: {
      type: Date,
    },
    receivedAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate PO number
purchaseOrderSchema.pre('save', async function (next) {
  if (!this.poNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('PurchaseOrder').countDocuments({
      poNumber: new RegExp(`^PO-${year}`),
    });
    this.poNumber = `PO-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Indexes
// Note: poNumber already has unique: true, which creates an index automatically
purchaseOrderSchema.index({ supplierId: 1, createdAt: -1 });
purchaseOrderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('PurchaseOrder', purchaseOrderSchema);

