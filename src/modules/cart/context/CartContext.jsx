import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error al cargar carrito:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Agregar producto al carrito validando stock disponible
  const addToCart = (product, quantity = 1) => {
    const stock = Number(product.stockQuantity ?? Infinity);

    if (stock <= 0) {
      return {
        success: false,
        message: `El producto "${product.name}" no tiene stock disponible.`,
      };
    }

    const existingItem = cartItems.find(item => item.id === product.id);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    const targetQuantity = currentQtyInCart + quantity;

    if (targetQuantity > stock) {
      return {
        success: false,
        message: `No puedes agregar más unidades. Stock disponible: ${stock} (ya tienes ${currentQtyInCart} en el carrito).`,
      };
    }

    setCartItems(prevItems => {
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: targetQuantity, stockQuantity: stock }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity, stockQuantity: stock }];
      }
    });

    return { success: true };
  };

  // Actualizar cantidad de un producto validando stock disponible
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    const itemToUpdate = cartItems.find(item => item.id === productId);
    if (!itemToUpdate) {
      return { success: false, message: 'Producto no encontrado en el carrito.' };
    }

    const stock = Number(itemToUpdate.stockQuantity ?? Infinity);

    if (quantity > stock) {
      return {
        success: false,
        message: `No puedes superar el stock disponible (${stock} unidades).`,
      };
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    );

    return { success: true };
  };

  // Eliminar producto del carrito
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Limpiar todo el carrito
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  // Calcular total del carrito
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.currentUnitPrice * item.quantity);
    }, 0);
  };

  // Obtener cantidad total de items
  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
