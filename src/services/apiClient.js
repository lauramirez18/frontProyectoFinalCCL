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
      if (response.data) {
        // Si la respuesta es directamente un array de productos
        if (Array.isArray(response.data)) {
          console.log('getData: Array de productos recibido directamente:', response.data.length);
          return response.data;
        }
        // Si la respuesta tiene la estructura { productos: [...] }
        else if (response.data.productos && Array.isArray(response.data.productos)) {
          console.log('getData: Productos encontrados en data.productos:', response.data.productos.length);
          return response.data.productos;
        }
        // Si la respuesta es un objeto con la estructura esperada
        else if (typeof response.data === 'object') {
          console.log('getData: Objeto de productos recibido:', response.data);
          return response.data;
        }
      }
      console.warn('getData: No se encontraron productos en la respuesta:', response.data);
      return [];
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