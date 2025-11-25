import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
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
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    clientName: {
      type: String,
      required: true,
    },
    clientAddress: {
      type: String,
    },
    clientTaxId: {
      type: String,
    },
    items: [invoiceItemSchema],
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
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'partial', 'overdue', 'canceled'],
      default: 'draft',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    paidAt: {
      type: Date,
    },
    pdfPath: {
      type: String,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
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

// Generate invoice number
invoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Invoice').countDocuments({
      invoiceNumber: new RegExp(`^INV-${year}`),
    });
    this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Indexes
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ orderId: 1 });
invoiceSchema.index({ clientId: 1, createdAt: -1 });
invoiceSchema.index({ status: 1, createdAt: -1 });
invoiceSchema.index({ dueDate: 1, status: 1 });

export default mongoose.model('Invoice', invoiceSchema);

