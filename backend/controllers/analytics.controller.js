import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';

export const getSalesOverTime = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day', source } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    let dateFormat = '%Y-%m-%d';
    if (groupBy === 'week') dateFormat = '%Y-%U';
    if (groupBy === 'month') dateFormat = '%Y-%m';

    const matchFilter = {
      createdAt: { $gte: start, $lte: end },
      status: { $ne: 'canceled' },
    };

    // Filter by source if provided
    if (source && source !== 'all') {
      matchFilter.source = source;
    }

    const pipeline = [
      {
        $match: matchFilter,
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$createdAt' },
          },
          sales: { $sum: 1 },
          revenue: { $sum: '$total' },
          cost: { $sum: '$cost' },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const data = await Order.aggregate(pipeline);
    res.json({ 
      success: true, 
      data: data.map((d) => ({ 
        date: d._id, 
        sales: d.sales, 
        revenue: d.revenue,
        cost: d.cost || 0,
        profit: (d.revenue || 0) - (d.cost || 0),
      })) 
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueByCategory = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $ne: 'canceled' },
        },
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category._id',
          categoryName: { $first: '$category.name' },
          revenue: { $sum: '$items.total' },
          orders: { $addToSet: '$_id' },
        },
      },
      {
        $project: {
          category: '$categoryName',
          revenue: 1,
          orders: { $size: '$orders' },
        },
      },
    ];

    const data = await Order.aggregate(pipeline);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getTopProducts = async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 10, source } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const matchFilter = {
      createdAt: { $gte: start, $lte: end },
      status: { $ne: 'canceled' },
    };

    // Filter by source if provided
    if (source && source !== 'all') {
      matchFilter.source = source;
    }

    const pipeline = [
      {
        $match: matchFilter,
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.total' },
          cost: { $sum: { $multiply: ['$items.cost', '$items.quantity'] } },
        },
      },
      {
        $project: {
          productName: 1,
          quantity: 1,
          revenue: 1,
          cost: 1,
          profit: { $subtract: ['$revenue', '$cost'] },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: parseInt(limit) },
    ];

    const data = await Order.aggregate(pipeline);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getProfitability = async (req, res, next) => {
  try {
    const { startDate, endDate, source } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const matchFilter = {
      createdAt: { $gte: start, $lte: end },
      status: { $ne: 'canceled' },
    };

    // Filter by source if provided
    if (source && source !== 'all') {
      matchFilter.source = source;
    }

    const pipeline = [
      {
        $match: matchFilter,
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$total' },
          cost: { $sum: '$cost' },
          orders: { $sum: 1 },
        },
      },
    ];

    const result = await Order.aggregate(pipeline);
    const data = result[0] || { revenue: 0, cost: 0, orders: 0 };
    const profit = data.revenue - data.cost;
    const margin = data.revenue > 0 ? (profit / data.revenue) * 100 : 0;
    const avgOrderValue = data.orders > 0 ? data.revenue / data.orders : 0;

    res.json({
      success: true,
      data: {
        revenue: data.revenue,
        cost: data.cost,
        profit,
        margin: margin.toFixed(2),
        orders: data.orders,
        avgOrderValue: avgOrderValue.toFixed(2),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLowStock = async (req, res, next) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const products = await Product.find({ stock: { $lte: threshold } })
      .populate('category', 'name')
      .sort({ stock: 1 })
      .limit(20);

    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

// Get analytics by source
export const getSalesBySource = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $ne: 'canceled' },
        },
      },
      {
        $group: {
          _id: '$source',
          orders: { $sum: 1 },
          revenue: { $sum: '$total' },
          cost: { $sum: '$cost' },
        },
      },
      {
        $project: {
          source: '$_id',
          orders: 1,
          revenue: 1,
          cost: 1,
          profit: { $subtract: ['$revenue', '$cost'] },
        },
      },
      { $sort: { revenue: -1 } },
    ];

    const data = await Order.aggregate(pipeline);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Get analytics by store
export const getSalesByStore = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $ne: 'canceled' },
          source: 'pos',
          storeId: { $exists: true },
        },
      },
      {
        $lookup: {
          from: 'stores',
          localField: 'storeId',
          foreignField: '_id',
          as: 'store',
        },
      },
      { $unwind: '$store' },
      {
        $group: {
          _id: '$storeId',
          storeName: { $first: '$store.name' },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
      {
        $project: {
          storeId: '$_id',
          storeName: 1,
          orders: 1,
          revenue: 1,
        },
      },
      { $sort: { revenue: -1 } },
    ];

    const data = await Order.aggregate(pipeline);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Get analytics by commercial
export const getSalesByCommercial = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $ne: 'canceled' },
          commercialId: { $exists: true },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'commercialId',
          foreignField: '_id',
          as: 'commercial',
        },
      },
      { $unwind: '$commercial' },
      {
        $group: {
          _id: '$commercialId',
          commercialName: { $first: '$commercial.name' },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
      {
        $project: {
          commercialId: '$_id',
          commercialName: 1,
          orders: 1,
          revenue: 1,
        },
      },
      { $sort: { revenue: -1 } },
    ];

    const data = await Order.aggregate(pipeline);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

