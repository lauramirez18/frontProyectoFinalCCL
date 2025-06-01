import axios from '../plugins/axios'

// Asegurarnos de que todas las rutas empiecen con /api/
const ensureApiPrefix = (endpoint) => {
  return endpoint.startsWith('/api/') ? endpoint : `/api/${endpoint}`
}

export async function getData(endpoint) {
  console.log(`Making GET request to: ${endpoint}`)
  try {
    const response = await axios.get(endpoint)
    console.log(`GET response from ${endpoint}:`, response.data)
    return response.data
  } catch (error) {
    console.error(`Error in GET request to ${endpoint}:`, error)
    if (error.response) {
      console.log('Error response:', error.response.data)
    }
    throw error
  }
}

/**
 * Realiza una petición POST a la API.
 * @param {string} endpoint - La ruta del endpoint.
 * @param {object} data - El cuerpo de la petición.
 * @returns {Promise<any>} - La data de la respuesta.
 */

export async function postData(endpoint, data) {
  console.log(`Making POST request to: ${endpoint}`, data)
  try {
    const response = await axios.post(endpoint, data)
    console.log(`POST response from ${endpoint}:`, response.data)
    return response.data
  } catch (error) {
    console.error(`Error in POST request to ${endpoint}:`, error)
    if (error.response) {
      console.log('Error response:', error.response.data)
      console.log('Error status:', error.response.status)
    }
    throw error
  }
}

export async function putData(endpoint, data) {
  console.log(`Making PUT request to: ${endpoint}`, data)
  try {
    const response = await axios.put(endpoint, data)
    console.log(`PUT response from ${endpoint}:`, response.data)
    return response.data
  } catch (error) {
    console.error(`Error in PUT request to ${endpoint}:`, error)
    if (error.response) {
      console.log('Error response:', error.response.data)
    }
    throw error
  }
}

/**
 * Realiza una petición DELETE a la API.
 * @param {string} endpoint - La ruta del endpoint.
 * @returns {Promise<any>} - La data de la respuesta.
 */
export async function deleteData(endpoint) {
  console.log(`Making DELETE request to: ${endpoint}`)
  try {
    const response = await axios.delete(endpoint)
    console.log(`DELETE response from ${endpoint}:`, response.data)
    return response.data
  } catch (error) {
    console.error(`Error in DELETE request to ${endpoint}:`, error)
    if (error.response) {
      console.log('Error response:', error.response.data)
    }
    throw error
  }
}