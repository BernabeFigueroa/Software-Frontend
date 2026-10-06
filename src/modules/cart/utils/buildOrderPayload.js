/**
 * Fuente única de la verdad (SSOT) para construir el payload de creación de órdenes
 * hacia el backend (POST /api/orders).
 *
 * @param {Object} params
 * @param {string} params.shippingAddress - Dirección completa de envío
 * @param {string} [params.billingAddress] - Dirección de facturación (si no se especifica o está vacía, se usa shippingAddress)
 * @param {string} [params.notes] - Notas o comentarios de entrega
 * @param {Array<{ id: string, quantity: number }>} params.cartItems - Elementos actuales del carrito
 * @returns {{ shippingAddress: string, billingAddress: string, notes: string, orderItems: Array<{ productId: string, quantity: number }> }}
 */
export const buildOrderPayload = ({
  shippingAddress,
  billingAddress,
  notes = '',
  cartItems = [],
}) => {
  if (!shippingAddress || typeof shippingAddress !== 'string' || !shippingAddress.trim()) {
    throw new Error('La dirección de envío es obligatoria.');
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error('El carrito debe contener al menos un producto para procesar la orden.');
  }

  const orderItems = cartItems.map((item) => {
    const productId = item.id || item.productId;
    const quantity = Number(item.quantity);

    if (!productId) {
      throw new Error('Cada ítem del carrito debe contar con un identificador de producto válido.');
    }

    if (!quantity || quantity <= 0) {
      throw new Error(`La cantidad del producto "${item.name || productId}" debe ser mayor a 0.`);
    }

    if (item.stockQuantity !== undefined && quantity > item.stockQuantity) {
      throw new Error(`La cantidad de "${item.name || productId}" supera el stock disponible (${item.stockQuantity} unidades).`);
    }

    return {
      productId,
      quantity,
    };
  });

  const cleanShipping = shippingAddress.trim();
  const cleanBilling = (billingAddress && typeof billingAddress === 'string' && billingAddress.trim())
    ? billingAddress.trim()
    : cleanShipping;

  return {
    shippingAddress: cleanShipping,
    billingAddress: cleanBilling,
    notes: (notes && typeof notes === 'string') ? notes.trim() : '',
    orderItems,
  };
};
