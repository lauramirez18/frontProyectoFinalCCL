import apiClient from '../plugins/axios'

export async function getData(url, params = {}) {
  try {
    console.log(`getData: Iniciando petición GET a ${url}`, params);
    const response = await apiClient.get(url, { params });
    console.log(`getData: Respuesta completa de ${url}:`, response);
    
    // Manejo específico para marcas
    if (url === 'marcas') {
      console.log('getData: Procesando respuesta de marcas');
      if (Array.isArray(response.data)) {
        console.log('getData: Marcas encontradas:', response.data.length);
        return response.data;
      } else {
        console.warn('getData: Formato de respuesta de marcas inesperado:', response.data);
        return [];
      }
    }
    
    // Manejo específico para productos
    if (url === 'productos') {
      console.log('getData: Procesando respuesta de productos');
      if (response.data && typeof response.data === 'object') {
        // Si la respuesta tiene la estructura esperada (productos y paginación)
        if (response.data.productos && response.data.pagination) {
          console.log('getData: Productos encontrados:', response.data.productos.length);
          return response.data;
        }
        // Si la respuesta es un array de productos
        else if (Array.isArray(response.data)) {
          console.log('getData: Productos encontrados (array):', response.data.length);
          return {
            productos: response.data,
            pagination: {
              total: response.data.length,
              page: params.page || 1,
              limit: params.limit || 12,
              totalPages: Math.ceil(response.data.length / (params.limit || 12))
            }
          };
        }
      }
      console.warn('getData: Formato de respuesta de productos inesperado:', response.data);
      return { productos: [], pagination: { total: 0, page: 1, limit: 12, totalPages: 1 } };
    }
    
    // Para otras URLs, mantener el comportamiento original
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    const possibleArrayProps = ['marcas', 'productos', 'data', 'items'];
    for (const prop of possibleArrayProps) {
      if (response.data[prop] && Array.isArray(response.data[prop])) {
        return response.data[prop];
      }
    }
    
    return response.data;
  } catch (error) {
    console.error(`getData: Error en la petición GET a ${url}:`, error);
    console.error('Detalles del error:', error.response?.data);
    console.error('URL de la petición:', error.config?.url);
    console.error('Método de la petición:', error.config?.method);
    throw error;
  }
}

/**
 * Realiza una petición POST a la API.
 * @param {string} url - La ruta del endpoint.
 * @param {object} data - El cuerpo de la petición.
 * @returns {Promise<any>} - La data de la respuesta.
 */

export async function postData(url, data){
    try {
        const response = await apiClient.post(url, data);
        return response.data;
    } catch (error) {
        console.log('Error en la petición POST:', error.response ? error.response.data : error.message);
        throw error;
    }
}

export async function putData(url, data){
    try {
        const response = await apiClient.put(url, data);
        return response.data;
    } catch (error) {
        console.log('Error en la petición PUT:', error.response ? error.response.data : error.message);
        throw error;
    }
}

/**
 * Realiza una petición DELETE a la API.
 * @param {string} url - La ruta del endpoint.
 * @returns {Promise<any>} - La data de la respuesta.
 */
export async function deleteData(url) {
    try {
        const response = await apiClient.delete(url);
        return response.data;
    } catch (error) {
        console.log('Error en la petición DELETE:', error.response ? error.response.data : error.message);
        throw error;
    }
}