import Product from '../models/Product.model.js';
import SpecialProduct from '../models/SpecialProduct.model.js';
import InventoryLog from '../models/InventoryLog.model.js';
import StockAlert from '../models/StockAlert.model.js';

export const adjustStock = async (productId, productType, quantityChange, reason, userId, options = {}) => {
  let product;
  
  if (productType === 'regular') {
    product = await Product.findById(productId);
  } else {
    product = await SpecialProduct.findById(productId);
  }

  if (!product) {
    throw new Error('Product not found');
  }

  const quantityBefore = product.stock || 0;
  const quantityAfter = Math.max(0, quantityBefore + quantityChange);
  const changeType = quantityChange > 0 ? 'increase' : quantityChange < 0 ? 'decrease' : 'adjustment';

  // Update stock
  product.stock = quantityAfter;
  await product.save();

  // Create inventory log
  await InventoryLog.create({
    productId,
    productType,
    changeType,
    reason,
    quantityBefore,
    quantityAfter,
    quantityChange,
    userId,
    orderId: options.orderId,
    invoiceId: options.invoiceId,
    notes: options.notes || '',
  });

  // Check for stock alerts
  await checkStockAlerts(productId, productType, quantityAfter);

  return {
    quantityBefore,
    quantityAfter,
    quantityChange,
  };
};

export const checkStockAlerts = async (productId, productType, currentStock) => {
  const threshold = 10; // Default threshold, can be configurable per product

  if (currentStock <= threshold) {
    // Check if alert already exists
    const existingAlert = await StockAlert.findOne({
      productId,
      status: 'active',
    });

    if (!existingAlert) {
      await StockAlert.create({
        productId,
        productType,
        currentStock,
        threshold,
        status: 'active',
      });
    } else {
      existingAlert.currentStock = currentStock;
      await existingAlert.save();
    }
  } else {
    // Resolve active alerts if stock is above threshold
    await StockAlert.updateMany(
      {
        productId,
        status: 'active',
      },
      {
        status: 'resolved',
        resolvedAt: new Date(),
      }
    );
  }
};

export const validateStock = async (items) => {
  const stockIssues = [];

  for (const item of items) {
    let product;
    let productType = 'regular';
    
    // Try to determine product type from item or by trying to find it
    if (item.productType) {
      productType = item.productType;
    }
    
    // Try regular product first
    product = await Product.findById(item.productId);
    
    if (!product) {
      // Try special product
      product = await SpecialProduct.findById(item.productId);
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

    // For regular products, check stock directly
    if (productType === 'regular') {
      if ((product.stock || 0) < item.quantity) {
        stockIssues.push({
          productId: item.productId,
          productName: item.productName || product.name,
          requested: item.quantity,
          available: product.stock || 0,
          error: 'Insufficient stock',
        });
      }
    }
    // For special products, stock validation will be done during stock deduction
    // based on base products
  }

  return stockIssues;
};

