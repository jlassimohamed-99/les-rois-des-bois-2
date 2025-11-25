import SpecialProduct from '../models/SpecialProduct.model.js';
import Product from '../models/Product.model.js';

export const generateCombinations = async (req, res, next) => {
  try {
    const { productAId, productBId } = req.body;

    if (!productAId || !productBId) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تحديد المنتجين الأساسيين',
      });
    }

    const productA = await Product.findById(productAId);
    const productB = await Product.findById(productBId);

    if (!productA || !productB) {
      return res.status(404).json({
        success: false,
        message: 'أحد المنتجات غير موجود',
      });
    }

    // Get variants for each product
    const variantsA = productA.variants && productA.variants.length > 0 
      ? productA.variants 
      : [{ name: 'افتراضي', value: 'default', image: productA.images[0] || '', additionalPrice: 0 }];
    
    const variantsB = productB.variants && productB.variants.length > 0 
      ? productB.variants 
      : [{ name: 'افتراضي', value: 'default', image: productB.images[0] || '', additionalPrice: 0 }];

    // Generate all combinations
    const combinations = [];
    variantsA.forEach((variantA) => {
      variantsB.forEach((variantB) => {
        combinations.push({
          optionA: {
            productId: productA._id,
            productName: productA.name,
            variant: variantA,
          },
          optionB: {
            productId: productB._id,
            productName: productB.name,
            variant: variantB,
          },
          finalImage: '',
          additionalPrice: (variantA.additionalPrice || 0) + (variantB.additionalPrice || 0),
        });
      });
    });

    res.status(200).json({
      success: true,
      data: {
        productA: {
          id: productA._id,
          name: productA.name,
          variants: variantsA,
        },
        productB: {
          id: productB._id,
          name: productB.name,
          variants: variantsB,
        },
        combinations,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSpecialProducts = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    const specialProducts = await SpecialProduct.find(query)
      .populate('baseProductA', 'name images')
      .populate('baseProductB', 'name images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: specialProducts.length,
      data: specialProducts,
    });
  } catch (error) {
    next(error);
  }
};

export const getSpecialProduct = async (req, res, next) => {
  try {
    const specialProduct = await SpecialProduct.findById(req.params.id)
      .populate('baseProductA', 'name images variants')
      .populate('baseProductB', 'name images variants');

    if (!specialProduct) {
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

export const createSpecialProduct = async (req, res, next) => {
  try {
    const { name, baseProductA, baseProductB, combinations, finalPrice, description, status } = req.body;

    if (!name || !baseProductA || !baseProductB || !combinations || !Array.isArray(combinations) || combinations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال جميع الحقول المطلوبة',
      });
    }

    if (!finalPrice || finalPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'السعر النهائي مطلوب',
      });
    }

    // Validate that all combinations have finalImage
    const invalidCombinations = combinations.filter(combo => !combo.finalImage);
    if (invalidCombinations.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'يجب رفع صورة لكل تركيبة',
      });
    }

    const specialProduct = await SpecialProduct.create({
      name,
      baseProductA,
      baseProductB,
      combinations: combinations.map(combo => ({
        optionA: combo.optionA,
        optionB: combo.optionB,
        finalImage: combo.finalImage,
        additionalPrice: combo.additionalPrice || 0,
      })),
      finalPrice: Number(finalPrice),
      description: description || '',
      status: status || 'visible',
    });

    const populatedProduct = await SpecialProduct.findById(specialProduct._id)
      .populate('baseProductA', 'name images')
      .populate('baseProductB', 'name images');

    res.status(201).json({
      success: true,
      data: populatedProduct,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'اسم المنتج الخاص مستخدم بالفعل',
      });
    }
    next(error);
  }
};

export const updateSpecialProduct = async (req, res, next) => {
  try {
    const specialProduct = await SpecialProduct.findById(req.params.id);

    if (!specialProduct) {
      return res.status(404).json({
        success: false,
        message: 'المنتج الخاص غير موجود',
      });
    }

    const { name, baseProductA, baseProductB, combinations, finalPrice, description, status } = req.body;

    if (name) specialProduct.name = name;
    if (baseProductA) specialProduct.baseProductA = baseProductA;
    if (baseProductB) specialProduct.baseProductB = baseProductB;
    if (combinations && Array.isArray(combinations)) {
      specialProduct.combinations = combinations.map(combo => ({
        optionA: combo.optionA,
        optionB: combo.optionB,
        finalImage: combo.finalImage,
        additionalPrice: combo.additionalPrice || 0,
      }));
    }
    if (finalPrice !== undefined) specialProduct.finalPrice = Number(finalPrice);
    if (description !== undefined) specialProduct.description = description;
    if (status) specialProduct.status = status;

    await specialProduct.save();

    const populatedProduct = await SpecialProduct.findById(specialProduct._id)
      .populate('baseProductA', 'name images')
      .populate('baseProductB', 'name images');

    res.status(200).json({
      success: true,
      data: populatedProduct,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'اسم المنتج الخاص مستخدم بالفعل',
      });
    }
    next(error);
  }
};

export const deleteSpecialProduct = async (req, res, next) => {
  try {
    const specialProduct = await SpecialProduct.findById(req.params.id);

    if (!specialProduct) {
      return res.status(404).json({
        success: false,
        message: 'المنتج الخاص غير موجود',
      });
    }

    await specialProduct.deleteOne();

    res.status(200).json({
      success: true,
      message: 'تم حذف المنتج الخاص بنجاح',
    });
  } catch (error) {
    next(error);
  }
};

