import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductsPublic } from '../services/list';
import { useCart } from '../../cart/context/CartContext';
import useAuth from '../../auth/hook/useAuth';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import Swal from 'sweetalert2';

function ProductsListPage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, role } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await getProductsPublic({
        search: searchTerm || null,
        pageNumber,
        pageSize,
      });

      if (error) {
        setError(error);
        return;
      }

      setProducts(data.items);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
      setHasNext(data.hasNext);
      setHasPrevious(data.hasPrevious);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [pageNumber, pageSize]);

  const handleSearch = async () => {
    setPageNumber(1);
    await fetchProducts();
  };

  const handleAddToCart = (product) => {
    const result = addToCart(product, 1);

    if (result && !result.success) {
      Swal.fire({
        icon: 'warning',
        title: 'Límite de stock',
        text: result.message,
        confirmButtonColor: '#7c3aed',
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Producto agregado',
      text: `${product.name} fue agregado al carrito`,
      showConfirmButton: false,
      timer: 1500,
      toast: true,
      position: 'top-end',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-xl text-gray-600">Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      

      {/* Barra de búsqueda y filtros */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6'>
        <div className='flex flex-col lg:flex-row gap-4'>
          {/* Barra de búsqueda */}
          <div className='flex-1 flex gap-2'>
            <input 
              value={searchTerm} 
              onChange={(evt) => setSearchTerm(evt.target.value)}
              onKeyDown={(evt) => {
                if (evt.key === 'Enter') handleSearch();
              }}
              type="text" 
              placeholder='Buscar productos por nombre o descripción...' 
              className='flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent' 
            />
            <Button 
              className='px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md flex items-center gap-2'
              onClick={handleSearch}
            >
              <svg className='w-5 h-5' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
              <span className='hidden sm:inline'>Buscar</span>
            </Button>
          </div>
        </div>
        
        {/* Contador de resultados */}
        <div className='mt-3 pt-3 border-t border-gray-200'>
          {!loading && !error && (
            <p className="text-gray-600 text-sm">
              Mostrando <span className='font-semibold'>{products.length}</span> de <span className='font-semibold'>{totalCount}</span> productos
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="flex flex-col">
            <div className="flex flex-col h-full">
              {/* Imagen del producto */}
              {product.imageUrl && (
                <div className="w-full h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Si la imagen falla, ocultar el contenedor
                      e.target.parentElement.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2">SKU: {product.sku}</p>
                <p className="text-gray-700 mb-4 flex-grow">{product.description}</p>
                
                <div className="mt-auto">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl font-bold text-green-600">
                      ${product.currentUnitPrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {product.stockQuantity}
                    </span>
                  </div>
                  
                  {/* Solo mostrar botón de agregar al carrito si no es administrador */}
                  {(!isAuthenticated || role !== 'Administrador') && (
                    <Button 
                      onClick={() => handleAddToCart(product)}
                      className="w-full"
                      disabled={product.stockQuantity === 0}
                    >
                      {product.stockQuantity > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
                    </Button>
                  )}
                  
                  {/* Mostrar mensaje informativo para administradores */}
                  {isAuthenticated && role === 'Administrador' && (
                    <div className="text-center py-2 text-gray-600 text-sm">
                      Vista previa de la tienda
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No hay productos disponibles</p>
        </div>
      )}

      {/* Paginación */}
      {!loading && products.length > 0 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            disabled={!hasPrevious}
            onClick={() => setPageNumber(pageNumber - 1)}
            className='px-4 py-2 bg-gray-200 rounded disabled:bg-gray-100 disabled:cursor-not-allowed hover:bg-gray-300'
          >
            Atrás
          </button>
          
          <span className='text-lg'>
            Página {pageNumber} de {totalPages} ({totalCount} productos)
          </span>
          
          <button
            disabled={!hasNext}
            onClick={() => setPageNumber(pageNumber + 1)}
            className='px-4 py-2 bg-gray-200 rounded disabled:bg-gray-100 disabled:cursor-not-allowed hover:bg-gray-300'
          >
            Siguiente
          </button>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPageNumber(1);
            }}
            className='px-3 py-2 border rounded bg-white'
          >
            <option value={5}>5 por página</option>
            <option value={10}>10 por página</option>
            <option value={12}>12 por página</option>
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
          </select>
        </div>
      )}
    </div>
  );
}

export default ProductsListPage;
