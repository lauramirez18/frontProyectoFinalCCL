import axios from 'axios';
import { useAuthStore } from '../store/store';

const normalizeUrl = (url) => {
  // Si la URL ya incluye /api, no la modifiques
  if (url.includes('/api/')) {
    return url;
  }
  
  // Eliminar la barra inicial si existe
  if (url.startsWith('/')) {
    url = url.substring(1);
  }

  // Asegurarse de que la URL no tenga dobles barras
  return url.replace(/\/+/g, '/');
};

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  /*  baseURL: 'https://backmartplaceccl.onrender.com/api', */
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token a todas las peticiones
apiClient.interceptors.request.use(
  (config) => {
    try {
      // Normalizar la URL
      config.url = normalizeUrl(config.url);
      
      // Log para debugging
      console.log('Axios Interceptor: URL normalizada:', config.url);
      console.log('Axios Interceptor: URL completa de la petición:', `${config.baseURL}/${config.url}`);
      
      const authStateString = localStorage.getItem('auth');
      console.log('Axios Interceptor: Auth state from localStorage:', authStateString);

      if (authStateString) {
        try {
          const authState = JSON.parse(authStateString);
          const token = authState.token;

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Axios Interceptor: Token agregado a la petición');
          } else {
            console.log('Axios Interceptor: No hay token en el auth state');
          }
        } catch (parseError) {
          console.error('Axios Interceptor: Error al parsear auth state:', parseError);
        }
      } else {
        console.log('Axios Interceptor: No hay auth state en localStorage');
      }

      // Log completo de la configuración de la petición
      console.log('Axios Interceptor: Configuración completa de la petición:', {
        method: config.method,
        url: config.url,
        baseURL: config.baseURL,
        headers: config.headers,
        data: config.data
      });

    } catch (error) {
      console.error('Axios Interceptor: Error en el interceptor de request:', error);
    }

    return config;
  },
  (error) => {
    console.error('Axios Interceptor: Error en la configuración de la petición:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => {
    console.log('Axios Interceptor: Respuesta exitosa:', {
      status: response.status,
      url: response.config?.url,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('Axios Interceptor: Error en la respuesta:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      console.warn('Axios Interceptor: Error 401: No autorizado. Sesión expirada o inválida.');
      const authStore = useAuthStore();
      authStore.logout();
      window.location.href = '/login';
    }

    // Si hay un mensaje de error en la respuesta, usarlo
    if (error.response?.data?.error) {
      error.message = error.response.data.error;
    }

    return Promise.reject(error);
  }
);

export default apiClient;