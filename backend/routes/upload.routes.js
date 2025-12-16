import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/auth.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = path.join(__dirname, '../uploads');

    if (req.path.includes('/category')) {
      uploadPath = path.join(uploadPath, 'categories');
    } else if (req.path.includes('/product')) {
      uploadPath = path.join(uploadPath, 'products');
    } else if (req.path.includes('/special-product')) {
      uploadPath = path.join(uploadPath, 'special-products');
    } else if (req.path.includes('/settings')) {
      uploadPath = path.join(uploadPath, 'settings');
    } else if (req.path.includes('/expense') || req.path.includes('/receipt')) {
      uploadPath = path.join(uploadPath, 'expenses');
    } else {
      uploadPath = path.join(uploadPath, 'general');
    }

    // Ensure the upload directory exists
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('يسمح فقط بملفات الصور (jpeg, jpg, png, gif, webp)'));
  }
};

// File filter for receipts (images + PDF)
const receiptFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';

  if (mimetype || extname) {
    return cb(null, true);
  } else {
    cb(new Error('يسمح فقط بملفات الصور أو PDF (jpeg, jpg, png, gif, webp, pdf)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: imageFilter,
});

const uploadReceipt = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for receipts (can include PDFs)
  },
  fileFilter: receiptFilter,
});

const router = express.Router();

// Category image upload
router.post('/category', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'لم يتم رفع أي ملف',
    });
  }

  res.status(200).json({
    success: true,
    data: {
      filename: req.file.filename,
      path: `/uploads/categories/${req.file.filename}`,
      originalName: req.file.originalname,
    },
  });
});

// Product image upload (single)
router.post('/product', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'لم يتم رفع أي ملف',
    });
  }

  res.status(200).json({
    success: true,
    data: {
      filename: req.file.filename,
      path: `/uploads/products/${req.file.filename}`,
      originalName: req.file.originalname,
    },
  });
});

// Product multiple images upload
router.post('/product/multiple', protect, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'لم يتم رفع أي ملفات',
    });
  }

  const files = req.files.map(file => ({
    filename: file.filename,
    path: `/uploads/products/${file.filename}`,
    originalName: file.originalname,
  }));

  res.status(200).json({
    success: true,
    data: files,
  });
});

// Special product combination image upload
router.post('/special-product', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'لم يتم رفع أي ملف',
    });
  }

  res.status(200).json({
    success: true,
    data: {
      filename: req.file.filename,
      path: `/uploads/special-products/${req.file.filename}`,
      originalName: req.file.originalname,
    },
  });
});

// Settings logo upload
router.post('/settings/logo', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'لم يتم رفع أي ملف',
    });
  }

  res.status(200).json({
    success: true,
    data: {
      filename: req.file.filename,
      path: `/uploads/settings/${req.file.filename}`,
      originalName: req.file.originalname,
    },
  });
});

// Expense receipt upload (supports images and PDFs)
router.post('/expense/receipt', protect, uploadReceipt.single('receipt'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'لم يتم رفع أي ملف',
    });
  }

  res.status(200).json({
    success: true,
    data: {
      filename: req.file.filename,
      path: `/uploads/expenses/${req.file.filename}`,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
    },
  });
});

export default router;

