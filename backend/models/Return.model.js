import mongoose from 'mongoose';

const returnItemSchema = new mongoose.Schema({
  orderItemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
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
  refundAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  restocked: {
    type: Boolean,
    default: false,
  },
});

const returnSchema = new mongoose.Schema(
  {
    returnNumber: {
      type: String,
      unique: true,
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    reason: {
      type: String,
      required: true,
    },
    items: [returnItemSchema],
    totalRefund: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    creditNoteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CreditNote',
    },
    restocked: {
      type: Boolean,
      default: false,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Generate return number
returnSchema.pre('save', async function (next) {
  if (!this.returnNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Return').countDocuments({
      returnNumber: new RegExp(`^RET-${year}`),
    });
    this.returnNumber = `RET-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Indexes
// Note: returnNumber already has unique: true, which creates an index automatically
returnSchema.index({ orderId: 1 });
returnSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Return', returnSchema);

