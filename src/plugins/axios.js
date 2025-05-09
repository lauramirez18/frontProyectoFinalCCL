import Axios from 'axios'

// Función para obtener el token desde localStorage
function getToken() {
  try {
    const authData = JSON.parse(localStorage.getItem('auth'))
    return authData?.token || ''
  } catch (error) {
    console.warn('Error leyendo el token del localStorage', error)
    return ''
  }
}

// Crea una instancia de Axios con configuración base
const apiClient = Axios.create({
  baseURL: 'http://localhost:3000/api/',
  headers: {
    'Content-Type': 'application/json',
    'x-token': getToken()
  }
})

// Opcional: Interceptor para actualizar el token si cambia
apiClient.interceptors.request.use((config) => {
  config.headers['x-token'] = getToken()
  return config
})

export default apiClient
