import { instance } from '../../shared/api/axiosInstance';
import { handleApiError } from '../../shared/helpers/errorMessages';

// Para administradores: obtiene todos los productos con filtros
export const getProductsAdmin = async ({ 
  search = null, 
  status = null, 
  pageNumber = 1, 
  pageSize = 20 
} = {}) => {
  try {
    const params = {
      ...(search && { Search: search }),
      ...(status && { Status: status }),
      PageNumber: pageNumber,
      PageSize: pageSize,
    };

    const response = await instance.get('/api/products/admin', { params });

    return { data: response.data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error.response?.data?.message || 'Error al obtener productos' 
    };
  }
};

// Para usuarios públicos: obtiene solo productos activos
export const getProductsPublic = async ({ 
  search = null,
  pageNumber = 1, 
  pageSize = 10 
} = {}) => {
  try {
    const params = {
      ...(search && { search: search }),
      pageNumber,
      pageSize,
    };

    const response = await instance.get('/api/products', { params });

    return { data: response.data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: handleApiError(error)
    };
  }
};

// Mantener retrocompatibilidad con el nombre anterior
export const getProducts = getProductsAdmin;