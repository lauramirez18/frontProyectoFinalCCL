<template>
  <div class="admin-login-container">
    <div class="admin-login-card">
      <div class="admin-login-header">
        <img src="/logo2.png" alt="Admin Logo" class="admin-logo" />
        <h1>Panel de Administración</h1>
      </div>

      <form @submit.prevent="handleAdminLogin" class="admin-login-form">
        <div class="form-group">
          <label for="email">Correo electrónico</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="admin@example.com"
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
        </div>
        
        <button type="submit" class="btn-admin-login" :disabled="isLoading">
          {{ isLoading ? 'Cargando...' : 'Iniciar sesión' }}
        </button>
        
        <div v-if="errors.general" class="error-message general-error">
          {{ errors.general }}
        </div>
      </form>

      <div class="back-to-store">
        <router-link to="/">Volver a la tienda</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { postData } from '../services/apiClient.js';
import { useAuthStore } from '../store/store.js';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const isLoading = ref(false);

const errors = reactive({
  email: '',
  password: '',
  general: ''
});

const clearErrors = () => {
  errors.email = '';
  errors.password = '';
  errors.general = '';
};

const handleAdminLogin = async () => {
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
    const response = await postData('/usuarios/login', {
      email: email.value,
      password: password.value
    });

    console.log('Respuesta del servidor:', response);

    if (response.token) {
      const userData = response.usuario || response.user;
      
      // Verificar si es admin
      if (userData && (userData.rol === 'admin' || userData.role === 'admin')) {
        const authData = { 
          token: response.token,
          user: userData
        };
        localStorage.setItem('auth', JSON.stringify(authData));
        authStore.setToken(response.token);
        authStore.setUser(userData);
        router.push('/admin');
      } else {
        errors.general = 'Acceso denegado. Solo administradores pueden acceder.';
      }
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
</script>

<style scoped>
.admin-login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 20px;
}

.admin-login-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.admin-login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.admin-logo {
  width: 120px;
  margin-bottom: 1rem;
}

.admin-login-header h1 {
  color: #14213d;
  font-size: 1.5rem;
  margin: 0;
}

.admin-login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #14213d;
  font-weight: 500;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #14213d;
}

.btn-admin-login {
  background-color: #14213d;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-admin-login:hover {
  background-color: #0d1526;
}

.btn-admin-login:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #e53935;
  font-size: 0.875rem;
}

.general-error {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: rgba(229, 57, 53, 0.1);
  border-radius: 4px;
  text-align: center;
}

.back-to-store {
  margin-top: 1.5rem;
  text-align: center;
}

.back-to-store a {
  color: #14213d;
  text-decoration: none;
  font-weight: 500;
}

.back-to-store a:hover {
  text-decoration: underline;
}
</style> 