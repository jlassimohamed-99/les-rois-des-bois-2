import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    expenseNumber: {
      type: String,
      unique: true,
      required: true,
    },
    category: {
      type: String,
      enum: ['supplies', 'utilities', 'rent', 'salaries', 'marketing', 'other'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    paymentMethod: {
      type: String,
    },
    expenseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    receiptPath: {
      type: String,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate expense number
expenseSchema.pre('save', async function (next) {
  if (!this.expenseNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Expense').countDocuments({
      expenseNumber: new RegExp(`^EXP-${year}`),
    });
    this.expenseNumber = `EXP-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Indexes
expenseSchema.index({ expenseNumber: 1 });
expenseSchema.index({ category: 1, expenseDate: -1 });
expenseSchema.index({ expenseDate: -1 });

export default mongoose.model('Expense', expenseSchema);

