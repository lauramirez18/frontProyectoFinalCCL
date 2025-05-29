

import axios from 'axios';


const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api', 
  headers: {
    'Content-Type': 'application/json'
  }
});



apiClient.interceptors.request.use(
  (config) => {
    try {
  
      const authStateString = localStorage.getItem('auth');

      if (authStateString) {
        
        const authState = JSON.parse(authStateString);
        const token = authState.token;

        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
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



apiClient.interceptors.response.use(

  (response) => response,


  (error) => {
   
    if (error.response?.status === 401) {
      console.warn('Error 401: No autorizado. Sesión expirada o inválida. Cerrando sesión.');
    
      localStorage.removeItem('auth');
   
      window.location.reload();
    }


    return Promise.reject(error);
  }
);


export default apiClient;