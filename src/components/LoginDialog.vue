<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue')" persistent>
    <q-card class="q-pa-md" style="min-width: 400px; padding: 30px; position: relative;">
      
      <q-btn
        dense
        flat
        icon="close"
        @click="emit('update:modelValue', false)"
        class="absolute-top-right"
        style="top: 10px; right: 10px; z-index: 1;"
      />

      <q-card-section>
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
              @input="clearErrors('email')"
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
              @input="clearErrors('password')"
            />
            <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
            <div class="forgot-password">
              <a href="#" @click.prevent="forgotPassword">¿Olvidaste tu contraseña?</a>
            </div>
          </div>

          <button type="submit" class="btn-login" :disabled="isLoading">
            <q-spinner v-if="isLoading" size="1.2em" class="q-mr-sm" />
            {{ isLoading ? 'Ingresando...' : 'Iniciar sesión' }}
          </button>

          <div v-if="errors.general" class="error-message general-error">
            {{ errors.general }}
          </div>
        </form>

        <div class="signup-prompt">
          <span>¿No tienes cuenta?</span>
          <router-link to="/Register" @click="emit('update:modelValue', false)">Crear cuenta</router-link>
        </div>

      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { postData } from '../services/apiClient.js';
import { useAuthStore } from '../store/store.js';


const props = defineProps({
  modelValue: Boolean
});
const emit = defineEmits(['update:modelValue']);


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


const clearErrors = (field = null) => {
  if (field && errors[field]) {
    errors[field] = '';
  } else if (!field) {
    errors.email = '';
    errors.password = '';
    errors.general = '';
  }
};


const handleLogin = async () => {
  clearErrors(); 
  
 
  if (!email.value || !password.value) {
    if (!email.value) errors.email = 'El correo electrónico es obligatorio.';
    if (!password.value) errors.password = 'La contraseña es obligatoria.';
    return;
  }

  isLoading.value = true;
  try {
  
    const response = await postData('usuarios/login', {
      email: email.value,
      password: password.value
    });


    if (response.token && response.user) {
     
      authStore.setToken(response.token);
      authStore.setUser(response.user);

      console.log('✅ Login exitoso. Estado de Pinia actualizado.');

      
      emit('update:modelValue', false);
      
      

    } else {
     
      throw new Error('La respuesta del servidor no es válida.');
    }
  } catch (error) {
    console.error('Error en el proceso de inicio de sesión:', error);
    const errorData = error.response?.data;
    const errorMessage = errorData?.error || 'No se pudo conectar con el servidor.';
    
    
    if (errorMessage.toLowerCase().includes('contraseña')) {
      errors.password = errorMessage;
    } else if (errorMessage.toLowerCase().includes('usuario') || errorMessage.toLowerCase().includes('correo')) {
      errors.email = errorMessage;
    } else {
      errors.general = errorMessage;
    }
  } finally {
    console.log('Finalizando carga...');
    isLoading.value = false;
  }
};


const forgotPassword = () => {
  alert('Funcionalidad de "recuperar contraseña" pendiente de implementación.');

};
</script>

<style scoped>
@import url('../styles/login.css');

.error-message {
  color: #e53935;
  font-size: 0.85rem;
  margin-top: 4px;
  min-height: 1.2em;
}

.general-error {
  text-align: center;
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: rgba(229, 57, 53, 0.1);
  border: 1px solid rgba(229, 57, 53, 0.2);
  border-radius: 4px;
}
</style>