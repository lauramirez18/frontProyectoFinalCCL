<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue')" persistent>
    <q-card class="login-card-container">
      <div class="login-background-pattern"></div>

      <q-btn
        dense
        flat
        icon="close"
        @click="emit('update:modelValue', false)"
        class="close-btn"
      />

      <q-card-section class="login-content-wrapper">
        <div class="login-header">
          <h2 class="login-title">Iniciar Sesión</h2>
          <p class="welcome-text">Bienvenido de vuelta a tu tienda tecnológica</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">

          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <q-input
              outlined
              v-model="email"
              placeholder="tu@email.com"
              type="email"
              :error="!!errors.email"
              :error-message="errors.email"
              @update:model-value="clearErrors('email')"
              hide-bottom-space
            />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <q-input
              outlined
              v-model="password"
              :type="passwordFieldType"
              placeholder="••••••••"
              :error="!!errors.password"
              :error-message="errors.password"
              @update:model-value="clearErrors('password')"
              hide-bottom-space
            >
              <template v-slot:append>
                <q-icon
                  :name="passwordFieldType === 'password' ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer visibility-icon"
                  @click="togglePasswordVisibility"
                />
              </template>
            </q-input>
            <div class="forgot-password">
              <a href="#" @click.prevent="forgotPassword">¿Olvidaste tu contraseña?</a>
            </div>
          </div>

          <q-btn
            type="submit"
            class="btn-login"
            :disable="isLoading"
            unelevated
            color="primary"
            text-color="white"
            no-caps
          >
            <q-spinner v-if="isLoading" size="1.5em" class="q-mr-sm" />
            {{ isLoading ? 'Ingresando...' : 'Iniciar sesión' }}
          </q-btn>

          <div v-if="errors.general" class="error-message general-error">
            {{ errors.general }}
          </div>
        </form>

        <div class="signup-prompt">
          <span>¿No tienes cuenta?</span>
          <q-btn
            flat
            no-caps
            class="register-button"
            @click="navigateToRegister"
          >
            Crear cuenta ahora
          </q-btn>
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
import { useQuasar } from 'quasar';

const props = defineProps({
  modelValue: Boolean
});
const emit = defineEmits(['update:modelValue']);

const router = useRouter();
const authStore = useAuthStore();
const $q = useQuasar();

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errors = reactive({
  email: '',
  password: '',
  general: ''
});

const passwordFieldType = ref('password');

const togglePasswordVisibility = () => {
  passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password';
};

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

  if (!email.value) {
    errors.email = 'El correo electrónico es obligatorio.';
  }
  if (!password.value) {
    errors.password = 'La contraseña es obligatoria.';
  }
  if (errors.email || errors.password) {
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

      $q.notify({
        type: 'positive',
        message: '¡Inicio de sesión exitoso! Bienvenido.',
        position: 'top',
        timeout: 2000
      });

      emit('update:modelValue', false); // Cierra el diálogo

    } else {
      throw new Error('La respuesta del servidor no es válida.');
    }
  } catch (error) {
    console.error('Error en el proceso de inicio de sesión:', error);
    const errorData = error.response?.data;
    const errorMessage = errorData?.error || 'No se pudo conectar con el servidor.';

    if (errorMessage.toLowerCase().includes('contraseña') || errorMessage.toLowerCase().includes('password')) {
      errors.password = errorMessage;
    } else if (errorMessage.toLowerCase().includes('usuario') || errorMessage.toLowerCase().includes('correo') || errorMessage.toLowerCase().includes('email')) {
      errors.email = errorMessage;
    } else {
      errors.general = errorMessage;
    }

    $q.notify({
      type: 'negative',
      message: errors.general || errors.email || errors.password || 'Error al iniciar sesión. Intenta de nuevo.',
      position: 'top',
      timeout: 3000
    });

  } finally {
    isLoading.value = false;
  }
};

const forgotPassword = () => {
  $q.notify({
    type: 'info',
    message: 'Funcionalidad de "recuperar contraseña" pendiente de implementación.',
    position: 'top',
    timeout: 3000
  });
};

const navigateToRegister = () => {
  emit('update:modelValue', false); // Cierra el diálogo de login
  router.push('/Register'); // Navega a la ruta de registro
};
</script>

<style scoped>
/* Fuentes */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Roboto:wght@400;500;700&display=swap');

