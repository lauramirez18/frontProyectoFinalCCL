import apiClient from '../plugins/axios'


export async function getData(url, params = {}) { // <-- ¡Aquí está el cambio!
  try {
    // Axios espera los parámetros de consulta en un objeto 'params' dentro del segundo argumento
    const response = await apiClient.get(url, { params }); // <-- ¡Aquí está el cambio!
    return response.data;
  } catch (error) {
    console.log('Error en la petición GET:', error.response ? error.response.data : error.message);
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