import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'الاسم مطلوب'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'البريد الإلكتروني مطلوب'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'كلمة المرور مطلوبة'],
      minlength: [6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'],
      select: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['admin', 'commercial', 'store_manager', 'store_cashier', 'accountant', 'inventory_manager', 'user', 'client'],
      default: 'user',
    },
    // CRM fields
    clientType: {
      type: String,
      enum: ['individual', 'business'],
    },
    commercialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    companyName: {
      type: String,
    },
    taxId: {
      type: String,
    },
    creditLimit: {
      type: Number,
      default: 0,
    },
    paymentTerms: {
      type: String,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    lastOrderDate: {
      type: Date,
    },
    clientStatus: {
      type: String,
      enum: ['active', 'inactive', 'blocked'],
      default: 'active',
    },
    // Store assignment
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
    },
    // Client fields
    phone: {
      type: String,
    },
    addresses: [
      {
        fullName: String,
        street: String,
        city: String,
        zip: String,
        phone: String,
        isDefault: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

export default mongoose.model('User', userSchema);

