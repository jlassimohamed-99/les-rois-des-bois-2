import mongoose from 'mongoose';

const creditNoteSchema = new mongoose.Schema(
  {
    creditNoteNumber: {
      type: String,
      unique: true,
      required: true,
    },
    returnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Return',
      required: true,
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'issued', 'applied', 'canceled'],
      default: 'draft',
    },
    appliedToInvoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    issuedAt: {
      type: Date,
    },
    appliedAt: {
      type: Date,
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

// Generate credit note number
creditNoteSchema.pre('save', async function (next) {
  if (!this.creditNoteNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('CreditNote').countDocuments({
      creditNoteNumber: new RegExp(`^CN-${year}`),
    });
    this.creditNoteNumber = `CN-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Indexes
creditNoteSchema.index({ creditNoteNumber: 1 });
creditNoteSchema.index({ returnId: 1 });
creditNoteSchema.index({ invoiceId: 1 });

export default mongoose.model('CreditNote', creditNoteSchema);

