import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح بالوصول - يرجى تسجيل الدخول',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'المستخدم غير موجود',
        });
      }

      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية للوصول إلى هذا المورد',
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'رمز الدخول غير صالح',
      });
    }
  } catch (error) {
    next(error);
  }
};

// Middleware for POS routes - allows admin, store_cashier, saler, and store_manager
export const protectPOS = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح بالوصول - يرجى تسجيل الدخول',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'المستخدم غير موجود',
        });
      }

      // Allow admin, store_cashier, cashier, saler, store_manager, and commercial
      const allowedRoles = ['admin', 'store_cashier', 'cashier', 'saler', 'store_manager', 'commercial'];
      let userRole = req.user.role || (req.user.isAdmin ? 'admin' : null);
      
      // Normalize cashier to store_cashier
      if (userRole === 'cashier') {
        userRole = 'store_cashier';
      }

      if (!userRole || !allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية للوصول إلى نقطة البيع',
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'رمز الدخول غير صالح',
      });
    }
  } catch (error) {
    next(error);
  }
};

