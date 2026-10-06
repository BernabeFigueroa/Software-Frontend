import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCart } from '../../cart/context/CartContext';
import { createOrder } from '../../orders/services/createService';
import { buildOrderPayload } from '../utils/buildOrderPayload';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import Input from '../../shared/components/Input';
import Swal from 'sweetalert2';

function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, clearCart, getCartTotal } = useCart();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const useSameAddress = watch('useSameAddress', false);

  const onSubmit = async (formData) => {
    if (cartItems.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Carrito vacío',
        text: 'No hay productos en el carrito',
      });
      return;
    }

    setLoading(true);

    try {
      // Construir dirección de envío legible
      const shippingAddress = `Calle: ${formData.shippingStreet.trim()}, Altura: ${formData.shippingNumber.trim()}, Ciudad: ${formData.shippingCity.trim()}, Provincia: ${formData.shippingProvince.trim()}`;
      
      // Construir dirección de facturación
      const billingAddress = useSameAddress 
        ? shippingAddress
        : `Calle: ${formData.billingStreet.trim()}, Altura: ${formData.billingNumber.trim()}, Ciudad: ${formData.billingCity.trim()}, Provincia: ${formData.billingProvince.trim()}`;

      // Centralización y estandarización mediante buildOrderPayload (SSOT)
      const orderData = buildOrderPayload({
        shippingAddress,
        billingAddress,
        notes: formData.notes,
        cartItems,
      });

      console.log('Order data to send:', orderData);

      const { data, error } = await createOrder(orderData);

      if (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error al crear orden',
          text: error,
        });
        return;
      }

      // Limpiar carrito y mostrar éxito
      clearCart();
      
      await Swal.fire({
        icon: 'success',
        title: '¡Orden creada exitosamente!',
        text: data?.id ? `Tu orden #${data.id.substring(0, 8)} ha sido procesada` : 'Tu orden ha sido procesada',
        confirmButtonText: 'Ver mis órdenes',
      });

      navigate('/my-orders');
    } catch (err) {
      console.error('Error in checkout:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Ocurrió un error al procesar tu orden',
      });
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <h2 className="text-2xl font-semibold text-gray-600">No hay productos para procesar</h2>
            <Button onClick={() => navigate('/')}>
              Ver Productos
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Finalizar Compra</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario de direcciones */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dirección de Envío */}
            <Card>
              <h2 className="text-2xl font-bold mb-4">Dirección de Envío</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Calle"
                    {...register('shippingStreet', { 
                      required: 'La calle es requerida' 
                    })}
                    error={errors.shippingStreet?.message}
                  />
                </div>
                <Input
                  label="Altura"
                  {...register('shippingNumber', { 
                    required: 'La altura es requerida' 
                  })}
                  error={errors.shippingNumber?.message}
                />
                <Input
                  label="Ciudad"
                  {...register('shippingCity', { 
                    required: 'La ciudad es requerida' 
                  })}
                  error={errors.shippingCity?.message}
                />
                <Input
                  label="Provincia"
                  {...register('shippingProvince', { 
                    required: 'La provincia es requerida' 
                  })}
                  error={errors.shippingProvince?.message}
                />
              </div>
            </Card>

            {/* Dirección de Facturación */}
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Dirección de Facturación</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('useSameAddress')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Usar la misma dirección</span>
                </label>
              </div>

              {!useSameAddress && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Calle"
                      {...register('billingStreet', { 
                        required: !useSameAddress ? 'La calle es requerida' : false 
                      })}
                      error={errors.billingStreet?.message}
                    />
                  </div>
                  <Input
                    label="Altura"
                    {...register('billingNumber', { 
                      required: !useSameAddress ? 'La altura es requerida' : false 
                    })}
                    error={errors.billingNumber?.message}
                  />
                  <Input
                    label="Ciudad"
                    {...register('billingCity', { 
                      required: !useSameAddress ? 'La ciudad es requerida' : false 
                    })}
                    error={errors.billingCity?.message}
                  />
                  <Input
                    label="Provincia"
                    {...register('billingProvince', { 
                      required: !useSameAddress ? 'La provincia es requerida' : false 
                    })}
                    error={errors.billingProvince?.message}
                  />
                </div>
              )}
            </Card>

            {/* Notas adicionales */}
            <Card>
              <h2 className="text-2xl font-bold mb-4">Notas Adicionales</h2>
              <textarea
                {...register('notes')}
                placeholder="Instrucciones de entrega, comentarios, etc."
                className="w-full border rounded px-4 py-2 min-h-[100px]"
              />
            </Card>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <h2 className="text-2xl font-bold mb-4">Resumen del Pedido</h2>
              
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="flex-1">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="font-semibold">
                      ${(item.currentUnitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Subtotal</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-green-600">${getCartTotal().toFixed(2)}</span>
                </div>
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
              >
                {loading ? 'Procesando...' : 'Confirmar Compra'}
              </Button>

              <Button 
                type="button"
                onClick={() => navigate('/cart')}
                className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Volver al Carrito
              </Button>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CheckoutPage;
