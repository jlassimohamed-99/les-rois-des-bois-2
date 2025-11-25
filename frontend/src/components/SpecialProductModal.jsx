import { useState, useEffect } from 'react';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { X, Upload, Loader2 } from 'lucide-react';

const SpecialProductModal = ({ product, onClose }) => {
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    baseProductA: '',
    baseProductB: '',
    finalPrice: '',
    description: '',
    status: 'visible',
    combinations: [],
  });
  const [combinationData, setCombinationData] = useState(null);
  const [uploadingImages, setUploadingImages] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    if (product) {
      setFormData({
        name: product.name || '',
        baseProductA: product.baseProductA?._id || product.baseProductA || '',
        baseProductB: product.baseProductB?._id || product.baseProductB || '',
        finalPrice: product.finalPrice || '',
        description: product.description || '',
        status: product.status || 'visible',
        combinations: product.combinations || [],
      });
      if (product.combinations && product.combinations.length > 0) {
        setStep(4);
      }
    }
  }, [product]);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await api.get('/products');
      setProducts(response.data.data || []);
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب المنتجات');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleGenerateCombinations = async () => {
    if (!formData.baseProductA || !formData.baseProductB) {
      toast.error('يرجى اختيار المنتجين الأساسيين');
      return;
    }

    if (formData.baseProductA === formData.baseProductB) {
      toast.error('يجب اختيار منتجين مختلفين');
      return;
    }

    try {
      setGenerating(true);
      const response = await api.post('/special-products/generate-combinations', {
        productAId: formData.baseProductA,
        productBId: formData.baseProductB,
      });

      setCombinationData(response.data.data);
      setFormData((prev) => ({
        ...prev,
        combinations: response.data.data.combinations.map((combo) => ({
          optionA: combo.optionA,
          optionB: combo.optionB,
          finalImage: '',
          additionalPrice: combo.additionalPrice || 0,
        })),
      }));
      setStep(3);
      toast.success('تم إنشاء التركيبات بنجاح');
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ أثناء إنشاء التركيبات';
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleImageUpload = async (combinationIndex, file) => {
    if (!file) return;

    try {
      setUploadingImages((prev) => ({ ...prev, [combinationIndex]: true }));
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const response = await api.post('/uploads/special-product', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData((prev) => ({
        ...prev,
        combinations: prev.combinations.map((combo, index) =>
          index === combinationIndex
            ? { ...combo, finalImage: response.data.data.path }
            : combo
        ),
      }));

      toast.success('تم رفع الصورة بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploadingImages((prev) => ({ ...prev, [combinationIndex]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step < 4) {
      toast.error('يرجى إكمال جميع الخطوات');
      return;
    }

    // Validate that all combinations have images
    const missingImages = formData.combinations.filter((combo) => !combo.finalImage);
    if (missingImages.length > 0) {
      toast.error('يرجى رفع صورة لكل تركيبة');
      return;
    }

    try {
      setLoading(true);
      if (product) {
        await api.put(`/special-products/${product._id}`, formData);
        toast.success('تم تحديث المنتج الخاص بنجاح');
      } else {
        await api.post('/special-products', formData);
        toast.success('تم إنشاء المنتج الخاص بنجاح');
      }
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const canProceedToStep2 = formData.baseProductA && formData.baseProductB && formData.baseProductA !== formData.baseProductB;
  const canProceedToStep4 = formData.combinations.length > 0 && formData.combinations.every((c) => c.finalImage);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {product ? 'تعديل المنتج الخاص' : 'إضافة منتج خاص جديد'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s
                      ? 'bg-gold-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step > s ? 'bg-gold-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-16 mt-4 text-sm">
            <span className={step >= 1 ? 'text-gold-600 font-medium' : 'text-gray-500'}>
              اختيار المنتجات
            </span>
            <span className={step >= 2 ? 'text-gold-600 font-medium' : 'text-gray-500'}>
              إنشاء التركيبات
            </span>
            <span className={step >= 3 ? 'text-gold-600 font-medium' : 'text-gray-500'}>
              رفع الصور
            </span>
            <span className={step >= 4 ? 'text-gold-600 font-medium' : 'text-gray-500'}>
              التفاصيل النهائية
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Step 1: Choose Products */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  اسم المنتج الخاص *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                  placeholder="مثال: طاولة كاملة"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    المنتج الأساسي الأول *
                  </label>
                  <select
                    value={formData.baseProductA}
                    onChange={(e) => setFormData({ ...formData, baseProductA: e.target.value })}
                    className="input-field"
                    required
                    disabled={loadingProducts}
                  >
                    <option value="">اختر المنتج الأول</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    المنتج الأساسي الثاني *
                  </label>
                  <select
                    value={formData.baseProductB}
                    onChange={(e) => setFormData({ ...formData, baseProductB: e.target.value })}
                    className="input-field"
                    required
                    disabled={loadingProducts}
                  >
                    <option value="">اختر المنتج الثاني</option>
                    {products
                      .filter((p) => p._id !== formData.baseProductA)
                      .map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {formData.baseProductA && formData.baseProductB && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    سيتم إنشاء جميع التركيبات الممكنة من متغيرات المنتجين المختارين
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-4">
                <button type="button" onClick={onClose} className="btn-secondary">
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!canProceedToStep2}
                  className="btn-primary disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Generate Combinations */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  إنشاء التركيبات
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  سيتم إنشاء جميع التركيبات الممكنة من متغيرات المنتجين
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateCombinations}
                disabled={generating}
                className="w-full btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>جاري إنشاء التركيبات...</span>
                  </>
                ) : (
                  <span>إنشاء التركيبات</span>
                )}
              </button>

              <div className="flex items-center justify-end gap-4">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                  السابق
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Upload Images */}
          {step === 3 && combinationData && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  رفع صور التركيبات
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  يرجى رفع صورة لكل تركيبة من التركيبات التالية
                </p>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {formData.combinations.map((combo, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {combo.optionA.productName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {combo.optionA.variant.name}: {combo.optionA.variant.value}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {combo.optionB.productName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {combo.optionB.variant.name}: {combo.optionB.variant.value}
                        </p>
                      </div>
                      <div>
                        <label className="flex items-center gap-2 btn-secondary cursor-pointer text-sm">
                          <Upload size={16} />
                          <span>رفع صورة</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleImageUpload(index, file);
                              }
                            }}
                            className="hidden"
                            disabled={uploadingImages[index]}
                          />
                        </label>
                        {combo.finalImage && (
                          <div className="mt-2 relative w-20 h-20">
                            <img
                              src={`http://localhost:5000${combo.finalImage}`}
                              alt="Combination"
                              className="w-full h-full object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                            />
                          </div>
                        )}
                        {uploadingImages[index] && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                            <Loader2 className="animate-spin" size={16} />
                            <span>جاري الرفع...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-4">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary">
                  السابق
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  disabled={!canProceedToStep4}
                  className="btn-primary disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Final Details */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  التفاصيل النهائية
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    السعر النهائي (TND) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.finalPrice}
                    onChange={(e) => setFormData({ ...formData, finalPrice: e.target.value })}
                    className="input-field"
                    required
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

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-300">
                  عدد التركيبات: {formData.combinations.length}
                </p>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => setStep(3)} className="btn-secondary">
                  السابق
                </button>
                <button type="button" onClick={onClose} className="btn-secondary">
                  إلغاء
                </button>
                <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                  {loading ? 'جاري الحفظ...' : product ? 'تحديث' : 'إنشاء'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SpecialProductModal;

