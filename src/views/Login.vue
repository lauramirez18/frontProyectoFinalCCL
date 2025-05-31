<template>
  <body class="containerG">
 
    <div class="login-container">
      <div class="login-card">
        <div class="card">
           <h1 class="login-title">Iniciar Sesión</h1>
        <p class="welcome-text">Bienvenido de vuelta</p>
        
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              placeholder="tu@email.com"
              required
            />
            <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
          </div>
          
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              v-model="password"
              placeholder="••••••••"
              required
            />
            <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
            <div class="forgot-password">
              <a href="#" @click.prevent="forgotPassword">¿Olvidaste tu contraseña?</a>
            </div>
          </div>
          
          <button type="submit" class="btn-login" :disabled="isLoading">
            {{ isLoading ? 'Cargando...' : 'Iniciar sesión' }}
          </button>
          
          <div v-if="errors.general" class="error-message general-error">
            {{ errors.general }}
          </div>
        </form>
        
        <div class="signup-prompt">
          <span>¿No tienes cuenta?</span>
          <router-link to="/Register">Crear cuenta</router-link>
        </div>
        </div>
       
      </div>
      
      <div class="welcome-card">
        <div class="banner-welcome">
         <img src="/logo2.png" alt="Welcome" class="welcome-icon" />
        <h1 class="welcome-title">¡Bienvenido de vuelta!</h1>
        <p class="welcome-subtitle">Descubre las últimas novedades en tecnología</p>
        
        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon blue" style="background-color: #068FFF;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span>Accede a tu historial de compras</span>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon yellow" style="background-color: #068FFF;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span>Revisa el estado de tus pedidos</span>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon orange" style="background-color: #068FFF;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span>Gestiona tus productos favoritos</span>
          </div>
        </div> 
        </div>
        
      </div>
    </div>

  </body>
  
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { getData, postData } from '../services/apiClient.js';
import { useAuthStore } from '../store/store.js';

const router = useRouter();

// Datos del formulario
const email = ref('');
const password = ref('');
const isLoading = ref(false);
const authStore = useAuthStore();

// Control de errores
const errors = reactive({
  user:'',
  email: '',
  password: '',
  general: ''
});

// Limpiar errores
const clearErrors = () => {
  errors.user = '';
  errors.email = '';
  errors.password = '';
  errors.general = '';
};

// Verificar si el usuario ya está autenticado
onMounted(() => {
  checkAuthStatus();
});

// Verificar si hay una sesión activa
const checkAuthStatus = async () => {
  const authData = localStorage.getItem('auth');

  if (authData) {
    try {
      const { token } = JSON.parse(authData);

      if (token) {
        // Verificar si el token es válido
        const response = await getData('/auth/verify-token');
        if (response.valid) {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error al verificar el estado de autenticación:', error);
      localStorage.removeItem('auth');
    }
  }
};

// Método para inicio de sesión
const handleLogin = async () => {
  clearErrors();
  let isValid = true;

  if (!email.value) {
    errors.email = 'El correo electrónico es obligatorio';
    isValid = false;
  }

  if (!password.value) {
    errors.password = 'La contraseña es obligatoria';
    isValid = false;
  }

  if (!isValid) return;

  isLoading.value = true;
  try {
    const response = await postData('usuarios/login', {
      email: email.value,
      password: password.value
    });

    if (response.token) {
      const authData = { token: response.token };
      localStorage.setItem('auth', JSON.stringify(authData));
      
      // Store the complete user object
      authStore.setToken(response.token);
      authStore.setUser(response.user);
      
      router.push('/dashboard');
    } else {
      throw new Error('No se recibió token de autenticación');
    }
  } catch (error) {
    console.error('Error en inicio de sesión:', error);

    if (error.response) {
      const status = error.response.status;
      const errorMsg = error.response.data.error;

      if (status === 400) {
        if (errorMsg === 'usuario no encontrado') {
          errors.email = 'Usuario no encontrado';
        } else if (errorMsg === 'contraseña incorrecta') {
          errors.password = 'Contraseña incorrecta';
        } else {
          errors.general = errorMsg || 'Credenciales incorrectas';
        }
      } else {
        errors.general = errorMsg || 'Error al iniciar sesión';
      }
    } else {
      errors.general = 'Error de conexión. Intente más tarde.';
    }
  } finally {
    isLoading.value = false;
  }
};

// Método para recuperación de contraseña
const forgotPassword = async () => {
  const userEmail = prompt('Introduce tu correo electrónico para recuperar la contraseña:');

  if (!userEmail) return;

  if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(userEmail)) {
    alert('Por favor, introduce un correo electrónico válido');
    return;
  }

  isLoading.value = true;
  try {
    await postData('/auth/forgot-password', { email: userEmail });
    alert(`Se ha enviado un enlace de recuperación a ${userEmail}`);
  } catch (error) {
    console.error('Error al solicitar recuperación:', error);
    const errorMsg = error.response?.data?.error || 'Error al procesar la solicitud';
    alert(`Error: ${errorMsg}`);
  } finally {
    isLoading.value = false;
  }
};
</script>
  
<style scoped>
@import url('../styles/login.css');

/* Estilos adicionales para manejo de errores */
.error-message {
  color: #e53935;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  text-align: left;
}

.general-error {
  margin: 0.75rem 0;
  padding: 0.5rem;
  background-color: rgba(229, 57, 53, 0.1);
  border-radius: 4px;
  text-align: center;
}
</style>
