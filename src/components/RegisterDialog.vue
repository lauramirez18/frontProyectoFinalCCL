<template>
  <q-dialog
    v-model="dialogModel"
    maximized
    persistent
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card class="register-card-container">
      <div class="login-background-pattern"></div>

      <q-btn
        dense
        flat
        icon="close"
        @click="closeDialog"
        class="close-btn"
      />

      <div class="register-layout">
        <!-- Formulario de registro -->
        <q-card-section class="register-content-wrapper">
          <div>
            <h2 class="register-title">Crear Cuenta</h2>
            <p class="welcome-text">Únete y disfruta de todos los beneficios</p>
          </div>

          <form @submit.prevent="handleRegister" class="register-form">
            <div class="form-row">
              <div class="form-group">
                <q-input
                  outlined
                  v-model="firstName"
                  label="Nombre"
                  :error="!!errors.firstName"
                  :error-message="errors.firstName"
                  @update:model-value="clearErrors('firstName')"
                  hide-bottom-space
                  id="firstName"
                  required
                />
              </div>

              <div class="form-group">
                <q-input
                  outlined
                  v-model="lastName"
                  label="Apellidos"
                  :error="!!errors.lastName"
                  :error-message="errors.lastName"
                  @update:model-value="clearErrors('lastName')"
                  hide-bottom-space
                  id="lastName"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <q-input
                outlined
                v-model="email"
                label="Correo electrónico"
                type="email"
                :error="!!errors.email"
                :error-message="errors.email"
                @update:model-value="clearErrors('email')"
                hide-bottom-space
              />
            </div>

            <div class="form-group">
              <q-input
                outlined
                v-model="password"
                label="Contraseña"
                :type="passwordFieldType"
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
              <div class="password-hint">
                La contraseña debe contener al menos 8 caracteres, incluyendo una letra mayúscula y un número
              </div>
            </div>

            <div class="form-group">
              <q-input
                outlined
                v-model="confirmPassword"
                label="Confirmar contraseña"
                :type="confirmPasswordFieldType"
                :error="!!errors.confirmPassword"
                :error-message="errors.confirmPassword"
                @update:model-value="clearErrors('confirmPassword')"
                hide-bottom-space
              >
                <template v-slot:append>
                  <q-icon
                    :name="confirmPasswordFieldType === 'password' ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer visibility-icon"
                    @click="toggleConfirmPasswordVisibility"
                  />
                </template>
              </q-input>
            </div>

            <div class="form-checks">
              <q-checkbox
                v-model="termsAccepted"
                label="He leído y acepto los términos y condiciones"
                :error="!!errors.terms"
                @update:model-value="clearErrors('terms')"
              />
              
              <q-checkbox
                v-model="newsletterSubscribed"
                label="Quiero recibir ofertas y novedades por correo electrónico"
              />
            </div>

            <q-btn
              type="submit"
              class="btn-register"
              :disable="isLoading"
              unelevated
              color="primary"
              text-color="white"
              no-caps
            >
              <q-spinner v-if="isLoading" size="1.5em" class="q-mr-sm" />
              {{ isLoading ? 'Registrando...' : 'Crear cuenta' }}
            </q-btn>

            <div class="divider">
              <span>O regístrate con</span>
            </div>

            <q-btn
              class="btn-social google"
              @click="signupWithGoogle"
              flat
              no-caps
            >
              <q-icon name="img:src/assets/google.svg" class="q-mr-sm" />
              Continuar con Google
            </q-btn>

            <div v-if="errors.general" class="error-message general-error">
              {{ errors.general }}
            </div>
          </form>

          <div class="login-prompt">
            <span>¿Ya tienes cuenta?</span>
            <q-btn
              flat
              no-caps
              class="login-button"
              @click="switchToLogin"
            >
              Iniciar sesión
            </q-btn>
          </div>
        </q-card-section>

        <!-- Sección de beneficios -->
        <q-card-section class="benefits-wrapper">
          <h2 class="benefits-title">¡Únete a nuestra comunidad!</h2>
          <p class="benefits-subtitle">Disfruta de estos beneficios exclusivos</p>

          <div class="benefits-list">
            <div class="benefit-item">
              <div class="benefit-icon blue">
                <q-icon name="attach_money" />
              </div>
              <span>Descuentos exclusivos para miembros</span>
            </div>

            <div class="benefit-item">
              <div class="benefit-icon green">
                <q-icon name="notifications" />
              </div>
              <span>Notificaciones sobre nuevos productos</span>
            </div>

            <div class="benefit-item">
              <div class="benefit-icon purple">
                <q-icon name="local_shipping" />
              </div>
              <span>Envíos rápidos y seguimiento de pedidos</span>
            </div>

            <div class="benefit-item">
              <div class="benefit-icon yellow">
                <q-icon name="favorite" />
              </div>
              <span>Lista de deseos y compras con un clic</span>
            </div>
          </div>

          <div class="testimonial">
            <p class="testimonial-text">"Desde que me registré, he encontrado ofertas increíbles y el proceso de compra es muy sencillo."</p>
            <div class="testimonial-author">
              <q-avatar size="32px" color="primary" text-color="white">M</q-avatar>
              <span>María G., Cliente desde 2023</span>
            </div>
          </div>
        </q-card-section>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useQuasar } from 'quasar';
