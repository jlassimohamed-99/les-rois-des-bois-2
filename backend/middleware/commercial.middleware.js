import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

// Middleware for Commercial routes - allows admin and commercial roles
export const protectCommercial = async (req, res, next) => {
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

      // Allow admin and commercial roles
      const allowedRoles = ['admin', 'commercial'];
      const userRole = req.user.role || (req.user.isAdmin ? 'admin' : null);

      if (!userRole || !allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية للوصول إلى هذه الصفحة',
        });
      }

      // For commercial users, ensure they can only access their own data
      if (userRole === 'commercial') {
        req.commercialId = req.user._id;
      } else {
        // Admin can access all data, but can also filter by commercialId
        req.commercialId = req.user._id; // Can be overridden by query params
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

// Helper middleware to ensure commercial can only access their own clients
export const filterByCommercial = (req, res, next) => {
  // If user is commercial (not admin), filter by their ID
  if (req.user.role === 'commercial' && !req.user.isAdmin) {
    req.query.commercialId = req.commercialId.toString();
  }
  next();
};

