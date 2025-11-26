import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  DollarSign,
  X,
  Check,
  Package,
  Sparkles,
  Filter,
  CheckCircle2,
  Printer,
  Download,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { withBase } from '../../utils/imageUrl';

const POSInterface = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [products, setProducts] = useState({ regularProducts: [], specialProducts: [], categories: [] });
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('regular'); // 'regular' or 'special'
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [vat, setVat] = useState(19);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Special product selection state
  const [selectedSpecialProduct, setSelectedSpecialProduct] = useState(null);
  const [specialProductStep, setSpecialProductStep] = useState(1); // 1: select product, 2: select option A, 3: select option B, 4: view combinations
  const [selectedOptionA, setSelectedOptionA] = useState(null);
  const [selectedOptionB, setSelectedOptionB] = useState(null);
  const [selectedCombination, setSelectedCombination] = useState(null);

  // Success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchSettings();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await api.get('/pos/products');
      setProducts(response.data.data || { regularProducts: [], specialProducts: [], categories: [] });
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب المنتجات');
      console.error(error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      if (response.data.data?.vat) {
        setVat(response.data.data.vat);
      }
    } catch (error) {
      // Use default VAT
    }
  };

  // Filter products
  const filteredRegularProducts = useMemo(() => {
    let filtered = products.regularProducts || [];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category?._id === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [products.regularProducts, selectedCategory, searchTerm]);

  const filteredSpecialProducts = useMemo(() => {
    let filtered = products.specialProducts || [];
    
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [products.specialProducts, searchTerm]);

  // Add regular product to cart
  const addRegularProductToCart = (product) => {
    if (!product.stock || product.stock <= 0) {
      toast.error('المنتج غير متوفر في المخزون');
      return;
    }

    const existingItem = cart.find(
      (item) => item.productId === product._id && item.productType === 'regular'
    );

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('الكمية المطلوبة غير متوفرة في المخزون');
        return;
      }
      setCart(
        cart.map((item) =>
          item.productId === product._id && item.productType === 'regular'
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product._id,
          productType: 'regular',
          productName: product.name,
          price: product.price,
          quantity: 1,
          image: product.images?.[0] || '',
          stock: product.stock,
        },
      ]);
    }
    toast.success('تمت الإضافة إلى السلة');
  };

  // Start special product selection
  const startSpecialProductSelection = (product) => {
    setSelectedSpecialProduct(product);
    setSpecialProductStep(1);
    setSelectedOptionA(null);
    setSelectedOptionB(null);
    setSelectedCombination(null);
  };

  // Select option A for special product
  const selectOptionA = (variant) => {
    setSelectedOptionA(variant);
    setSpecialProductStep(2);
  };

  // Select option B for special product
  const selectOptionB = (variant) => {
    setSelectedOptionB(variant);
    
    // Find matching combination - check multiple possible structures
    let combination = null;
    
    if (selectedSpecialProduct?.combinations && selectedOptionA) {
      // Try to find exact match
      combination = selectedSpecialProduct.combinations.find((c) => {
        // Check option A - try different structures
        let optionAMatches = false;
        if (c.optionA?.variant?.value && selectedOptionA?.value) {
          optionAMatches = c.optionA.variant.value === selectedOptionA.value;
        } else if (c.optionA?.value && selectedOptionA?.value) {
          optionAMatches = c.optionA.value === selectedOptionA.value;
        } else if (c.optionA?.variant?.name && selectedOptionA?.name) {
          optionAMatches = c.optionA.variant.name === selectedOptionA.name;
        } else if (c.optionA?.name && selectedOptionA?.name) {
          optionAMatches = c.optionA.name === selectedOptionA.name;
        }
        
        // Check option B - try different structures
        let optionBMatches = false;
        if (c.optionB?.variant?.value && variant?.value) {
          optionBMatches = c.optionB.variant.value === variant.value;
        } else if (c.optionB?.value && variant?.value) {
          optionBMatches = c.optionB.value === variant.value;
        } else if (c.optionB?.variant?.name && variant?.name) {
          optionBMatches = c.optionB.variant.name === variant.name;
        } else if (c.optionB?.name && variant?.name) {
          optionBMatches = c.optionB.name === variant.name;
        }
        
        return optionAMatches && optionBMatches;
      });
      
      // If no exact match, try name-based matching
      if (!combination) {
        combination = selectedSpecialProduct.combinations.find((c) => {
          const optionAName = c.optionA?.variant?.name || c.optionA?.name || '';
          const optionBName = c.optionB?.variant?.name || c.optionB?.name || '';
          return optionAName === selectedOptionA?.name && optionBName === variant?.name;
        });
      }
      
      // Last resort: use first combination if available
      if (!combination && selectedSpecialProduct.combinations.length > 0) {
        console.log('Using first available combination as fallback');
        combination = selectedSpecialProduct.combinations[0];
      }
    }
    
    if (combination) {
      setSelectedCombination(combination);
      setSpecialProductStep(3);
    } else {
      toast.error('لم يتم العثور على التركيبة المطابقة. يرجى المحاولة مرة أخرى.');
      console.error('Combination not found:', {
        selectedOptionA,
        selectedOptionB: variant,
        combinations: selectedSpecialProduct?.combinations
      });
    }
  };

  // Add special product combination to cart
  const addSpecialProductToCart = () => {
    if (!selectedCombination || !selectedSpecialProduct) {
      toast.error('يرجى اختيار التركيبة كاملة');
      return;
    }

    const price = selectedSpecialProduct.finalPrice + (selectedCombination.additionalPrice || 0);
    const combinationTitle = `${selectedCombination.optionA?.variant?.name || selectedOptionA?.name || ''} + ${selectedCombination.optionB?.variant?.name || selectedOptionB?.name || ''}`;

    setCart([
      ...cart,
      {
        productId: selectedSpecialProduct._id,
        productType: 'special',
        productName: selectedSpecialProduct.name,
        price,
        quantity: 1,
        image: selectedCombination.finalImage || selectedSpecialProduct.baseProductA?.images?.[0] || '',
        combinationId: selectedCombination._id?.toString() || selectedCombination._id,
        variantA: selectedCombination.optionA || { variant: selectedOptionA },
        variantB: selectedCombination.optionB || { variant: selectedOptionB },
        combinationTitle,
      },
    ]);

    toast.success('تمت الإضافة إلى السلة');
    // Reset special product selection
    setSelectedSpecialProduct(null);
    setSpecialProductStep(1);
    setSelectedOptionA(null);
    setSelectedOptionB(null);
    setSelectedCombination(null);
    setActiveTab('regular');
  };

  // Update cart quantity
  const updateQuantity = (index, delta) => {
    const item = cart[index];
    const newQuantity = item.quantity + delta;

    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }

    if (item.productType === 'regular' && item.stock && newQuantity > item.stock) {
      toast.error('الكمية المطلوبة غير متوفرة في المخزون');
      return;
    }

    setCart(
      cart.map((item, i) =>
        i === index ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove from cart
  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  // Clear cart
  const clearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('هل أنت متأكد من إفراغ السلة؟')) {
      setCart([]);
      setDiscount(0);
      setNotes('');
    }
  };

  // Calculate totals
  const calculations = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = discount || 0;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const vatAmount = (subtotalAfterDiscount * vat) / 100;
    const total = subtotalAfterDiscount + vatAmount;

    return {
      subtotal,
      discount: discountAmount,
      vat: vatAmount,
      total,
    };
  }, [cart, discount, vat]);

  // Handle checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('السلة فارغة');
      return;
    }

    try {
      setLoading(true);

      const items = cart.map((item) => ({
        productId: item.productId,
        combinationId: item.combinationId,
        quantity: item.quantity,
        unitPrice: item.price,
        discount: 0,
      }));

      const response = await api.post('/pos/order', {
        items,
        discount,
        vat,
        total: calculations.total,
        notes,
        paymentMethod: 'cash',
      });

      setLastOrder(response.data.data);
      setShowSuccessModal(true);
      setCart([]);
      setDiscount(0);
      setNotes('');
      setSearchTerm('');
      
      // Refresh products to update stock
      fetchProducts();
      
      toast.success('تمت عملية البيع بنجاح!');
    } catch (error) {
      const message =
        error.response?.data?.message || 'حدث خطأ أثناء إتمام العملية';
      toast.error(message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Generate invoice
  const generateInvoice = async () => {
    if (!lastOrder?.order?._id) return;

    try {
      const response = await api.post(`/pos/invoice/${lastOrder.order._id}`);
      toast.success('تم إنشاء الفاتورة بنجاح');
      // In a real implementation, you would download the PDF here
      console.log('Invoice data:', response.data);
    } catch (error) {
      toast.error('حدث خطأ أثناء إنشاء الفاتورة');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">نقطة البيع (POS)</h1>
          <p className="text-gray-400 text-sm mt-1">
            {user?.name || 'Caissier'} • {new Date().toLocaleDateString('ar-TN')}
          </p>
        </div>
        <button
          onClick={() => navigate('/pos')}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
        >
          <X size={20} />
          <span>العودة</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL - Product Browser */}
        <div className="w-2/3 flex flex-col border-r border-gray-700 bg-gray-900">
          {/* Search and Filters */}
          <div className="p-4 bg-gray-800 border-b border-gray-700 space-y-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="ابحث عن منتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>

            {/* Category Filter */}
            {activeTab === 'regular' && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-gold-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  الكل
                </button>
                {products.categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat._id)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      selectedCategory === cat._id
                        ? 'bg-gold-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveTab('regular');
                  setSelectedSpecialProduct(null);
                  setSpecialProductStep(1);
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === 'regular'
                    ? 'bg-gold-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Package size={18} className="inline ml-2" />
                المنتجات العادية
              </button>
              <button
                onClick={() => setActiveTab('special')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === 'special'
                    ? 'bg-gold-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Sparkles size={18} className="inline ml-2" />
                المنتجات الخاصة
              </button>
            </div>
          </div>

          {/* Products List */}
          <div className="flex-1 overflow-y-auto p-4">
            {loadingProducts ? (
              <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
            ) : activeTab === 'regular' ? (
              <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {filteredRegularProducts.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => addRegularProductToCart(product)}
                    className="bg-gray-800 rounded-lg p-2 cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700 hover:border-gold-600"
                  >
                    {product.images?.[0] && (
                      <img
                        src={withBase(product.images[0])}
                        alt={product.name}
                        className="w-full h-20 object-cover rounded-lg mb-2"
                      />
                    )}
                    <h3 className="font-medium text-white text-sm mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-gold-500 font-bold text-sm">{product.price} TND</p>
                    <p className="text-xs text-gray-400 mt-1">
                      المخزون: {product.stock || 0}
                    </p>
                  </div>
                ))}
                {filteredRegularProducts.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-gray-400">
                    لا توجد منتجات
                  </div>
                )}
              </div>
            ) : (
              <div>
                {!selectedSpecialProduct ? (
                  <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {filteredSpecialProducts.map((product) => (
                      <div
                        key={product._id}
                        onClick={() => startSpecialProductSelection(product)}
                        className="bg-gray-800 rounded-lg p-2 cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700 hover:border-gold-600"
                      >
                        {product.baseProductA?.images?.[0] && (
                          <img
                            src={withBase(product.baseProductA.images[0])}
                            alt={product.name}
                            className="w-full h-20 object-cover rounded-lg mb-2"
                          />
                        )}
                        <h3 className="font-medium text-white text-sm mb-1 line-clamp-2">{product.name}</h3>
                        <p className="text-gold-500 font-bold text-sm">
                          ابتداءً من {product.finalPrice} TND
                        </p>
                      </div>
                    ))}
                    {filteredSpecialProducts.length === 0 && (
                      <div className="col-span-3 text-center py-12 text-gray-400">
                        لا توجد منتجات خاصة
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto">
                    {/* Special Product Configuration Steps */}
                    {specialProductStep === 1 && (
                      <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-bold mb-4">{selectedSpecialProduct.name}</h2>
                        <p className="text-gray-400 mb-6">اختر الجزء الأول</p>
                        <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                          {selectedSpecialProduct.baseProductA?.variants && selectedSpecialProduct.baseProductA.variants.length > 0 ? (
                            selectedSpecialProduct.baseProductA.variants.map((variant, idx) => (
                              <div
                                key={idx}
                                onClick={() => selectOptionA(variant)}
                                className="bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-600 transition-colors border border-gray-600 hover:border-gold-600"
                              >
                                {variant.image && (
                                  <img
                                    src={withBase(variant.image)}
                                    alt={variant.name}
                                    className="w-full h-16 object-cover rounded-lg mb-2"
                                  />
                                )}
                                <p className="text-white font-medium text-sm">{variant.name}</p>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full text-center text-gray-400 py-4">
                              لا توجد خيارات متاحة
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {specialProductStep === 2 && (
                      <div className="bg-gray-800 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle2 className="text-gold-500" size={20} />
                          <span className="text-gold-500">تم اختيار: {selectedOptionA?.name}</span>
                        </div>
                        <p className="text-gray-400 mb-6">اختر الجزء الثاني</p>
                        <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                          {selectedSpecialProduct.baseProductB?.variants && selectedSpecialProduct.baseProductB.variants.length > 0 ? (
                            selectedSpecialProduct.baseProductB.variants.map((variant, idx) => (
                              <div
                                key={idx}
                                onClick={() => selectOptionB(variant)}
                                className="bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-600 transition-colors border border-gray-600 hover:border-gold-600"
                              >
                                {variant.image && (
                                  <img
                                    src={withBase(variant.image)}
                                    alt={variant.name}
                                    className="w-full h-16 object-cover rounded-lg mb-2"
                                  />
                                )}
                                <p className="text-white font-medium text-sm">{variant.name}</p>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full text-center text-gray-400 py-4">
                              لا توجد خيارات متاحة
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {specialProductStep === 3 && (
                      <div className="bg-gray-800 rounded-lg p-6">
                        {selectedCombination ? (
                          <>
                            <div className="flex items-center justify-between mb-6">
                              <div>
                                <h3 className="text-xl font-bold">التركيبة المختارة</h3>
                                <p className="text-gray-400">
                                  {selectedCombination.optionA?.variant?.name || 
                                   selectedOptionA?.name || 
                                   selectedCombination.optionA?.name || 'غير محدد'} +{' '}
                                  {selectedCombination.optionB?.variant?.name || 
                                   selectedOptionB?.name || 
                                   selectedCombination.optionB?.name || 'غير محدد'}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedSpecialProduct(null);
                                  setSpecialProductStep(1);
                                  setSelectedOptionA(null);
                                  setSelectedOptionB(null);
                                  setSelectedCombination(null);
                                }}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                              >
                                <X size={20} />
                              </button>
                            </div>
                            {selectedCombination.finalImage && (
                              <img
                                src={withBase(selectedCombination.finalImage)}
                                alt="Combination"
                                className="w-full h-64 object-cover rounded-lg mb-4"
                              />
                            )}
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-gray-400">السعر النهائي</p>
                                <p className="text-2xl font-bold text-gold-500">
                                  {selectedSpecialProduct.finalPrice +
                                    (selectedCombination.additionalPrice || 0)}{' '}
                                  TND
                                </p>
                              </div>
                              <button
                                onClick={addSpecialProductToCart}
                                className="px-6 py-3 bg-gold-600 hover:bg-gold-700 rounded-lg font-semibold flex items-center gap-2"
                              >
                                <Plus size={20} />
                                إضافة للسلة
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-400 mb-4">جاري البحث عن التركيبة...</p>
                            <button
                              onClick={() => {
                                setSelectedSpecialProduct(null);
                                setSpecialProductStep(1);
                                setSelectedOptionA(null);
                                setSelectedOptionB(null);
                              }}
                              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                            >
                              العودة
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL - Cart */}
        <div className="w-1/3 flex flex-col bg-gray-800 border-l border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart size={24} />
              السلة ({cart.length})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
                <p>السلة فارغة</p>
              </div>
            ) : (
              cart.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-700 rounded-lg p-3 flex gap-3"
                >
                  {item.image && (
                    <img
                      src={withBase(item.image)}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-white">{item.productName}</p>
                    {item.combinationTitle && (
                      <p className="text-xs text-gray-400">{item.combinationTitle}</p>
                    )}
                    <p className="text-gold-500 font-bold">{item.price} TND</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(index, -1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-600 hover:bg-gray-500 rounded"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(index, 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-600 hover:bg-gray-500 rounded"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="ml-auto p-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-4 border-t border-gray-700 space-y-4 bg-gray-900">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-400">
                  <span>المجموع الفرعي:</span>
                  <span>{calculations.subtotal.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">الخصم:</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-right text-white"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>ضريبة القيمة المضافة ({vat}%):</span>
                  <span>{calculations.vat.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gold-500 pt-2 border-t border-gray-700">
                  <span>الإجمالي:</span>
                  <span>{calculations.total.toFixed(2)} TND</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">ملاحظات:</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  rows="2"
                  placeholder="ملاحظات إضافية..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={clearCart}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                >
                  إفراغ السلة
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gold-600 hover:bg-gold-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    'جاري المعالجة...'
                  ) : (
                    <>
                      <Check size={20} />
                      إتمام البيع
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && lastOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <CheckCircle2 className="mx-auto text-gold-500 mb-4" size={64} />
              <h3 className="text-2xl font-bold text-white mb-2">تمت العملية بنجاح!</h3>
              <p className="text-gray-400">
                رقم الطلب: {lastOrder.order?.orderNumber || 'N/A'}
              </p>
              <p className="text-2xl font-bold text-gold-500 mt-4">
                {lastOrder.order?.total?.toFixed(2) || calculations.total.toFixed(2)} TND
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={generateInvoice}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <Printer size={20} />
                طباعة
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setLastOrder(null);
                }}
                className="flex-1 px-4 py-3 bg-gold-600 hover:bg-gold-700 rounded-lg font-semibold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSInterface;