import { postData } from '../services/apiClient.js';
import { useAuthStore } from '../store/store.js';
import { useRouter } from 'vue-router';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'close', 'switch-to-login']);

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const closeDialog = () => {
  emit('update:modelValue', false);
  emit('close');
};

function switchToLogin() {
  emit('update:modelValue', false);
  emit('switch-to-login');
}

const $q = useQuasar();
const authStore = useAuthStore();
const router = useRouter();

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const name = ref('');
const termsAccepted = ref(false);
const newsletterSubscribed = ref(true);
const isLoading = ref(false);
const passwordFieldType = ref('password');
const confirmPasswordFieldType = ref('password');

const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: '',
  general: ''
});

const togglePasswordVisibility = () => {
  passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password';
};

const toggleConfirmPasswordVisibility = () => {
  confirmPasswordFieldType.value = confirmPasswordFieldType.value === 'password' ? 'text' : 'password';
};

const clearErrors = (field = null) => {
  if (field && errors[field]) {
    errors[field] = '';
  } else if (!field) {
    Object.keys(errors).forEach(key => {
      errors[key] = '';
    });
  }
};

// Form validation
const validateForm = () => {
  if (!firstName.value || !lastName.value || !email.value || !password.value || !confirmPassword.value) {
    $q.notify({
      type: 'warning',
      message: 'Por favor completa todos los campos obligatorios',
      position: 'top',
      timeout: 3000,
      color: 'warning'
    });
    return false;
  }
  
  if (password.value.length < 8) {
    $q.notify({
      type: 'warning',
      message: 'La contraseña debe tener al menos 8 caracteres',
      position: 'top',
      timeout: 3000,
      color: 'warning'
    });
    return false;
  }
  
  if (!/[A-Z]/.test(password.value)) {
    $q.notify({
      type: 'warning',
      message: 'La contraseña debe contener al menos una letra mayúscula',
      position: 'top',
      timeout: 3000,
      color: 'warning'
    });
    return false;
  }
  
  if (!/\d/.test(password.value)) {
    $q.notify({
      type: 'warning',
      message: 'La contraseña debe contener al menos un número',
      position: 'top',
      timeout: 3000,
      color: 'warning'
    });
    return false;
  }
  
  if (password.value !== confirmPassword.value) {
    $q.notify({
      type: 'warning',
      message: 'Las contraseñas no coinciden',
      position: 'top',
      timeout: 3000,
      color: 'warning'
    });
    return false;
  }
  
  if (!termsAccepted.value) {
    $q.notify({
      type: 'warning',
      message: 'Debes aceptar los términos y condiciones',
      position: 'top',
      timeout: 3000,
      color: 'warning'
    });
    return false;
  }
  
  return true;
};

const handleRegister = async () => {
  if (!validateForm()) return;
  name.value = firstName.value + " " + lastName.value;

  isLoading.value = true;

  const signupData = {
    name: name.value,
    email: email.value,
    password: password.value
  };

  try {
    // Intento de registro
    await postData('usuarios/registro', signupData);
    console.log('Usuario registrado con éxito');

    try {
      // Intento de login automático
      const loginResponse = await postData('usuarios/login', {
        email: signupData.email,
        password: signupData.password
      });

      // Almacenar token y datos de usuario
      localStorage.setItem('token', loginResponse.token);
      
      // Almacenar en Pinia
      authStore.setToken(loginResponse.token);
      authStore.setUser(loginResponse.user);

      // Notificar éxito
      $q.notify({
        type: 'positive',
        message: '¡Registro exitoso! Bienvenido.',
        position: 'top',
        timeout: 2000,
        color: 'positive'
      });

      // Limpiar el formulario
      firstName.value = '';
      lastName.value = '';
      email.value = '';
      password.value = '';
      confirmPassword.value = '';
      termsAccepted.value = false;
      newsletterSubscribed.value = true;

      // Cerrar el diálogo
      emit('close');
      dialogModel.value = false;

      // Redirigir al home
      router.push('/');

    } catch (loginError) {
      console.error('Error en el login automático:', loginError);
      $q.notify({
        type: 'warning',
        message: 'Registro exitoso. Por favor inicia sesión.',
        position: 'top',
        timeout: 3000,
        color: 'warning'
      });
      emit('switch-to-login');
    }

  } catch (error) {
    console.error('Error en el registro:', error);
    let errorMessage = 'Ocurrió un error durante el registro. Por favor intenta de nuevo.';

    if (error.response?.data?.mensaje) {
      errorMessage = error.response.data.mensaje;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 4000,
      color: 'negative',
      actions: [
        { label: 'Cerrar', color: 'white' }
      ]
    });
  } finally {
    isLoading.value = false;
  }
};

