import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'اسم المورد مطلوب'],
      trim: true,
    },
    code: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    contactName: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    taxId: {
      type: String,
    },
    paymentTerms: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
supplierSchema.index({ code: 1 });
supplierSchema.index({ isActive: 1 });

export default mongoose.model('Supplier', supplierSchema);

