import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ClientAuthProvider, useClientAuth } from './contexts/ClientAuthContext';
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
import CommercialAnalyticsDashboard from './pages/Analytics/CommercialAnalyticsDashboard';
import AdvancedCommercialAnalyticsDashboard from './pages/Analytics/AdvancedCommercialAnalyticsDashboard';
import OrdersProductsAnalytics from './pages/Analytics/OrdersProductsAnalytics';
import CommercialDetail from './pages/Analytics/CommercialDetail';
import AuditLogs from './pages/AuditLogs/AuditLogs';
import POSDashboard from './pages/POS/POSDashboard';
import SuppliersList from './pages/Suppliers/SuppliersList';
import POList from './pages/PurchaseOrders/POList';
import ExpensesList from './pages/Expenses/ExpensesList';
import ExpenseCategories from './pages/Expenses/ExpenseCategories';
import ReturnsList from './pages/Returns/ReturnsList';
import ClientsList from './pages/CRM/ClientsList';
import JobQueue from './pages/Jobs/JobQueue';
import UsersList from './pages/Users/UsersList';
import Settings from './pages/Settings/Settings';
import Layout from './components/Layout';
import CommercialLayout from './components/commercial/CommercialLayout';
import CommercialDashboard from './pages/commercial/CommercialHome';
import CommercialClients from './pages/commercial/CommercialClients';
import CommercialClientDetail from './pages/commercial/CommercialClientDetail';
import CommercialOrders from './pages/commercial/CommercialOrders';
import CommercialOrderDetail from './pages/commercial/CommercialOrderDetail';
import CommercialInvoices from './pages/commercial/CommercialInvoices';
import CommercialInvoiceDetail from './pages/commercial/CommercialInvoiceDetail';
import CommercialUnpaid from './pages/commercial/CommercialUnpaid';
import CommercialPOS from './pages/commercial/CommercialPOS';
import CommercialSettings from './pages/commercial/CommercialSettings';
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
  const { user: adminUser, loading: adminLoading } = useAuth();
  const { user: clientUser, loading: clientLoading } = useClientAuth();
  
  const user = adminUser || clientUser;
  const loading = adminLoading || clientLoading;
  
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

const OrderRedirect = () => {
  const { id } = useParams();
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
      </div>
    );
  }
  
  // Redirect to admin orders (will be protected by RoleProtectedRoute)
  return <Navigate to={`/admin/orders/${id}`} replace />;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <ClientAuthProvider>
            <CartProvider>
              <Toaster
                position="top-center"
                toastOptions={{
                  style: {
                    border: '1px solid #FFD700',
                    padding: '12px 16px',
                  },
                  iconTheme: {
                    primary: '#FFD700',
                    secondary: '#1f2937',
                  },
                  success: {
                    iconTheme: {
                      primary: '#FFD700',
                      secondary: '#1f2937',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#FFD700',
                      secondary: '#1f2937',
                    },
                  },
                }}
              />
              <Routes>
                <Route path="/" element={<LandingRedirect />} />
                <Route path="/login" element={<Login />} />
                
                {/* Redirect old /orders routes to /admin/orders */}
                <Route 
                  path="/orders/:id" 
                  element={<OrderRedirect />} 
                />
                <Route 
                  path="/orders" 
                  element={<Navigate to="/admin/orders" replace />} 
                />

                {/* Client (shop) - Block cashiers */}
                <Route
                  path="/shop"
                  element={
                    <RoleProtectedRoute 
                      allowedRoles={['client', 'user']}
                      blockedRoles={['cashier', 'store_cashier', 'saler']}
                    >
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
                  <Route path="expenses/categories" element={<ExpenseCategories />} />
                  <Route path="returns" element={<ReturnsList />} />
                  <Route path="crm" element={<ClientsList />} />
                  <Route path="analytics" element={<AnalyticsDashboard />} />
                  <Route path="analytics/commercials" element={<CommercialAnalyticsDashboard />} />
                  <Route path="analytics/commercials/advanced" element={<AdvancedCommercialAnalyticsDashboard />} />
                  <Route path="analytics/orders-products" element={<OrdersProductsAnalytics />} />
                  <Route path="analytics/commercials/:id" element={<CommercialDetail />} />
                  <Route path="audit-logs" element={<AuditLogs />} />
                  <Route path="users" element={<UsersList />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="jobs" element={<JobQueue />} />
                </Route>

                {/* Commercial Dashboard */}
                <Route
                  path="/commercial"
                  element={
                    <RoleProtectedRoute allowedRoles={['commercial', 'admin']}>
                      <CommercialLayout />
                    </RoleProtectedRoute>
                  }
                >
                  <Route index element={<CommercialDashboard />} />
                  <Route path="clients" element={<CommercialClients />} />
                  <Route path="clients/:id" element={<CommercialClientDetail />} />
                  <Route path="orders" element={<CommercialOrders />} />
                  <Route path="orders/:id" element={<CommercialOrderDetail />} />
                  <Route path="invoices" element={<CommercialInvoices />} />
                  <Route path="invoices/:id" element={<CommercialInvoiceDetail />} />
                  <Route path="unpaid" element={<CommercialUnpaid />} />
                  <Route path="pos" element={<CommercialPOS />} />
                  <Route path="settings" element={<CommercialSettings />} />
                </Route>
                
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
