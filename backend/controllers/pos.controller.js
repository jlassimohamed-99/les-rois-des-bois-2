import Sale from '../models/Sale.model.js';
import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import SpecialProduct from '../models/SpecialProduct.model.js';
import Category from '../models/Category.model.js';
import Setting from '../models/Setting.model.js';
import Invoice from '../models/Invoice.model.js';
import { adjustStock, validateStock } from '../utils/inventoryHelper.js';
import { buildOrderItems, calculateOrderTotals } from '../utils/orderHelper.js';

export const getStoreDashboard = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todaySales, ongoingOrders, lowStock] = await Promise.all([
      Sale.countDocuments({
        storeId,
        createdAt: { $gte: today },
      }),
      Order.countDocuments({
        storeId,
        status: { $in: ['pending', 'preparing', 'ready'] },
      }),
      Product.find({ stock: { $lte: 10 } }).limit(10),
    ]);

    res.json({
      success: true,
      data: {
        todaySales,
        ongoingOrders,
        lowStock,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSales = async (req, res, next) => {
  try {
    const { storeId, startDate, endDate, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (storeId) query.storeId = storeId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [sales, total] = await Promise.all([
      Sale.find(query)
        .populate('storeId', 'name code')
        .populate('cashierId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Sale.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: sales,
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

export const createSale = async (req, res, next) => {
  try {
    const { storeId, items, discount, paymentMethod, cashReceived } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'يجب إضافة منتجات',
      });
    }

    let subtotal = 0;
    items.forEach((item) => {
      subtotal += (item.unitPrice * item.quantity) - (item.discount || 0);
    });

    const discountAmount = discount || 0;
    const tax = (subtotal - discountAmount) * 0.19;
    const total = subtotal - discountAmount + tax;
    const change = paymentMethod === 'cash' && cashReceived ? cashReceived - total : 0;

    const sale = await Sale.create({
      storeId,
      cashierId: req.user._id,
      items,
      subtotal,
      discount: discountAmount,
      tax,
      total,
      paymentMethod,
      cashReceived: cashReceived || total,
      change: Math.max(0, change),
    });

    // Deduct stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock = Math.max(0, (product.stock || 0) - item.quantity);
        await product.save();
      }
    }

    res.status(201).json({ success: true, data: sale });
  } catch (error) {
    next(error);
  }
};

// Get all products for POS (regular + special)
export const getPOSProducts = async (req, res, next) => {
  try {
    const [regularProducts, specialProducts, categories] = await Promise.all([
      Product.find({ status: 'visible' })
        .populate('category', 'name slug')
        .sort({ name: 1 }),
      SpecialProduct.find({ status: 'visible' })
        .populate('baseProductA', 'name images variants price')
        .populate('baseProductB', 'name images variants price')
        .sort({ name: 1 }),
      Category.find().sort({ name: 1 }),
    ]);

    res.json({
      success: true,
      data: {
        regularProducts,
        specialProducts,
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create POS order
export const createPOSOrder = async (req, res, next) => {
  try {
    const { items, discount, vat, total, notes, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'يجب إضافة منتجات إلى السلة',
      });
    }

    // Validate stock manually for POS items (handle special products)
    const stockIssues = [];
    for (const item of items) {
      // Try to find product
      let product = await Product.findById(item.productId);
      let productType = 'regular';
      
      if (!product) {
        product = await SpecialProduct.findById(item.productId).populate('baseProductA').populate('baseProductB');
        productType = 'special';
      }

      if (!product) {
        stockIssues.push({
          productId: item.productId,
          productName: item.productName || 'Unknown',
          error: 'Product not found',
        });
        continue;
      }

      if (productType === 'regular') {
        if ((product.stock || 0) < item.quantity) {
          stockIssues.push({
            productId: item.productId,
            productName: product.name,
            requested: item.quantity,
            available: product.stock || 0,
            error: 'Insufficient stock',
          });
        }
      } else {
        // For special products, check base products stock
        // Note: We'll validate during stock deduction
      }
    }

    if (stockIssues.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'بعض المنتجات غير متوفرة بالكمية المطلوبة',
        stockIssues,
      });
    }

    // Get settings for VAT if not provided
    let vatRate = vat;
    if (!vatRate) {
      const settings = await Setting.findOne();
      vatRate = settings?.vat || 19;
    }

    // Build order items - handle special products with combinations
    const orderItems = [];
    for (const itemData of items) {
      let product = await Product.findById(itemData.productId);
      let productType = 'regular';

      if (!product) {
        product = await SpecialProduct.findById(itemData.productId);
        productType = 'special';
      }

      if (!product) {
        throw new Error(`Product not found: ${itemData.productId}`);
      }

      const item = {
        productId: product._id,
        productType,
        productName: product.name,
        quantity: itemData.quantity,
        unitPrice: itemData.unitPrice || product.price || product.finalPrice,
        cost: product.cost || product.finalPrice * 0.6,
        discount: itemData.discount || 0,
      };

      // Handle special product combinations
      if (productType === 'special' && itemData.combinationId) {
        const combination = product.combinations.find(
          (c) => c._id.toString() === itemData.combinationId
        );
        if (combination) {
          item.variantA = combination.optionA;
          item.variantB = combination.optionB;
          item.combinationId = itemData.combinationId.toString();
          item.unitPrice = product.finalPrice + (combination.additionalPrice || 0);
        }
      }

      item.subtotal = item.unitPrice * item.quantity;
      item.total = item.subtotal - item.discount;

      orderItems.push(item);
    }

    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = discount || 0;
    const taxAmount = ((subtotal - discountAmount) * vatRate) / 100;
    const finalTotal = subtotal - discountAmount + taxAmount;

    // Generate unique order number
    let orderNumber;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      const orderCount = await Order.countDocuments();
      orderNumber = `ORD-${String(orderCount + 1).padStart(6, '0')}`;
      const existingOrder = await Order.findOne({ orderNumber });
      if (!existingOrder) break;
      attempts++;
      if (attempts >= maxAttempts) {
        // Fallback: use timestamp if all attempts fail
        orderNumber = `ORD-${Date.now()}`;
        break;
      }
    } while (attempts < maxAttempts);

    // Create order
    const order = await Order.create({
      orderNumber,
      clientName: 'عميل مباشر',
      clientPhone: '',
      status: 'completed',
      items: orderItems,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total: finalTotal,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'paid',
      notes: notes || '',
      completedAt: new Date(),
    });

    // Deduct stock for each item
    for (const item of orderItems) {
      if (item.productType === 'regular') {
        await adjustStock(
          item.productId,
          'regular',
          -item.quantity,
          'POS Sale',
          req.user._id,
          { orderId: order._id }
        );
      } else if (item.productType === 'special') {
        // For special products, deduct from base products
        const specialProduct = await SpecialProduct.findById(item.productId);
        if (specialProduct) {
          if (item.variantA && item.variantA.productId) {
            await adjustStock(
              item.variantA.productId,
              'regular',
              -item.quantity,
              'POS Sale - Special Product',
              req.user._id,
              { orderId: order._id }
            );
          }
          if (item.variantB && item.variantB.productId) {
            await adjustStock(
              item.variantB.productId,
              'regular',
              -item.quantity,
              'POS Sale - Special Product',
              req.user._id,
              { orderId: order._id }
            );
          }
        }
      }
    }

    // Generate unique invoice number
    const year = new Date().getFullYear();
    let invoiceNumber;
    let invoiceAttempts = 0;
    const maxInvoiceAttempts = 10;
    
    do {
      const invoiceCount = await Invoice.countDocuments({
        invoiceNumber: new RegExp(`^INV-${year}`),
      });
      invoiceNumber = `INV-${year}-${String(invoiceCount + 1).padStart(6, '0')}`;
      const existingInvoice = await Invoice.findOne({ invoiceNumber });
      if (!existingInvoice) break;
      invoiceAttempts++;
      if (invoiceAttempts >= maxInvoiceAttempts) {
        // Fallback: use timestamp if all attempts fail
        invoiceNumber = `INV-${year}-${Date.now()}`;
        break;
      }
    } while (invoiceAttempts < maxInvoiceAttempts);

    // Create invoice automatically
    const invoice = await Invoice.create({
      invoiceNumber,
      orderId: order._id,
      clientName: order.clientName,
      clientAddress: order.clientAddress || '',
      items: orderItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        tax: (item.total * vatRate) / (100 + vatRate),
        total: item.total,
      })),
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total: finalTotal,
      paidAmount: finalTotal,
      remainingAmount: 0,
      status: 'paid',
      dueDate: new Date(),
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: {
        order,
        invoice,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Generate invoice PDF for POS order
export const generatePOSInvoice = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود',
      });
    }

    let invoice = await Invoice.findOne({ orderId });
    if (!invoice) {
      // Generate unique invoice number
      const year = new Date().getFullYear();
      let invoiceNumber;
      let attempts = 0;
      const maxAttempts = 10;
      
      do {
        const invoiceCount = await Invoice.countDocuments({
          invoiceNumber: new RegExp(`^INV-${year}`),
        });
        invoiceNumber = `INV-${year}-${String(invoiceCount + 1).padStart(6, '0')}`;
        const existingInvoice = await Invoice.findOne({ invoiceNumber });
        if (!existingInvoice) break;
        attempts++;
        if (attempts >= maxAttempts) {
          invoiceNumber = `INV-${year}-${Date.now()}`;
          break;
        }
      } while (attempts < maxAttempts);

      // Create invoice if it doesn't exist
      invoice = await Invoice.create({
        invoiceNumber,
        orderId: order._id,
        clientName: order.clientName,
        clientAddress: order.clientAddress || '',
        items: order.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          tax: item.total * 0.19 / 1.19,
          total: item.total,
        })),
        subtotal: order.subtotal,
        discount: order.discount,
        tax: order.tax,
        total: order.total,
        paidAmount: order.total,
        remainingAmount: 0,
        status: 'paid',
        dueDate: new Date(),
        createdBy: req.user._id,
      });
    }

    // For now, return invoice data as JSON
    // PDF generation can be added later with PDFKit or similar
    res.json({
      success: true,
      message: 'Invoice generated successfully',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

