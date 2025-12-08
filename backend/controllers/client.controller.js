import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import SpecialProduct from '../models/SpecialProduct.model.js';
import Order from '../models/Order.model.js';

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
      .populate('category', 'name slug');

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
      .populate('baseProductA', 'name images variants stock')
      .populate('baseProductB', 'name images variants stock')
      .sort({ createdAt: -1 });

    // Calculate availability for each special product - fetch fresh stock data
    const productsWithAvailability = await Promise.all(
      specialProducts.map(async (product) => {
        // Re-fetch base products to ensure we have the latest stock data
        const freshProductA = await Product.findById(product.baseProductA._id);
        const freshProductB = await Product.findById(product.baseProductB._id);
        
        const productData = product.toObject();
        
        // Update with fresh stock data
        if (freshProductA) {
          productData.baseProductA = {
            ...productData.baseProductA,
            stock: freshProductA.stock,
            variants: freshProductA.variants,
          };
        }
        if (freshProductB) {
          productData.baseProductB = {
            ...productData.baseProductB,
            stock: freshProductB.stock,
            variants: freshProductB.variants,
          };
        }
        
        // Check if any combination is available
        let hasAvailableCombination = false;
        let totalAvailableStock = 0;

        if (productData.combinations && productData.combinations.length > 0) {
          productData.combinations.forEach(combo => {
            // Get variant A stock from fresh data
            let stockA = 0;
            if (combo.optionA?.variant) {
              const variantValue = combo.optionA.variant.value || combo.optionA.variant._id?.toString();
              const variantA = productData.baseProductA?.variants?.find(
                v => (v.value === variantValue) || 
                     (v._id?.toString() === variantValue) ||
                     (combo.optionA.variant._id && v._id?.toString() === combo.optionA.variant._id.toString())
              );
              stockA = variantA?.stock !== undefined ? variantA.stock : 0;
            } else if (!productData.baseProductA?.variants || productData.baseProductA.variants.length === 0) {
              stockA = productData.baseProductA?.stock ?? 0;
            }

            // Get variant B stock from fresh data
            let stockB = 0;
            if (combo.optionB?.variant) {
              const variantValue = combo.optionB.variant.value || combo.optionB.variant._id?.toString();
              const variantB = productData.baseProductB?.variants?.find(
                v => (v.value === variantValue) || 
                     (v._id?.toString() === variantValue) ||
                     (combo.optionB.variant._id && v._id?.toString() === combo.optionB.variant._id.toString())
              );
              stockB = variantB?.stock !== undefined ? variantB.stock : 0;
            } else if (!productData.baseProductB?.variants || productData.baseProductB.variants.length === 0) {
              stockB = productData.baseProductB?.stock ?? 0;
            }

            // Stock of combination = minimum of both variants (both must be in stock)
            const comboStock = Math.min(stockA, stockB);
            totalAvailableStock += comboStock;
            if (comboStock > 0) {
              hasAvailableCombination = true;
            }
          });
        }

        return {
          ...productData,
          isAvailable: hasAvailableCombination,
          totalAvailableStock,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: productsWithAvailability,
    });
  } catch (error) {
    next(error);
  }
};

// Get single public special product with full details
export const getPublicSpecialProduct = async (req, res, next) => {
  try {
    const specialProduct = await SpecialProduct.findById(req.params.id)
      .populate('baseProductA', 'name images variants stock')
      .populate('baseProductB', 'name images variants stock');

    if (!specialProduct || specialProduct.status !== 'visible') {
      return res.status(404).json({
        success: false,
        message: 'المنتج الخاص غير موجود',
      });
    }

    // Re-fetch base products to ensure we have the latest stock data
    const freshProductA = await Product.findById(specialProduct.baseProductA._id);
    const freshProductB = await Product.findById(specialProduct.baseProductB._id);
    
    const productData = specialProduct.toObject();
    
    // Update with fresh stock data
    if (freshProductA) {
      productData.baseProductA = {
        ...productData.baseProductA,
        stock: freshProductA.stock,
        variants: freshProductA.variants,
      };
    }
    if (freshProductB) {
      productData.baseProductB = {
        ...productData.baseProductB,
        stock: freshProductB.stock,
        variants: freshProductB.variants,
      };
    }

    // Calculate stock for each combination
    // Stock of a combination = minimum stock of variantA and variantB
    if (productData.combinations && productData.combinations.length > 0) {
      productData.combinations = productData.combinations.map(combo => {
        // Get variant A stock from fresh data
        let stockA = 0;
        if (combo.optionA?.variant) {
          const variantValue = combo.optionA.variant.value || combo.optionA.variant._id?.toString();
          const variantA = productData.baseProductA?.variants?.find(
            v => (v.value === variantValue) || 
                 (v._id?.toString() === variantValue) ||
                 (combo.optionA.variant._id && v._id?.toString() === combo.optionA.variant._id.toString())
          );
          stockA = variantA?.stock !== undefined ? variantA.stock : 0;
        } else if (!productData.baseProductA?.variants || productData.baseProductA.variants.length === 0) {
          stockA = productData.baseProductA?.stock ?? 0;
        }

        // Get variant B stock from fresh data
        let stockB = 0;
        if (combo.optionB?.variant) {
          const variantValue = combo.optionB.variant.value || combo.optionB.variant._id?.toString();
          const variantB = productData.baseProductB?.variants?.find(
            v => (v.value === variantValue) || 
                 (v._id?.toString() === variantValue) ||
                 (combo.optionB.variant._id && v._id?.toString() === combo.optionB.variant._id.toString())
          );
          stockB = variantB?.stock !== undefined ? variantB.stock : 0;
        } else if (!productData.baseProductB?.variants || productData.baseProductB.variants.length === 0) {
          stockB = productData.baseProductB?.stock ?? 0;
        }

        // Stock of combination is the minimum of both variants (both must be in stock)
        const availableStock = Math.min(stockA, stockB);
        
        return {
          ...combo,
          stock: availableStock,
          isAvailable: availableStock > 0,
        };
      });
    }

    res.status(200).json({
      success: true,
      data: productData,
    });
  } catch (error) {
    next(error);
  }
};

// Get top selling products for client (public)
export const getTopSellingProducts = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get top selling products from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $ne: 'canceled' },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit) },
    ];

    const topProducts = await Order.aggregate(pipeline);
    
    // Fetch full product details
    const productIds = topProducts.map(p => p._id);
    const products = await Product.find({ 
      _id: { $in: productIds },
      status: 'visible'
    })
      .populate('category', 'name slug')
      .limit(parseInt(limit));

    // Sort products by sales order
    const productMap = new Map(products.map(p => [p._id.toString(), p]));
    const sortedProducts = topProducts
      .map(tp => productMap.get(tp._id.toString()))
      .filter(p => p !== undefined);

    res.status(200).json({
      success: true,
      data: sortedProducts,
    });
  } catch (error) {
    next(error);
  }
};

// Get new products (recently added)
export const getNewProducts = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    const products = await Product.find({ status: 'visible' })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

