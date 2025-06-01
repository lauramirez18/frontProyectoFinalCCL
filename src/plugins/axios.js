import axios from 'axios';
import { useAuthStore } from '../store/store';


const normalizeUrl = (url) => {
  
  if (url.startsWith('/')) {
    return url;
  }

  return `/${url}`;
};

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
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
      
      const authStateString = localStorage.getItem('auth');
      console.log('Auth state from localStorage:', authStateString);

      if (authStateString) {
        const authState = JSON.parse(authStateString);
        const token = authState.token;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Token added to request:', token);
          console.log('Request headers:', config.headers);
          console.log('Full request URL:', `${config.baseURL}${config.url}`);
          console.log('Request method:', config.method);
          console.log('Request data:', config.data);
        } else {
          console.warn('No token found in auth state');
        }
      } else {
        console.warn('No auth state found in localStorage');
      }
    } catch (error) {
      console.error('Error al procesar el token desde localStorage:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('Response error:', error);
    console.log('Response error config:', error.config);
    
    if (error.response?.status === 401) {
      // Si el error es 401, cerrar sesión
      console.warn('Error 401: No autorizado. Sesión expirada o inválida.');
      const authStore = useAuthStore();
      authStore.logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;