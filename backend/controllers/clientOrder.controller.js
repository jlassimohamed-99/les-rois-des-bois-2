import Order from '../models/Order.model.js';
import OrderActivity from '../models/OrderActivity.model.js';
import { buildOrderItems, calculateOrderTotals } from '../utils/orderHelper.js';
import { validateStock, adjustStock } from '../utils/inventoryHelper.js';
import Product from '../models/Product.model.js';
import SpecialProduct from '../models/SpecialProduct.model.js';

// Create order from client
export const createClientOrder = async (req, res, next) => {
  try {
    const {
      items,
      discount,
      paymentMethod,
      notes,
      shippingAddress,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'يجب إضافة منتجات على الأقل',
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'عنوان الشحن مطلوب',
      });
    }

    // Validate stock
    const stockIssues = await validateStock(items);
    if (stockIssues.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'بعض المنتجات غير متوفرة في المخزون',
        stockIssues,
      });
    }

    // Build order items - catalog orders use gros (wholesale) pricing
    const orderItems = await buildOrderItems(items, 'gros');

    // Calculate totals
    const totals = calculateOrderTotals(orderItems, discount || 0);

    // Get user info
    const user = req.user;

    // Format shipping address as string
    let formattedAddress = '';
    if (typeof shippingAddress === 'object' && shippingAddress !== null) {
      const parts = [];
      if (shippingAddress.street) parts.push(shippingAddress.street);
      if (shippingAddress.city) parts.push(shippingAddress.city);
      if (shippingAddress.zip) parts.push(shippingAddress.zip);
      formattedAddress = parts.join(', ');
    } else if (typeof shippingAddress === 'string') {
      formattedAddress = shippingAddress;
    }

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
        orderNumber = `ORD-${Date.now()}`;
        break;
      }
    } while (attempts < maxAttempts);

    // Create order from catalog
    const order = await Order.create({
      orderNumber,
      clientId: user._id,
      clientName: user.name,
      clientPhone: user.phone || shippingAddress?.phone || '',
      clientEmail: user.email || shippingAddress?.email || '',
      clientAddress: formattedAddress,
      items: orderItems,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      cost: totals.cost,
      profit: totals.profit,
      paymentMethod: paymentMethod || 'cash',
      notes,
      source: 'catalog', // Catalog orders from e-commerce
      status: 'pending',
    });

    // Create activity log
    await OrderActivity.create({
      orderId: order._id,
      action: 'created',
      userId: user._id,
      notes: 'تم إنشاء الطلب من الموقع',
    });

    // Deduct stock for each item
    for (const item of orderItems) {
      if (item.productType === 'regular') {
        await adjustStock(
          item.productId,
          'regular',
          -item.quantity,
          'E-commerce Order',
          user._id,
          { orderId: order._id }
        );
      } else if (item.productType === 'special') {
        // For special products, deduct from base products
        const specialProduct = await SpecialProduct.findById(item.productId);
        if (specialProduct && item.variantA && item.variantB) {
          // Deduct from variant A base product
          if (item.variantA.productId) {
            const baseProductA = await Product.findById(item.variantA.productId);
            if (baseProductA && item.variantA.variant) {
              // Find the variant and update its stock
              const variantA = baseProductA.variants?.find(
                v => v.value === item.variantA.variant.value || 
                     v._id?.toString() === item.variantA.variant._id?.toString()
              );
              if (variantA) {
                variantA.stock = Math.max(0, (variantA.stock || 0) - item.quantity);
                await baseProductA.save();
              } else {
                // No variant, deduct from product stock
                await adjustStock(
                  item.variantA.productId,
                  'regular',
                  -item.quantity,
                  'E-commerce Order - Special Product',
                  user._id,
                  { orderId: order._id }
                );
              }
            } else if (baseProductA) {
              await adjustStock(
                item.variantA.productId,
                'regular',
                -item.quantity,
                'E-commerce Order - Special Product',
                user._id,
                { orderId: order._id }
              );
            }
          }
          
          // Deduct from variant B base product
          if (item.variantB.productId) {
            const baseProductB = await Product.findById(item.variantB.productId);
            if (baseProductB && item.variantB.variant) {
              // Find the variant and update its stock
              const variantB = baseProductB.variants?.find(
                v => v.value === item.variantB.variant.value || 
                     v._id?.toString() === item.variantB.variant._id?.toString()
              );
              if (variantB) {
                variantB.stock = Math.max(0, (variantB.stock || 0) - item.quantity);
                await baseProductB.save();
              } else {
                // No variant, deduct from product stock
                await adjustStock(
                  item.variantB.productId,
                  'regular',
                  -item.quantity,
                  'E-commerce Order - Special Product',
                  user._id,
                  { orderId: order._id }
                );
              }
            } else if (baseProductB) {
              await adjustStock(
                item.variantB.productId,
                'regular',
                -item.quantity,
                'E-commerce Order - Special Product',
                user._id,
                { orderId: order._id }
              );
            }
          }
        }
      }
    }

    // Update user stats
    user.totalOrders = (user.totalOrders || 0) + 1;
    user.totalSpent = (user.totalSpent || 0) + totals.total;
    user.lastOrderDate = new Date();
    await user.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('clientId', 'name email');

    res.status(201).json({
      success: true,
      data: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// Get client orders
export const getClientOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = { clientId: req.user._id };
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('items.productId', 'name images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
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

// Get single client order
export const getClientOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      clientId: req.user._id,
    })
      .populate('items.productId', 'name images')
      .populate('clientId', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود',
      });
    }

    // Get order activities
    const activities = await OrderActivity.find({ orderId: order._id })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        order,
        activities,
      },
    });
  } catch (error) {
    next(error);
  }
};

