import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ClientAuthProvider } from './contexts/ClientAuthContext';
import { CartProvider } from './contexts/CartContext';
import ClientLayout from './components/client/ClientLayout';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import Login from './pages/Login';
import Home from './pages/client/Home';
import ClientCategories from './pages/client/Categories';
import ClientProducts from './pages/client/Products';
import ProductDetail from './pages/client/ProductDetail';
import CategoryProducts from './pages/client/CategoryProducts';
import SpecialProductConfigurator from './pages/client/EnhancedSpecialProductConfigurator';
import SpecialProductsList from './pages/client/SpecialProductsList';
import Cart from './pages/client/EnhancedCart';
import Checkout from './pages/client/Checkout';
import Profile from './pages/client/Profile';
import OrderDetailClient from './pages/client/OrderDetail';
import Categories from './pages/Categories';
import Products from './pages/Products';
import SpecialProducts from './pages/SpecialProducts';
import InventoryManagement from './pages/Inventory/InventoryManagement';
import OrdersList from './pages/Orders/OrdersList';
import OrderDetail from './pages/Orders/OrderDetail';
import CreateOrder from './pages/Orders/CreateOrder';
import InvoicesList from './pages/Invoices/InvoicesList';
import InvoiceDetail from './pages/Invoices/InvoiceDetail';
import AnalyticsDashboard from './pages/Analytics/AnalyticsDashboard';
import AuditLogs from './pages/AuditLogs/AuditLogs';
import POSDashboard from './pages/POS/POSDashboard';
import SuppliersList from './pages/Suppliers/SuppliersList';
import POList from './pages/PurchaseOrders/POList';
import ExpensesList from './pages/Expenses/ExpensesList';
import ReturnsList from './pages/Returns/ReturnsList';
import ClientsList from './pages/CRM/ClientsList';
import JobQueue from './pages/Jobs/JobQueue';
import UsersList from './pages/Users/UsersList';
import Settings from './pages/Settings/Settings';
import Layout from './components/Layout';
import CommercialDashboard from './pages/CommercialDashboard';
import PosLanding from './pages/PosLanding';
import Dashboard from './pages/Dashboard';

const redirectByRole = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'commercial':
      return '/commercial';
    case 'saler':
    case 'store_cashier':
    case 'cashier':
      return '/pos';
    default:
      return '/shop';
  }
};

const LandingRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={redirectByRole(user.role)} replace />;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <ClientAuthProvider>
            <CartProvider>
              <Toaster position="top-center" />
              <Routes>
                <Route path="/" element={<LandingRedirect />} />
                <Route path="/login" element={<Login />} />

                {/* Client (shop) */}
                <Route
                  path="/shop"
                  element={
                    <RoleProtectedRoute allowedRoles={['client', 'user']}>
                      <ClientLayout />
                    </RoleProtectedRoute>
                  }
                >
                  <Route index element={<Home />} />
                  <Route path="categories" element={<ClientCategories />} />
                  <Route path="categories/:id" element={<CategoryProducts />} />
                  <Route path="products" element={<ClientProducts />} />
                  <Route path="products/:id" element={<ProductDetail />} />
                  <Route path="special-products" element={<SpecialProductsList />} />
                  <Route path="special-products/:id" element={<SpecialProductConfigurator />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="orders/:id" element={<OrderDetailClient />} />
                </Route>

                {/* Admin */}
                <Route
                  path="/admin"
                  element={
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <Layout />
                    </RoleProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="products" element={<Products />} />
                  <Route path="special-products" element={<SpecialProducts />} />
                  <Route path="inventory" element={<InventoryManagement />} />
                  <Route path="orders" element={<OrdersList />} />
                  <Route path="orders/create" element={<CreateOrder />} />
                  <Route path="orders/:id" element={<OrderDetail />} />
                  <Route path="invoices" element={<InvoicesList />} />
                  <Route path="invoices/:id" element={<InvoiceDetail />} />
                  <Route path="pos" element={<POSDashboard />} />
                  <Route path="suppliers" element={<SuppliersList />} />
                  <Route path="purchase-orders" element={<POList />} />
                  <Route path="expenses" element={<ExpensesList />} />
                  <Route path="returns" element={<ReturnsList />} />
                  <Route path="crm" element={<ClientsList />} />
                  <Route path="analytics" element={<AnalyticsDashboard />} />
                  <Route path="audit-logs" element={<AuditLogs />} />
                  <Route path="users" element={<UsersList />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="jobs" element={<JobQueue />} />
                </Route>

                {/* Commercial & Saler placeholders */}
                <Route
                  path="/commercial"
                  element={
                    <RoleProtectedRoute allowedRoles={['commercial']}>
                      <CommercialDashboard />
                    </RoleProtectedRoute>
                  }
                />
                
                {/* POS Routes for Cashiers */}
                <Route
                  path="/pos"
                  element={
                    <RoleProtectedRoute allowedRoles={['saler', 'store_cashier', 'cashier', 'admin']}>
                      <PosLanding />
                    </RoleProtectedRoute>
                  }
                />
              </Routes>
            </CartProvider>
          </ClientAuthProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
