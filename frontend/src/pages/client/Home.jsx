import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import clientApi from '../../utils/clientAxios';
import { useCart } from '../../contexts/CartContext';
import toast from 'react-hot-toast';
import { withBase } from '../../utils/imageUrl';
import Hero from '../../components/landing/Hero';
import TopSellers from '../../components/landing/TopSellers';
import Categories from '../../components/landing/Categories';
import CTA from '../../components/landing/CTA';

const Home = () => {
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Try to fetch from homepage management first, fallback to auto-calculated
      const publicApi = axios.create({ baseURL: '/api' });
      
      const [featuredRes, topSellersRes, categoriesRes] = await Promise.all([
        publicApi.get('/homepage/featured?limit=12').catch(() => clientApi.get('/products/new?limit=12')),
        publicApi.get('/homepage/top-sellers?limit=12').catch(() => clientApi.get('/products/top-selling?limit=12')),
        clientApi.get('/categories'),
      ]);
      
      // Use homepage data if available, otherwise use fallback
      setNewProducts(featuredRes.data.data || []);
      setTopSellingProducts(topSellersRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    const availableStock = product.selectedVariant && product.selectedVariant.stock !== undefined
      ? product.selectedVariant.stock
      : product.stock || 0;
    
    if (availableStock <= 0) {
      toast.error('المنتج غير متوفر في المخزون');
      return;
    }
    
    const variantPrice = product.selectedVariant?.additionalPrice || 0;
    const finalPrice = product.variantPrice || (product.price + variantPrice);
    const displayImage = product.displayImage || product.images?.[0];
    const quantity = Math.min(product.quantity || 1, availableStock);
    
    if ((product.quantity || 1) > availableStock) {
      toast.warning(`الكمية المتاحة فقط: ${availableStock}. سيتم إضافة ${availableStock} فقط`);
    }
    
    addToCart({
      productId: product._id,
      productType: 'regular',
      name: product.name,
      price: finalPrice,
      image: withBase(displayImage),
      quantity: quantity,
      stock: availableStock,
      variant: product.selectedVariant ? {
        name: product.selectedVariant.name,
        value: product.selectedVariant.value,
        image: product.selectedVariant.image,
        stock: product.selectedVariant.stock,
      } : undefined,
    });
    toast.success('تمت الإضافة إلى السلة');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <Hero />

      {/* Top Sellers Section with Featured Products Slider */}
      <TopSellers 
        products={topSellingProducts}
        featuredProducts={newProducts}
        loading={loading} 
        onAddToCart={handleAddToCart} 
      />

      {/* Categories Section */}
      <Categories categories={categories} loading={loading} />

      {/* CTA Section */}
      <CTA />
    </div>
  );
};

export default Home;