body {
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  
}

/* Animaciones */
@keyframes rotateInPerspective {
  0% {
    opacity: 0;
    transform: perspective(1000px) rotateX(-30deg) translateY(-50px);
  }
  100% {
    opacity: 1;
    transform: perspective(1000px) rotateX(0deg) translateY(0);
  }
}

@keyframes blurInZoom {
  0% {
    opacity: 0;
    filter: blur(10px);
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    filter: blur(0);
    transform: scale(1);
  }
}

/* Contenedor principal del diálogo (q-card) */
.login-card-container {
  padding: 30px 50px 20px;
  position: relative;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
  max-height: 100vh;
  width: 90%;
  max-width: 400px;
  margin: auto;
  overflow: hidden;
  animation: rotateInPerspective 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: top center;
}

/* Patrón de fondo abstracto/tecnológico */
.login-background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(6, 139, 255, 0.1), rgba(255, 255, 255, 0.1));
  background-size: cover;
  background-repeat: no-repeat;
  opacity: 0.8;
  pointer-events: none;
  z-index: -1;
}

/* Botón de cerrar */
.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  color: #a0a0a0;
  transition: color 0.3s ease, transform 0.3s ease;
  z-index: 10;
}
.close-btn:hover {
  color: #068FFF;
  transform: rotate(90deg);
}

.login-content-wrapper {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  animation: blurInZoom 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.login-header {
  text-align: center;
  margin-bottom: 10px;
}

.login-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 40px;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(45deg, #068FFF, #000);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: none;
  line-height: 1.2;
}

.welcome-text {
  color: #2c3e50;
  font-weight: 500;
  margin: 5px 0 0 0;
  font-size: 13px;
  opacity: 0.9;
}

.login-form {
  display: flex;
  flex-direction: column;
}

label {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 4px;
  transition: color 0.3s ease;
  cursor: pointer;
  user-select: none;
}

label:active {
  color: #068FFF;
}

.form-group:focus-within label {
  color: #068FFF;
}

/* Estilo del icono de visibilidad */
.visibility-icon {
  color: #068FFF;
  transition: color 0.3s ease;
}
.visibility-icon:hover {
  color: #0fbfef;
}

.forgot-password {
  text-align: right;
  margin-top: 5px;
  font-size: 0.95rem;
}

.forgot-password a {
  color: #068FFF;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease, text-decoration 0.3s ease;
}

.forgot-password a:hover {
  color: #0fbfef;
  text-decoration: underline;
}

.btn-login {
  width: 100%;
  padding: 14px 20px; /* Ligeramente reducido de 16px */
  border-radius: 8px;
   /* Ligeramente reducido de 1.2rem */
  font-weight: 700;
  margin-top: 15px; /* Reducido de 20px a 15px */
  background-color: #068FFF;
  color: white;
  box-shadow: 0 8px 25px rgba(19, 97, 165, 0.336);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
  animation: floatIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.7s both;
}

/* Mensajes de error */
.error-message {
  color: #e53935;
  font-size: 0.85rem;
  margin-top: 4px;
  min-height: 1.2em;
}

.general-error {
  text-align: center;
  margin-top: 1.5rem;
  padding: 0.8rem 1rem;
  background-color: rgba(229, 57, 53, 0.1);
  border: 1px solid rgba(229, 57, 53, 0.2);
  border-radius: 8px;
  font-weight: 500;
  color: #c62828;
}

/* Sección de "Crear cuenta" */
.signup-prompt {
  margin-top: 20px;
  color: #2c3e50;
  display: flex;
  justify-content: space-around;
  animation: floatIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s both;
}

.signup-prompt span {
  font-weight: 500;
  display: flex;
  justify-content: center;
  align-items: center;
}

.signup-prompt .register-button {
  padding: 7px 14px; /* Ligeramente reducido de 8px 15px */
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem; /* Ligeramente reducido de 0.95rem */
  border: 1px solid #068FFF;
  background-color: transparent;
  color: #068FFF;
  box-shadow: 0 2px 8px rgba(6, 139, 255, 0.2);
}

.signup-prompt .register-button:hover {
  background-color: #068FFF;
  color: white;
  box-shadow: 0 5px 15px rgba(6, 139, 255, 0.4);
}

/* Animación de salida */
.q-dialog--leaving .login-card-container {
  animation: rotateOutPerspective 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}



</style>