import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';

export const getSalesOverTime = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    let dateFormat = '%Y-%m-%d';
    if (groupBy === 'week') dateFormat = '%Y-%U';
    if (groupBy === 'month') dateFormat = '%Y-%m';

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $ne: 'canceled' },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$createdAt' },
          },
          sales: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const data = await Order.aggregate(pipeline);
    res.json({ success: true, data: data.map((d) => ({ date: d._id, sales: d.sales, revenue: d.revenue })) });
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
    const { startDate, endDate, limit = 10 } = req.query;
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
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.total' },
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
          _id: null,
          revenue: { $sum: '$total' },
          cost: { $sum: '$cost' },
        },
      },
    ];

    const result = await Order.aggregate(pipeline);
    const data = result[0] || { revenue: 0, cost: 0 };
    const profit = data.revenue - data.cost;
    const margin = data.revenue > 0 ? (profit / data.revenue) * 100 : 0;

    res.json({
      success: true,
      data: {
        revenue: data.revenue,
        cost: data.cost,
        profit,
        margin: margin.toFixed(2),
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

