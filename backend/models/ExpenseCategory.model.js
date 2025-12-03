import mongoose from 'mongoose';

const expenseCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    orderIndex: {
      type: Number,
      default: 0,
    },
    isCommercialExpense: {
      type: Boolean,
      default: false,
    },
    subcategories: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
expenseCategorySchema.index({ orderIndex: 1 });
expenseCategorySchema.index({ name: 1 });

export default mongoose.model('ExpenseCategory', expenseCategorySchema);

