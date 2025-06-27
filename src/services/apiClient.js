import apiClient from '../plugins/axios'

export async function getData(url, params = {}) {
  try {
    console.log(`getData: Iniciando petición GET a ${url}`, params);
    const response = await apiClient.get(url, { params });
    console.log(`getData: Respuesta completa de ${url}:`, response);
    
    // Si la respuesta es un error, lanzarlo
    if (response.status >= 400) {
      throw new Error(response.data?.error || 'Error en la petición');
    }

    // Si no hay datos, devolver un objeto vacío
    if (!response.data) {
      console.warn(`getData: No hay datos en la respuesta de ${url}`);
      return {};
    }
    
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
    
    // Manejo específico para ofertas
    if (url === 'productos/ofertas') {
      console.log('getData: Procesando respuesta de ofertas');
      if (response.data) {
        // Si la respuesta es directamente un array de productos en oferta
        if (Array.isArray(response.data)) {
          console.log('getData: Array de ofertas recibido directamente:', response.data.length);
          return response.data;
        }
        // Si la respuesta tiene la estructura { productos: [...] }
        else if (response.data.productos && Array.isArray(response.data.productos)) {
          console.log('getData: Ofertas encontradas en data.productos:', response.data.productos.length);
          return response.data.productos;
        }
      }
      console.warn('getData: No se encontraron ofertas en la respuesta:', response.data);
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
    
    // Si el error es de autenticación, lanzar un error específico
    if (error.response?.status === 401) {
      throw new Error('Sesión expirada o inválida. Por favor, inicia sesión nuevamente.');
    }
    
    // Si hay un mensaje de error en la respuesta, usarlo
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    
    // Si no hay mensaje específico, usar el mensaje del error
    throw error;
  }
}

/**
 * Realiza una petición POST a la API.
 * @param {string} url - La ruta del endpoint.
 * @param {object} data - El cuerpo de la petición.
 * @returns {Promise<any>} - La data de la respuesta.
 */

export async function postData(url, data = {}) {
  try {
    console.log(`postData: Iniciando petición POST a ${url}`, data);
    const response = await apiClient.post(url, data);
    console.log(`postData: Respuesta completa de ${url}:`, response);
    
    // Si la respuesta es un error, lanzarlo
    if (response.status >= 400) {
      throw new Error(response.data?.error || 'Error en la petición');
    }

    // Si no hay datos, devolver un objeto vacío
    if (!response.data) {
      console.warn(`postData: No hay datos en la respuesta de ${url}`);
      return {};
    }
    
    return response.data;
  } catch (error) {
    console.error(`postData: Error en la petición POST a ${url}:`, error);
    console.error('Detalles del error:', error.response?.data);
    console.error('URL de la petición:', error.config?.url);
    console.error('Método de la petición:', error.config?.method);
    
    // Si el error es de autenticación, lanzar un error específico
    if (error.response?.status === 401) {
      throw new Error('Sesión expirada o inválida. Por favor, inicia sesión nuevamente.');
    }
    
    // Si hay un mensaje de error en la respuesta, usarlo
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    
    // Si no hay mensaje específico, usar el mensaje del error
    throw error;
  }
}

export async function putData(url, data = {}) {
  try {
    console.log(`putData: Iniciando petición PUT a ${url}`, data);
    const response = await apiClient.put(url, data);
    console.log(`putData: Respuesta completa de ${url}:`, response);
    
    // Si la respuesta es un error, lanzarlo
    if (response.status >= 400) {
      throw new Error(response.data?.error || 'Error en la petición');
    }

    // Si no hay datos, devolver un objeto vacío
    if (!response.data) {
      console.warn(`putData: No hay datos en la respuesta de ${url}`);
      return {};
    }
    
    return response.data;
  } catch (error) {
    console.error(`putData: Error en la petición PUT a ${url}:`, error);
    console.error('Detalles del error:', error.response?.data);
    console.error('URL de la petición:', error.config?.url);
    console.error('Método de la petición:', error.config?.method);
    
    // Si el error es de autenticación, lanzar un error específico
    if (error.response?.status === 401) {
      throw new Error('Sesión expirada o inválida. Por favor, inicia sesión nuevamente.');
    }
    
    // Si hay un mensaje de error en la respuesta, usarlo
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    
    // Si no hay mensaje específico, usar el mensaje del error
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
    console.log(`deleteData: Iniciando petición DELETE a ${url}`);
    const response = await apiClient.delete(url);
    console.log(`deleteData: Respuesta completa de ${url}:`, response);
    
    // Si la respuesta es un error, lanzarlo
    if (response.status >= 400) {
      throw new Error(response.data?.error || 'Error en la petición');
    }

    // Si no hay datos, devolver un objeto vacío
    if (!response.data) {
      console.warn(`deleteData: No hay datos en la respuesta de ${url}`);
      return {};
    }
    
    return response.data;
  } catch (error) {
    console.error(`deleteData: Error en la petición DELETE a ${url}:`, error);
    console.error('Detalles del error:', error.response?.data);
    console.error('URL de la petición:', error.config?.url);
    console.error('Método de la petición:', error.config?.method);
    
    // Si el error es de autenticación, lanzar un error específico
    if (error.response?.status === 401) {
      throw new Error('Sesión expirada o inválida. Por favor, inicia sesión nuevamente.');
    }
    
    // Si hay un mensaje de error en la respuesta, usarlo
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    
    // Si no hay mensaje específico, usar el mensaje del error
    throw error;
  }
}