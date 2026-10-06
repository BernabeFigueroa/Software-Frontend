import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './modules/auth/context/AuthProvider';
import { CartProvider } from './modules/cart/context/CartContext';
import LoginPage from './modules/auth/pages/LoginPage';
import RegisterPage from './modules/auth/pages/RegisterPage';
import Dashboard from './modules/templates/components/Dashboard';
import ProtectedRoute from './modules/auth/components/ProtectedRoute';
import ListOrdersPage from './modules/orders/pages/ListOrdersPage';
import OrderDetailPage from './modules/orders/pages/OrderDetailPage';
import HomeAdmin from './modules/home/pages/HomeAdmin';
import ListProductsPage from './modules/products/pages/ListProductsPage';
import CreateProductPage from './modules/products/pages/CreateProductPage';
import EditProductPage from './modules/products/pages/EditProductPage';
import ProductsListPage from './modules/products/pages/ProductsListPage';
import CartPage from './modules/cart/pages/CartPage';
import CheckoutPage from './modules/cart/pages/CheckoutPage';
import MyOrdersPage from './modules/orders/pages/MyOrdersPage';
import Header from './modules/shared/components/Header';
import Footer from './modules/shared/components/Footer';

// Layout para las páginas públicas (Cliente)
function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  const router = createBrowserRouter([
    // ========== RUTAS PÚBLICAS (CLIENTE) ==========
    {
      path: '/',
      element: <PublicLayout />,
      children: [
        {
          // Página principal - Listado de productos público
          path: '/',
          element: <ProductsListPage />,
        },
        {
          // Carrito - Accesible sin login, pero requiere login para checkout
          path: '/cart',
          element: <CartPage />,
        },
        {
          // Checkout - Proceso de finalización de compra
          path: '/checkout',
          element: (
            <ProtectedRoute allowedRoles={['Cliente', 'Administrador']}>
              <CheckoutPage />
            </ProtectedRoute>
          ),
        },
        {
          // Mis órdenes - Solo para clientes autenticados
          path: '/my-orders',
          element: <MyOrdersPage />,
        },
        {
          // Detalle de orden para cliente
          path: '/order/:orderId',
          element: <OrderDetailPage />,
        },
      ],
    },

    // ========== RUTAS DE AUTENTICACIÓN ==========
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/signup',
      element: <RegisterPage />,
    },

    // ========== RUTAS PROTEGIDAS DE ADMINISTRADOR ==========
    {
      path: '/admin',
      element: (
        <ProtectedRoute allowedRoles={['Administrador']}>
          <Dashboard />
        </ProtectedRoute>
      ),
      children: [
        {
          // Dashboard principal con estadísticas
          index: true,
          element: <HomeAdmin />,
        },
        {
          // Gestión de productos
          path: 'products',
          element: <ListProductsPage />,
        },
        {
          path: 'products/create',
          element: <CreateProductPage />,
        },
        {
          path: 'products/edit/:productId',
          element: <EditProductPage />,
        },
        {
          // Gestión de órdenes
          path: 'orders',
          element: <ListOrdersPage />,
        },
        {
          path: 'orders/:orderId',
          element: <OrderDetailPage />,
        },
      ],
    },
  ]);

  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
