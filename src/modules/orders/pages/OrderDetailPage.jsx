import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../services/detailService';
import { updateOrderStatus } from '../services/updateService';
import useAuth from '../../auth/hook/useAuth';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import Swal from 'sweetalert2';

const orderStatusLabels = {
  Pending: 'Pendiente',
  Processing: 'En Proceso',
  Shipped: 'Enviado',
  Delivered: 'Entregado',
  Cancelled: 'Cancelado',
};

function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await getOrderById(orderId);

      if (error) {
        setError(error);
        return;
      }

      setOrder(data);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Error al cargar los detalles de la orden');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleUpdateStatus = async () => {
    // Estados finales - no se pueden cambiar
    const finalStatuses = ['Delivered', 'Cancelled'];
    if (finalStatuses.includes(order.status)) {
      Swal.fire({
        icon: 'info',
        title: 'Orden finalizada',
        text: `Esta orden ya está en estado "${orderStatusLabels[order.status]}" y no puede ser modificada.`,
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    // Definir transiciones válidas por estado
    const validTransitions = {
      Pending: ['Processing', 'Cancelled'],
      Processing: ['Shipped', 'Cancelled'],
      Shipped: ['Delivered', 'Cancelled'],
      Delivered: [],
      Cancelled: [],
    };

    const allowedStatuses = validTransitions[order.status] || [];
    
    // Crear opciones solo con las transiciones válidas
    const statusOptions = {};
    allowedStatuses.forEach(status => {
      const labels = {
        Pending: 'Pendiente',
        Processing: 'En Proceso',
        Shipped: 'Enviado',
        Delivered: 'Entregado',
        Cancelled: 'Cancelado',
      };
      statusOptions[status] = labels[status];
    });

    if (allowedStatuses.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Sin cambios posibles',
        text: `Esta orden está en estado "${orderStatusLabels[order.status]}" y no puede ser modificada.`,
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    const { value: newStatus } = await Swal.fire({
      title: 'Actualizar Estado de Orden',
      text: `Estado actual: ${orderStatusLabels[order.status]}`,
      input: 'select',
      inputOptions: statusOptions,
      inputValue: order.status, // Pre-selecciona el estado actual
      inputPlaceholder: 'Selecciona un nuevo estado',
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6b7280',
      inputValidator: (value) => {
        if (!value || value === order.status) {
          return 'Debes seleccionar un estado diferente al actual';
        }
        if (!allowedStatuses.includes(value)) {
          return 'Transición de estado no permitida';
        }
      }
    });

    if (!newStatus) return;

    setUpdatingStatus(true);

    try {
      const { data, error } = await updateOrderStatus(orderId, newStatus);

      if (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar',
          text: error,
        });
        return;
      }

      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `El estado de la orden se actualizó a: ${orderStatusLabels[newStatus]}`,
        timer: 2000,
        showConfirmButton: false,
      });

      // Recargar los detalles de la orden
      fetchOrderDetails();
    } catch (err) {
      console.error('Error updating order status:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al actualizar el estado',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="flex justify-center items-center min-h-[400px]">
            <p className="text-xl text-gray-600">Cargando detalles de la orden...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
            <p className="text-xl text-red-600">{error}</p>
            <Button onClick={() => navigate(-1)}>Volver</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
            <p className="text-xl text-gray-600">No se encontró la orden</p>
            <Button onClick={() => navigate(-1)}>Volver</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button onClick={() => navigate(-1)} className="mb-4">
          ← Volver
        </Button>
        <h1 className="text-4xl font-bold">Detalle de Orden</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información general */}
          <Card>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Orden #{order.id.substring(0, 8)}</h2>
                <p className="text-gray-600">Fecha: {formatDate(order.date)}</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                  order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'Processing' ? 'bg-purple-100 text-purple-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {orderStatusLabels[order.status] || order.status}
                </span>
                
                {/* Botón de actualizar estado solo para administradores y si no está en estado final */}
                {role === 'Administrador' && !['Delivered', 'Cancelled'].includes(order.status) && (
                  <Button
                    onClick={handleUpdateStatus}
                    disabled={updatingStatus}
                    className="text-sm bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                  >
                    {updatingStatus ? 'Actualizando...' : 'Actualizar Estado'}
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Productos */}
          <Card>
            <h2 className="text-2xl font-bold mb-4">Productos</h2>
            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-4 last:border-b-0">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.productName}</h3>
                      <p className="text-gray-600 text-sm">Producto ID: {item.productId.substring(0, 8)}...</p>
                      <p className="text-gray-600 text-sm">Precio unitario: ${item.unitPrice.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600 text-sm">Cantidad: {item.quantity}</p>
                      <p className="font-bold text-lg">${item.subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No hay productos en esta orden</p>
              )}
            </div>
          </Card>

          {/* Direcciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-xl font-bold mb-3">Dirección de Envío</h2>
              <p className="text-gray-700">{order.shippingAddress}</p>
            </Card>

            <Card>
              <h2 className="text-xl font-bold mb-3">Dirección de Facturación</h2>
              <p className="text-gray-700">{order.billingAddress}</p>
            </Card>
          </div>

          {/* Notas */}
          {order.notes && (
            <Card>
              <h2 className="text-xl font-bold mb-3">Notas Adicionales</h2>
              <p className="text-gray-700 italic">{order.notes}</p>
            </Card>
          )}
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <h2 className="text-2xl font-bold mb-4">Resumen</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${order.totalAmount?.toFixed(2)}</span>
              </div>
              
              <div className="border-t pt-3 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-green-600">${order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-2">Información del Cliente</h3>
              <p className="text-sm text-gray-600">ID: {order.customerId?.substring(0, 8)}...</p>
              {order.customerName && (
                <p className="text-sm text-gray-600">Nombre: {order.customerName}</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailPage;
