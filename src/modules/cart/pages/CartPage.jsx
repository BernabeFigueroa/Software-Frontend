import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import useAuth from '../../auth/hook/useAuth';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import LoginModal from '../../auth/components/LoginModal';
import RegisterModal from '../../auth/components/RegisterModal';
import Swal from 'sweetalert2';

function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const result = updateQuantity(productId, newQuantity);
    if (result && !result.success) {
      Swal.fire({
        icon: 'warning',
        title: 'Límite de stock',
        text: result.message,
        confirmButtonColor: '#7c3aed',
      });
    }
  };

  const handleRemove = (productId, productName) => {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: `¿Deseas eliminar "${productName}" del carrito?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        removeFromCart(productId);
        Swal.fire({
          icon: 'success',
          title: 'Producto eliminado',
          showConfirmButton: false,
          timer: 1500
        });
      }
    });
  };

  const handleClearCart = () => {
    Swal.fire({
      title: '¿Vaciar carrito?',
      text: '¿Deseas eliminar todos los productos del carrito?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, vaciar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        clearCart();
        Swal.fire({
          icon: 'success',
          title: 'Carrito vaciado',
          showConfirmButton: false,
          timer: 1500
        });
      }
    });
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      Swal.fire({
        icon: 'info',
        title: 'Iniciar Sesión Requerido',
        text: 'Debes iniciar sesión para realizar una compra',
        showCancelButton: true,
        confirmButtonText: 'Iniciar Sesión',
        cancelButtonText: 'Crear Cuenta',
      }).then((result) => {
        if (result.isConfirmed) {
          setShowLoginModal(true);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          setShowRegisterModal(true);
        }
      });
      return;
    }

    if (cartItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Carrito vacío',
        text: 'Agrega al menos un producto al carrito antes de continuar.',
      });
      return;
    }

    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-600">Tu carrito está vacío</h2>
            <p className="text-gray-500">Agrega productos para comenzar tu compra</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Ver Productos
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de productos */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Carrito de Compras</h1>
              <Button 
                onClick={handleClearCart}
                className="bg-red-500 hover:bg-red-600"
              >
                Vaciar Carrito
              </Button>
            </div>

            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                      <p className="text-sm text-gray-500">Stock disponible: {item.stockQuantity}</p>
                      <p className="text-lg font-bold text-green-600 mt-2">
                        ${item.currentUnitPrice.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Control de cantidad */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                          className="w-16 text-center border rounded px-2 py-1"
                          min="1"
                        />
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stockQuantity}
                          className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center"
                          title={item.quantity >= item.stockQuantity ? 'Stock máximo alcanzado' : 'Aumentar cantidad'}
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right min-w-[100px]">
                        <p className="text-sm text-gray-600">Subtotal</p>
                        <p className="text-lg font-bold">
                          ${(item.currentUnitPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Botón eliminar */}
                      <button
                        onClick={() => handleRemove(item.id, item.name)}
                        className="text-red-500 hover:text-red-700 p-2"
                        title="Eliminar producto"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>

        {/* Resumen del pedido */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <h2 className="text-2xl font-bold mb-4">Resumen del Pedido</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Productos ({cartItems.length})</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-green-600">${getCartTotal().toFixed(2)}</span>
              </div>
            </div>

            <Button 
              onClick={handleProceedToCheckout}
              className="w-full !bg-green-600 hover:!bg-green-700 !text-white text-lg py-3"
            >
              Continuar al Checkout
            </Button>

            <Button 
              onClick={() => navigate('/')}
              className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Seguir Comprando
            </Button>
          </Card>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        requireClientRole={true}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </div>
  );
}

export default CartPage;
