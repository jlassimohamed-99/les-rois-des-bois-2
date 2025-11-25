import Return from '../models/Return.model.js';
import Order from '../models/Order.model.js';
import { adjustStock } from '../utils/inventoryHelper.js';

export const getReturns = async (req, res, next) => {
  try {
    const { orderId, status, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (orderId) query.orderId = orderId;
    if (status) query.status = status;

    const [returns, total] = await Promise.all([
      Return.find(query)
        .populate('orderId', 'orderNumber')
        .populate('processedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Return.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: returns,
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

export const createReturn = async (req, res, next) => {
  try {
    const { orderId, items, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }

    let totalRefund = 0;
    items.forEach((item) => {
      totalRefund += item.refundAmount || 0;
    });

    const returnDoc = await Return.create({
      orderId,
      items,
      reason,
      totalRefund,
      status: 'pending',
    });

    res.status(201).json({ success: true, data: returnDoc });
  } catch (error) {
    next(error);
  }
};

export const approveReturn = async (req, res, next) => {
  try {
    const returnDoc = await Return.findById(req.params.id);
    if (!returnDoc) {
      return res.status(404).json({ success: false, message: 'المرتجع غير موجود' });
    }

    returnDoc.status = 'approved';
    returnDoc.processedBy = req.user._id;
    returnDoc.processedAt = new Date();
    await returnDoc.save();

    res.json({ success: true, data: returnDoc });
  } catch (error) {
    next(error);
  }
};

export const restockItems = async (req, res, next) => {
  try {
    const returnDoc = await Return.findById(req.params.id);
    if (!returnDoc) {
      return res.status(404).json({ success: false, message: 'المرتجع غير موجود' });
    }

    for (const item of returnDoc.items) {
      await adjustStock(
        item.productId,
        'regular',
        item.quantity,
        `Return ${returnDoc.returnNumber} restocked`,
        req.user._id
      );
    }

    returnDoc.restocked = true;
    returnDoc.status = 'completed';
    await returnDoc.save();

    res.json({ success: true, message: 'تم إعادة المخزون بنجاح' });
  } catch (error) {
    next(error);
  }
};

