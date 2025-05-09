<template>
<div>
  <div class="signup-container">
    <div class="signup-card">
      <h1 class="signup-title">Crear Cuenta</h1>
      <p class="welcome-text">Únete y disfruta de todos los beneficios</p>
      
      <form @submit.prevent="handleSignup">
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">Nombre</label>
            <input 
              type="text" 
              id="firstName" 
              v-model="firstName" 
              placeholder=""
              required
            />
          </div>
          
          <div class="form-group">
            <label for="lastName">Apellidos</label>
            <input 
              type="text" 
              id="lastName" 
              v-model="lastName" 
              placeholder=""
              required
            />
          </div>
        </div>
        
        <div class="form-group">
          <label for="email">Correo electrónico</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder=""
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input 
            type="password" 
            id="password" 
            v-model="password"
            required
          />
          <div class="password-hint">
            <p>La contraseña debe contener al menos 8 caracteres, incluyendo una letra mayúscula y un número</p>
          </div>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">Confirmar contraseña</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="confirmPassword"
            required
          />
        </div>
        
        <div class="form-check">
          <input type="checkbox" id="terms" v-model="termsAccepted" required />
          <label for="terms">He leído y acepto los <a href="#">términos y condiciones</a></label>
        </div>
        
        <div class="form-check">
          <input type="checkbox" id="newsletter" v-model="newsletterSubscribed" />
          <label for="newsletter">Quiero recibir ofertas y novedades por correo electrónico</label>
        </div>
        
        <button type="submit" class="btn-signup">Crear cuenta</button>
      </form>
      
      <div class="divider">
        <span>O regístrate con</span>
      </div>
      
      <div class="social-signup">
        <button class="btn-social google" @click="signupWithGoogle">
          <img src="../assets/google.svg" alt="Google" /> Continuar con Google
        </button>
        
        
      </div>
      
      <div class="login-prompt">
        <span>¿Ya tienes cuenta?</span>
         <router-link to="/Login" ><a href="#" >Iniciar sesión</a></router-link>
      </div>
    </div>
    
    <div class="benefits-card">
      <img src="" alt="Welcome" class="welcome-icon" />
      
      <h2 class="benefits-title">¡Únete a nuestra comunidad!</h2>
      
      <p class="benefits-subtitle">Disfruta de estos beneficios exclusivos</p>
      
      <div class="benefits-list">
        <div class="benefit-item">
          <div class="benefit-icon blue">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span>Descuentos exclusivos para miembros</span>
        </div>
        
        <div class="benefit-item">
          <div class="benefit-icon green">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <span>Notificaciones sobre nuevos productos</span>
        </div>
        
        <div class="benefit-item">
          <div class="benefit-icon purple">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span>Envíos rápidos y seguimiento de pedidos</span>
        </div>
        
        <div class="benefit-item">
          <div class="benefit-icon yellow">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span>Lista de deseos y compras con un clic</span>
        </div>
      </div>
      
      <div class="testimonial">
        <p class="testimonial-text">"Desde que me registré, he encontrado ofertas increíbles y el proceso de compra es muy sencillo."</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar"></div>
          <span>María G., Cliente desde 2023</span>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Success Modal -->
  <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
    <div class="modal-content success" @click.stop>
      <div class="success-icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2>¡Registro exitoso!</h2>
      <p>Tu cuenta ha sido creada correctamente. Ahora puedes disfrutar de todos los beneficios.</p>
      <button class="btn-primary" @click="navigateToLogin">Iniciar sesión</button>
      <button class="btn-close" @click="closeSuccessModal">&times;</button>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getData, postData } from '../services/apiClient.js';
import { useRouter } from 'vue-router';
const router = useRouter();
// Signup form state
const firstName = ref('');
const lastName = ref('');
const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const termsAccepted = ref(false);
const newsletterSubscribed = ref(true);

// Success modal state
const showSuccessModal = ref(false);

// Form validation
const validateForm = () => {
  if (!firstName.value || !lastName.value || !email.value || !password.value || !confirmPassword.value) {
    alert('Por favor completa todos los campos obligatorios');
    return false;
  }
  
  if (password.value.length < 8) {
    alert('La contraseña debe tener al menos 8 caracteres');
    return false;
  }
  
  if (!/[A-Z]/.test(password.value)) {
    alert('La contraseña debe contener al menos una letra mayúscula');
    return false;
  }
  
  if (!/\d/.test(password.value)) {
    alert('La contraseña debe contener al menos un número');
    return false;
  }
  
  if (password.value !== confirmPassword.value) {
    alert('Las contraseñas no coinciden');
    return false;
  }
  
  if (!termsAccepted.value) {
    alert('Debes aceptar los términos y condiciones');
    return false;
  }
  
  return true;
};

// Signup handler
const handleSignup = async () => {
  if (!validateForm()) return;

  name.value = firstName.value + " " + lastName.value;

  const signupData = {
    name: name.value,
    email: email.value,
    password: password.value
  };

  try {
    // Registrar al usuario
    await postData('usuarios/registro', signupData);
    console.log('Usuario registrado con éxito');

    // Iniciar sesión inmediatamente
    const loginResponse = await postData('usuarios/login', {
      email: signupData.email,
      password: signupData.password
    });

    // Guardar el token en localStorage
    localStorage.setItem('token', loginResponse.token);

    // Redirigir al home
    router.push('/');

  } catch (error) {
    console.error('Error en el proceso de registro o login:', error);
    alert('Ocurrió un error. Intenta de nuevo.');
  }
};

// Social signup methods
const signupWithGoogle = () => {
  console.log('Registrando con Google');
  // Implement Google OAuth signup
  
  // Simulate successful signup
  setTimeout(() => {
    showSuccessModal.value = true;
  }, 1000);
};



// Navigation methods
const navigateToLogin = () => {
  console.log('Navegando a la página de inicio de sesión');
 router.push('/login');
};

// Modal methods
const closeSuccessModal = () => {
  showSuccessModal.value = false;
};
</script>

<style scoped>
@import url('../styles/register.css');
</style>