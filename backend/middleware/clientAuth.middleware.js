import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

// Middleware for client authentication (no admin check)
export const clientAuth = async (req, res, next) => {
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

