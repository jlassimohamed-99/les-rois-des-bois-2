import { useState, useEffect } from 'react';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { X, Upload, Plus, Trash2 } from 'lucide-react';

const ProductModal = ({ product, categories, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    unit: 'piece',
    wholesalePrice: '',
    wholesaleUnit: 'piece',
    images: [],
    description: '',
    status: 'visible',
    variants: [],
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingVariantImages, setUploadingVariantImages] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category?._id || product.category || '',
        price: product.price || '',
        cost: product.cost || '',
        stock: product.stock || '',
        unit: 'piece', // Always piece
        wholesalePrice: product.wholesalePrice || '',
        wholesaleUnit: 'piece', // Always piece
        images: product.images || [],
        description: product.description || '',
        status: product.status || 'visible',
        variants: product.variants || [],
      });
      setImagePreviews(
        (product.images || []).map((img) => `http://localhost:5000${img}`)
      );
    }
  }, [product]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles([...imageFiles, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    if (index < formData.images.length) {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    } else {
      setImageFiles((prev) => prev.filter((_, i) => i !== index - formData.images.length));
    }
  };

  const handleUploadImages = async () => {
    if (imageFiles.length === 0) return;

    try {
      setUploading(true);
      const formDataUpload = new FormData();
      imageFiles.forEach((file) => {
        formDataUpload.append('images', file);
      });

      const response = await api.post('/uploads/product/multiple', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...response.data.data.map((f) => f.path)],
      }));
      setImageFiles([]);
      toast.success('تم رفع الصور بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء رفع الصور');
    } finally {
      setUploading(false);
    }
  };

  const handleAddVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { name: '', value: '', image: '', additionalPrice: 0 }],
    }));
  };

  const handleVariantChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      ),
    }));
  };

  const handleRemoveVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleVariantImageUpload = async (variantIndex, file) => {
    if (!file) return;

    try {
      setUploadingVariantImages((prev) => ({ ...prev, [variantIndex]: true }));
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const response = await api.post('/uploads/product', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      handleVariantChange(variantIndex, 'image', response.data.data.path);
      toast.success('تم رفع صورة المتغير بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء رفع صورة المتغير');
    } finally {
      setUploadingVariantImages((prev) => ({ ...prev, [variantIndex]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imageFiles.length > 0) {
      toast.error('يرجى رفع الصور المحددة أولاً');
      return;
    }

    // Ensure unit is always 'piece'
    const submitData = {
      ...formData,
      unit: 'piece',
      wholesaleUnit: 'piece',
    };

    try {
      setLoading(true);
      if (product) {
        await api.put(`/products/${product._id}`, submitData);
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        await api.post('/products', submitData);
        toast.success('تم إنشاء المنتج بنجاح');
      }
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {product ? 'تعديل المنتج' : 'إضافة منتج جديد'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                اسم المنتج *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الفئة *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
                required
              >
                <option value="">اختر الفئة</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                السعر (TND) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                التكلفة (TND)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الكمية المتوفرة *
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                سعر الجملة (TND)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.wholesalePrice}
                onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الحالة
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field"
              >
                <option value="visible">ظاهر</option>
                <option value="hidden">مخفي</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              الوصف
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows="4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              الصور
            </label>
            <div className="space-y-4">
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 left-2 p-1 bg-gold-500 text-white rounded-full hover:bg-gold-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 btn-secondary cursor-pointer">
                  <Upload size={18} />
                  <span>اختر صور</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imageFiles.length > 0 && (
                  <button
                    type="button"
                    onClick={handleUploadImages}
                    disabled={uploading}
                    className="btn-primary disabled:opacity-50"
                  >
                    {uploading ? 'جاري الرفع...' : `رفع ${imageFiles.length} صورة`}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                المتغيرات (الألوان، المواد، إلخ)
              </label>
              <button
                type="button"
                onClick={handleAddVariant}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                <span>إضافة متغير</span>
              </button>
            </div>
            {formData.variants.map((variant, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="اسم المتغير (مثلاً: اللون)"
                    value={variant.name}
                    onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="القيمة (مثلاً: أحمر)"
                    value={variant.value}
                    onChange={(e) => handleVariantChange(index, 'value', e.target.value)}
                    className="input-field"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="سعر إضافي"
                    value={variant.additionalPrice}
                    onChange={(e) => handleVariantChange(index, 'additionalPrice', parseFloat(e.target.value) || 0)}
                    className="input-field"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(index)}
                    className="btn-secondary text-gold-600 hover:bg-gold-50 dark:hover:bg-gold-900/20"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    صورة المتغير (مطلوبة للتركيبات)
                  </label>
                  <div className="flex items-center gap-4">
                    {variant.image ? (
                      <div className="relative w-24 h-24">
                        <img
                          src={`http://localhost:5000${variant.image}`}
                          alt={variant.value}
                          className="w-full h-full object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => handleVariantChange(index, 'image', '')}
                          className="absolute -top-2 -right-2 p-1 bg-gold-500 text-white rounded-full hover:bg-gold-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 btn-secondary cursor-pointer text-sm">
                        <Upload size={16} />
                        <span>رفع صورة</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              handleVariantImageUpload(index, file);
                            }
                          }}
                          className="hidden"
                          disabled={uploadingVariantImages[index]}
                        />
                      </label>
                    )}
                    {uploadingVariantImages[index] && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold-600"></div>
                        <span>جاري الرفع...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : product ? 'تحديث' : 'إنشاء'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;