const signupWithGoogle = () => {
  $q.notify({
    type: 'info',
    message: 'Registro con Google pendiente de implementación',
    position: 'top',
    timeout: 2000
  });
};
</script>

<style scoped>
.register-card-container {
  min-height: 100vh;
  width: 100%;
  margin: 0;
  background: linear-gradient(to bottom right, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.85));
  position: relative;
  animation: fadeInScale 0.4s ease-out;
}

@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Fondo animado mejorado */
.login-background-pattern {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: 
    radial-gradient(circle at 20% 30%, rgba(6, 143, 255, 0.15) 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(6, 143, 255, 0.15) 0%, transparent 40%);
  z-index: 0;
  pointer-events: none;
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.register-layout {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 40px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  min-height: 100vh;
  padding: 40px;
}

.register-content-wrapper {
  flex: 1;
  max-width: 60%;
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideInRight 0.6s ease-out;
}

.register-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-align: center;
  background: linear-gradient(45deg, #fff, #e6e6e6);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: slideDown 0.6s ease-out;
}

.welcome-text {
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  font-size: 1.1rem;
  margin: 0;
  animation: slideDown 0.6s ease-out 0.1s backwards;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.form-row {
  display: flex;
  gap: 20px;
  animation: slideUp 0.6s ease-out;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: slideUp 0.6s ease-out;
}

/* Estilos mejorados para inputs */
:deep(.q-field) {
  height: 60px;
}

:deep(.q-field__control) {
  height: 60px !important;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

:deep(.q-field__control:hover) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

:deep(.q-field--focused .q-field__control) {
  background: rgba(255, 255, 255, 0.1);
  border-color: #068FFF !important;
}

:deep(.q-field__label) {
  color: rgba(255, 255, 255, 0.9) !important;
  font-size: 1rem;
  font-weight: 500;
  top: 18px;
  left: 12px;
}

:deep(.q-field--float .q-field__label) {
  transform: translateY(-30%) scale(0.85);
}

:deep(.q-field__native) {
  color: white !important;
  font-size: 1rem;
  padding: 0 12px;
}

:deep(.q-field__append) {
  height: 100%;
  min-width: 32px;
  padding: 0 12px;
  color: rgba(255, 255, 255, 0.7);
}

.password-hint {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-top: 4px;
  padding-left: 12px;
}

/* Checkboxes mejorados */
.form-checks {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 10px 0;
  animation: slideUp 0.6s ease-out 0.2s backwards;
}

:deep(.q-checkbox__label) {
  color: rgba(255, 255, 255, 0.9) !important;
  font-size: 0.95rem;
  line-height: 1.4;
}

:deep(.q-checkbox__inner) {
  color: white;
}

:deep(.q-checkbox__bg) {
  border-color: rgba(255, 255, 255, 0.3);
}

:deep(.q-checkbox__svg) {
  color: #068FFF !important;
}

/* Botones mejorados */
.btn-register {
  height: 56px;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(45deg, #068FFF, #0077e6) !important;
  border: none;
  border-radius: 12px;
  margin-top: 20px;
  animation: fadeInScale 0.6s ease-out 0.3s backwards;
}

.btn-register:hover {
  background: linear-gradient(45deg, #0077e6, #0066cc) !important;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  margin: 20px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.divider span {
  padding: 0 10px;
  font-size: 0.95rem;
}

.btn-social {
  height: 56px;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 1rem;
  color: white !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  animation: fadeInScale 0.6s ease-out 0.4s backwards;
}

.btn-social:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.btn-social img {
  width: 24px;
  height: 24px;
}

/* Sección de beneficios */
.benefits-wrapper {
  flex: 1;
  max-width: 40%;
  padding: 40px;
  background: rgba(6, 143, 255, 0.03);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(6, 143, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 30px;
  animation: slideInLeft 0.6s ease-out;
}

.benefits-title {
  color: white;
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.benefits-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin: 0;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  transition: all 0.3s ease;
  animation: fadeInSlide 0.6s ease-out backwards;
}

.benefit-item:hover {
  transform: translateX(10px);
  background: rgba(255, 255, 255, 0.05);
}

.benefit-item:nth-child(1) {
  animation-delay: 0.2s;
}

.benefit-item:nth-child(2) {
  animation-delay: 0.3s;
}

.benefit-item:nth-child(3) {
  animation-delay: 0.4s;
}

.benefit-item:nth-child(4) {
  animation-delay: 0.5s;
}

.benefit-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.5rem;
}

.benefit-icon.blue { 
  background: rgba(6, 143, 255, 0.1);
  color: #068FFF;
}

.benefit-icon.green { 
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.benefit-icon.purple { 
  background: rgba(156, 39, 176, 0.1);
  color: #9C27B0;
}

.benefit-icon.yellow { 
  background: rgba(255, 193, 7, 0.1);
  color: #FFC107;
}

.benefit-item span {
  color: white;
  font-size: 1rem;
  line-height: 1.4;
}

.testimonial {
  margin-top: auto;
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.testimonial-text {
  color: white;
  font-size: 1rem;
  line-height: 1.6;
  font-style: italic;
  margin: 0 0 16px 0;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.testimonial-author span {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
}

/* Botón de cerrar */
.close-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: white;
  z-index: 10;
  transition: all 0.3s ease;
  animation: rotateIn 0.6s ease-out;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

/* Estilos para mensajes de error */
.error-message {
  color: #ff4d4d !important;
  font-size: 0.9rem;
  margin-top: 4px;
  min-height: 1.2em;
  background: rgba(255, 77, 77, 0.15);
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 77, 77, 0.3);
  font-weight: 500;
  display: block;
  width: 100%;
}

.general-error {
  text-align: center;
  margin: 15px 0;
  padding: 12px 16px;
  background: rgba(255, 77, 77, 0.15);
  border: 1px solid rgba(255, 77, 77, 0.3);
  border-radius: 8px;
  font-weight: 500;
  color: #ff4d4d !important;
  width: 100%;
  display: block;
}

/* Notificaciones mejoradas */
:deep(.q-notification) {
  margin: 10px;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 1rem;
  backdrop-filter: blur(10px);
  color: white !important;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

:deep(.q-notification--standard) {
  background: rgba(33, 33, 33, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.q-notification--negative) {
  background: rgba(244, 67, 54, 0.95);
  border: 1px solid rgba(244, 67, 54, 0.3);
}

:deep(.q-notification--positive) {
  background: rgba(76, 175, 80, 0.95);
  border: 1px solid rgba(76, 175, 80, 0.3);
}

/* Estilos específicos para errores en campos */
:deep(.q-field--error) {
  .q-field__bottom {
    padding: 4px 12px;
    background: rgba(255, 77, 77, 0.15);
    border-radius: 0 0 8px 8px;
    border: 1px solid rgba(255, 77, 77, 0.3);
    border-top: none;
    color: #ff4d4d !important;
    font-weight: 500;
  }
}

/* Responsive */
@media (max-width: 1200px) {
  .register-layout {
    padding: 30px;
    gap: 30px;
  }

  .register-content-wrapper,
  .benefits-wrapper {
    padding: 30px;
  }
}

@media (max-width: 900px) {
  .register-layout {
    flex-direction: column;
    padding: 20px;
  }

  .register-content-wrapper,
  .benefits-wrapper {
    max-width: 100%;
    padding: 25px;
  }

  .register-title {
    font-size: 2rem;
  }

  .benefits-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 600px) {
  .register-layout {
    padding: 15px;
  }

  .form-row {
    flex-direction: column;
    gap: 15px;
  }

  .register-content-wrapper,
  .benefits-wrapper {
    padding: 20px;
  }

  .register-title {
    font-size: 1.75rem;
  }

  .benefits-title {
    font-size: 1.5rem;
  }

  .benefit-item {
    padding: 15px;
  }
}

.login-prompt {
  margin-top: 20px;
  padding: 15px;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.login-prompt span {
  color: rgba(255, 255, 255, 0.9) !important;
  font-size: 0.95rem;
}

.login-button {
  color: #068FFF !important;
  font-weight: 600;
  font-size: 0.95rem;
  margin-left: 8px;
  padding: 4px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.login-button:hover {
  background: rgba(6, 143, 255, 0.1);
}

@keyframes slideInRight {
  0% {
    opacity: 0;
    transform: translateX(50px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInLeft {
  0% {
    opacity: 0;
    transform: translateX(-50px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideDown {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rotateIn {
  0% {
    opacity: 0;
    transform: rotate(-180deg);
  }
  100% {
    opacity: 1;
    transform: rotate(0);
  }
}

@keyframes fadeInSlide {
  0% {
    opacity: 0;
    transform: translateX(-30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}
</style> 