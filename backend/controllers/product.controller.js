import Product from '../models/Product.model.js';

export const getProducts = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');

    if (!product) {
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

export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      category,
      price,
      cost,
      stock,
      unit,
      wholesalePrice,
      wholesaleUnit,
      facebookPrice,
      images,
      description,
      status,
      variantName,
      variants,
    } = req.body;

    if (!name || !category || !price || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال جميع الحقول المطلوبة',
      });
    }

    const product = await Product.create({
      name,
      category,
      price: Number(price),
      cost: cost ? Number(cost) : 0,
      stock: Number(stock),
      unit: 'piece', // Always piece
      wholesalePrice: wholesalePrice ? Number(wholesalePrice) : 0,
      wholesaleUnit: 'piece', // Always piece
      facebookPrice: facebookPrice ? Number(facebookPrice) : 0,
      images: Array.isArray(images) ? images : [],
      description: description || '',
      status: status || 'visible',
      variantName: variantName || '',
      variants: Array.isArray(variants) ? variants : [],
    });

    const populatedProduct = await Product.findById(product._id).populate('category', 'name slug');

    res.status(201).json({
      success: true,
      data: populatedProduct,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'اسم المنتج مستخدم بالفعل',
      });
    }
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود',
      });
    }

    const {
      name,
      category,
      price,
      cost,
      stock,
      unit,
      wholesalePrice,
      wholesaleUnit,
      facebookPrice,
      images,
      description,
      status,
      variantName,
      variants,
    } = req.body;

    if (name) product.name = name;
    if (category) product.category = category;
    if (price !== undefined) product.price = Number(price);
    if (cost !== undefined) product.cost = Number(cost);
    if (stock !== undefined) product.stock = Number(stock);
    product.unit = 'piece'; // Always piece
    if (wholesalePrice !== undefined) product.wholesalePrice = Number(wholesalePrice);
    product.wholesaleUnit = 'piece'; // Always piece
    if (facebookPrice !== undefined) product.facebookPrice = Number(facebookPrice);
    if (images !== undefined) product.images = Array.isArray(images) ? images : [];
    if (description !== undefined) product.description = description;
    if (status) product.status = status;
    if (variantName !== undefined) product.variantName = variantName;
    if (variants !== undefined) product.variants = Array.isArray(variants) ? variants : [];

    await product.save();

    const populatedProduct = await Product.findById(product._id).populate('category', 'name slug');

    res.status(200).json({
      success: true,
      data: populatedProduct,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'اسم المنتج مستخدم بالفعل',
      });
    }
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود',
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'تم حذف المنتج بنجاح',
    });
  } catch (error) {
    next(error);
  }
};

