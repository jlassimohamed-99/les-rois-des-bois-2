import Product from '../models/Product.model.js';
import SpecialProduct from '../models/SpecialProduct.model.js';

export const calculateOrderTotals = (items, discount = 0, taxRate = 0.19) => {
  let subtotal = 0;
  let totalCost = 0;

  items.forEach((item) => {
    const itemSubtotal = (item.unitPrice * item.quantity) - (item.discount || 0);
    subtotal += itemSubtotal;
    totalCost += (item.cost || 0) * item.quantity;
  });

  const discountAmount = discount;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const tax = subtotalAfterDiscount * taxRate;
  const total = subtotalAfterDiscount + tax;
  const profit = subtotalAfterDiscount - totalCost;

  return {
    subtotal,
    discount: discountAmount,
    tax,
    total,
    cost: totalCost,
    profit,
  };
};

export const buildOrderItems = async (itemsData) => {
  const items = [];

  for (const itemData of itemsData) {
    let product;
    let productType = 'regular';

    // Try regular product first
    product = await Product.findById(itemData.productId);
    
    if (!product) {
      // Try special product
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
      cost: product.cost || product.finalPrice * 0.6, // Default cost calculation
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
        item.combinationId = itemData.combinationId;
        item.unitPrice = product.finalPrice + (combination.additionalPrice || 0);
      }
    }

    item.subtotal = item.unitPrice * item.quantity;
    item.total = item.subtotal - item.discount;

    items.push(item);
  }

  return items;
};

