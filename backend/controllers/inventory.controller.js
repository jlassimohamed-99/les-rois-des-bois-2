import InventoryLog from '../models/InventoryLog.model.js';
import StockAlert from '../models/StockAlert.model.js';
import { adjustStock, checkStockAlerts } from '../utils/inventoryHelper.js';
import { createAuditLog } from '../utils/auditLogger.js';

export const getInventoryLogs = async (req, res, next) => {
  try {
    const { productId, changeType, startDate, endDate, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (productId) query.productId = productId;
    if (changeType) query.changeType = changeType;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      InventoryLog.find(query)
        .populate('productId', 'name')
        .populate('userId', 'name email')
        .populate('orderId', 'orderNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      InventoryLog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const adjustInventory = async (req, res, next) => {
  try {
    const { productId, productType, quantity, reason, notes } = req.body;

    if (!productId || !productType || quantity === undefined || !reason) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال جميع الحقول المطلوبة',
      });
    }

    const result = await adjustStock(
      productId,
      productType,
      parseInt(quantity),
      reason,
      req.user._id,
      { notes }
    );

    // Create audit log
    await createAuditLog({
      resourceType: 'inventory',
      resourceId: productId,
      action: 'stock_change',
      userId: req.user._id,
      userEmail: req.user.email,
      before: { stock: result.quantityBefore },
      after: { stock: result.quantityAfter },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      data: result,
      message: 'تم تعديل المخزون بنجاح',
    });
  } catch (error) {
    next(error);
  }
};

export const getStockAlerts = async (req, res, next) => {
  try {
    const alerts = await StockAlert.find({ status: 'active' })
      .populate('productId', 'name images stock')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

export const resolveStockAlert = async (req, res, next) => {
  try {
    const alert = await StockAlert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'التنبيه غير موجود',
      });
    }

    alert.status = 'resolved';
    alert.resolvedAt = new Date();
    await alert.save();

    res.status(200).json({
      success: true,
      message: 'تم حل التنبيه بنجاح',
    });
  } catch (error) {
    next(error);
  }
};

