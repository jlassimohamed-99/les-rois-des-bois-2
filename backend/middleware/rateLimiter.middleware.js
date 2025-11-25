import rateLimit from 'express-rate-limit';

/**
 * Rate limiting middleware for API protection
 */

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// Rate limiter for client endpoints
export const clientLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: 'Too many requests, please try again later.',
});

// Rate limiter for order creation
export const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit to 5 orders per minute
  message: 'Too many order requests, please try again later.',
});

