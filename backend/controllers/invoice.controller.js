import Invoice from '../models/Invoice.model.js';
import Payment from '../models/Payment.model.js';
import Order from '../models/Order.model.js';

export const getInvoices = async (req, res, next) => {
  try {
    const { status, startDate, endDate } = req.query;
    const query = {};
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    const invoices = await Invoice.find(query).populate('orderId', 'orderNumber').sort({ createdAt: -1 });
    res.json({ success: true, data: invoices });
  } catch (error) {
    next(error);
  }
};

export const getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('orderId');
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'الفاتورة غير موجودة' });
    }
    res.json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

export const createInvoice = async (req, res, next) => {
  try {
    const { orderId, dueDate, notes } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'رقم الطلب مطلوب' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }

    // Check if invoice already exists for this order
    const existingInvoice = await Invoice.findOne({ orderId });
    if (existingInvoice) {
      return res.status(400).json({ success: false, message: 'تم إنشاء فاتورة لهذا الطلب بالفعل' });
    }

    // Build invoice items from order
    const invoiceItems = order.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount || 0,
      tax: (item.total * 0.19) / 1.19,
      total: item.total,
    }));

    const subtotal = order.subtotal;
    const discount = order.discount;
    const tax = order.tax;
    const total = order.total;

    const invoice = await Invoice.create({
      orderId,
      clientId: order.clientId,
      clientName: order.clientName,
      clientAddress: order.clientAddress,
      items: invoiceItems,
      subtotal,
      discount,
      tax,
      total,
      paidAmount: 0,
      remainingAmount: total,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      notes: notes || '',
      createdBy: req.user._id,
      status: 'draft',
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

export const recordPayment = async (req, res, next) => {
  try {
    const { amount, paymentMethod, paymentDate, reference, notes } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'الفاتورة غير موجودة' });
    }

    const payment = await Payment.create({
      invoiceId: invoice._id,
      amount,
      paymentMethod,
      paymentDate: paymentDate || new Date(),
      reference,
      notes,
      recordedBy: req.user._id,
    });

    invoice.paidAmount = (invoice.paidAmount || 0) + amount;
    invoice.remainingAmount = invoice.total - invoice.paidAmount;
    
    if (invoice.remainingAmount <= 0) {
      invoice.status = 'paid';
      invoice.paidAt = new Date();
    } else if (invoice.paidAmount > 0) {
      invoice.status = 'partial';
    }

    await invoice.save();

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

export const getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ invoiceId: req.params.id })
      .populate('recordedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

