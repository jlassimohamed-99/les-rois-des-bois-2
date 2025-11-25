import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import SpecialProduct from '../models/SpecialProduct.model.js';

// Get all public products (visible only)
export const getPublicProducts = async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, sort = 'newest', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = { status: 'visible' };
    
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .select('-variants') // Don't send variants to client
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: products,
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

// Get single public product
export const getPublicProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .select('-variants'); // Don't send variants to client

    if (!product || product.status !== 'visible') {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// Get all public categories
export const getPublicCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// Get single public category with products
export const getPublicCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'الفئة غير موجودة',
      });
    }

    const products = await Product.find({ category: category._id, status: 'visible' })
      .populate('category', 'name slug')
      .select('-variants')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        category,
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all public special products
export const getPublicSpecialProducts = async (req, res, next) => {
  try {
    const specialProducts = await SpecialProduct.find({ status: 'visible' })
      .populate('baseProductA', 'name images')
      .populate('baseProductB', 'name images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: specialProducts,
    });
  } catch (error) {
    next(error);
  }
};

// Get single public special product with full details
export const getPublicSpecialProduct = async (req, res, next) => {
  try {
    const specialProduct = await SpecialProduct.findById(req.params.id)
      .populate('baseProductA', 'name images variants')
      .populate('baseProductB', 'name images variants');

    if (!specialProduct || specialProduct.status !== 'visible') {
      return res.status(404).json({
        success: false,
        message: 'المنتج الخاص غير موجود',
      });
    }

    res.status(200).json({
      success: true,
      data: specialProduct,
    });
  } catch (error) {
    next(error);
  }
};

