import mongoose from 'mongoose';

const supplierInvoiceItemSchema = new mongoose.Schema({
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

const supplierInvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    items: [supplierInvoiceItemSchema],
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
    status: {
      type: String,
      enum: ['pending', 'paid', 'partial', 'overdue', 'canceled'],
      default: 'pending',
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    pdfPath: {
      type: String,
      default: '',
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
    inventoryLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryLog',
    },
  },
  {
    timestamps: true,
  }
);

// Generate invoice number before saving
supplierInvoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const year = new Date().getFullYear();
    // Use this.constructor instead of mongoose.model to avoid circular dependency
    const SupplierInvoiceModel = this.constructor;
    const count = await SupplierInvoiceModel.countDocuments({
      invoiceNumber: new RegExp(`^SI-${year}`),
    });
    this.invoiceNumber = `SI-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Indexes
supplierInvoiceSchema.index({ supplierId: 1, createdAt: -1 });
supplierInvoiceSchema.index({ invoiceNumber: 1 });

export default mongoose.model('SupplierInvoice', supplierInvoiceSchema);

