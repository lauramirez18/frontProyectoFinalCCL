<!-- src/components/LoginDialog.vue -->
<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card class="q-pa-md" style="min-width: 400px; max-width: 1000px; padding: 30px; position: relative;">
      <!-- Botón de cerrar en la esquina superior derecha -->
      <q-btn 
        dense 
        flat 
        icon="close" 
        v-close-popup 
        class="absolute-top-right"
        style="top: 10px; right: 10px; z-index: 1;"
      />
      
      <q-card-section>
        <!-- Formulario -->
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


      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { getData, postData } from '../services/apiClient.js';

const router = useRouter();

// Datos del formulario
const email = ref('');
const password = ref('');
const isLoading = ref(false);

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
      
      console.log(response.user);
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