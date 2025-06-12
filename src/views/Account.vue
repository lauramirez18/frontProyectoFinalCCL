<template>
  <q-page class="account-page q-pa-md">
    <div class="account-container">
      <div class="profile-header">
        <div class="profile-photo-container">
          <q-avatar size="180px" class="profile-photo tech-gradient-border">
            <img v-if="photoUrl" :src="photoUrl" :alt="userData.name || 'Foto de perfil'">
            <q-icon v-else name="person" size="100px" color="primary-blue" />
          </q-avatar>
          <div class="photo-upload-overlay">
            <q-btn
              round
              flat
              color="white"
              icon="photo_camera"
              size="md"
              @click="triggerFileUpload"
            >
              <q-tooltip>Cambiar foto de perfil</q-tooltip>
            </q-btn>
          </div>
          <input
            type="file"
            ref="fileInput"
            accept="image/*"
            style="display: none"
            @change="onFileSelected"
          >
        </div>
        <h1 class="profile-name">{{ userData.name || 'Usuario' }}</h1>
        <p class="profile-email">{{ userData.email }}</p>
      </div>

      <q-card class="account-card personal-data-card">
        <q-card-section class="card-header">
          <div class="text-h5 card-title">Datos Personales</div>
          <q-icon name="account_circle" class="card-icon" />
        </q-card-section>
        <q-separator inset />
        <q-card-section class="q-pt-md">
          <q-form @submit="onSubmit" class="q-gutter-lg">
            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.firstName"
                  label="Nombre"
                  :rules="[val => !!val || 'El nombre es requerido']"
                  outlined
                  dense
                  color="primary"
                  bg-color="input-bg"
                  class="tech-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="person_outline" color="grey-7" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.lastName"
                  label="Apellidos"
                  :rules="[val => !!val || 'Los apellidos son requeridos']"
                  outlined
                  dense
                  color="primary"
                  bg-color="input-bg"
                  class="tech-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="person_outline" color="grey-7" />
                  </template>
                </q-input>
              </div>
            </div>

            <q-input
              v-model="formData.email"
              type="email"
              label="Correo electrónico"
              :rules="[
                val => !!val || 'El correo es requerido',
                val => /^[^@]+@[^@]+\.[^@]+$/.test(val) || 'Correo inválido'
              ]"
              outlined
              dense
              color="primary"
              bg-color="input-bg"
              class="tech-input"
            >
              <template v-slot:prepend>
                <q-icon name="mail_outline" color="grey-7" />
              </template>
            </q-input>

            <q-input
              v-model="formData.phone"
              label="Teléfono"
              mask="(###) ###-####"
              outlined
              dense
              color="primary"
              bg-color="input-bg"
              class="tech-input"
            >
              <template v-slot:prepend>
                <q-icon name="phone_android" color="grey-7" />
              </template>
            </q-input>

            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.address"
                  label="Dirección"
                  outlined
                  dense
                  color="primary"
                  bg-color="input-bg"
                  class="tech-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="location_on" color="grey-7" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.city"
                  label="Ciudad"
                  outlined
                  dense
                  color="primary"
                  bg-color="input-bg"
                  class="tech-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="apartment" color="grey-7" />
                  </template>
                </q-input>
              </div>
            </div>

            <div class="preferences-section q-mt-xl">
              <div class="text-h5 card-title q-mb-md">Preferencias</div>
              <q-separator inset class="q-mb-lg" />
              <div class="row q-col-gutter-lg">
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="formData.language"
                    :options="languageOptions"
                    label="Idioma"
                    outlined
                    dense
                    color="primary"
                    bg-color="input-bg"
                    class="tech-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="language" color="grey-7" />
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="formData.theme"
                    :options="themeOptions"
                    label="Tema"
                    outlined
                    dense
                    color="primary"
                    bg-color="input-bg"
                    class="tech-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="palette" color="grey-7" />
                    </template>
                  </q-select>
                </div>
              </div>

              <q-list class="q-mt-md tech-list">
                <q-item tag="label" class="toggle-item">
                  <q-item-section avatar>
                    <q-icon name="notifications" color="accent" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="item-title">Recibir notificaciones</q-item-label>
                    <q-item-label caption class="item-caption">
                      Mantente informado sobre ofertas y novedades
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="formData.notifications" color="primary" keep-color />
                  </q-item-section>
                </q-item>

                <q-item tag="label" class="toggle-item">
                  <q-item-section avatar>
                    <q-icon name="email" color="accent" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="item-title">Newsletter</q-item-label>
                    <q-item-label caption class="item-caption">
                      Recibe nuestro boletín mensual
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="formData.newsletter" color="primary" keep-color />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <div class="row justify-end q-mt-xl">
              <q-btn
                label="Cancelar"
                type="reset"
                flat
                class="q-mr-md action-btn cancel-btn"
                @click="resetForm"
              />
              <q-btn
                label="Guardar cambios"
                type="submit"
                color="primary"
                :loading="loading"
                class="action-btn save-btn"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <q-card class="account-card security-card q-mt-lg">
        <q-card-section class="card-header">
          <div class="text-h5 card-title">Seguridad</div>
          <q-icon name="security" class="card-icon" />
        </q-card-section>
        <q-separator inset />
        <q-card-section>
          <q-list class="tech-list">
            <q-item clickable @click="showChangePasswordDialog = true" class="security-item">
              <q-item-section avatar>
                <q-icon name="lock_outline" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="item-title">Cambiar contraseña</q-item-label>
                <q-item-label caption class="item-caption">
                  Actualiza tu contraseña para mayor seguridad
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>

            <q-item clickable @click="showDeleteAccountDialog = true" class="security-item delete-item">
              <q-item-section avatar>
                <q-icon name="delete_outline" color="negative" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="item-title text-negative">Eliminar cuenta</q-item-label>
                <q-item-label caption class="item-caption">
                  Eliminar permanentemente tu cuenta y todos tus datos
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="showChangePasswordDialog" class="tech-dialog">
      <q-card class="dialog-card">
        <q-card-section class="dialog-header">
          <div class="text-h5">Cambiar contraseña</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pt-md">
          <q-form @submit="onChangePassword" class="q-gutter-md">
            <q-input
              v-model="passwordForm.current"
              type="password"
              label="Contraseña actual"
              outlined
              dense
              color="primary"
              bg-color="input-bg"
              class="tech-input"
              :rules="[val => !!val || 'Este campo es requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="lock" color="grey-7" />
              </template>
            </q-input>

            <q-input
              v-model="passwordForm.new"
              type="password"
              label="Nueva contraseña"
              outlined
              dense
              color="primary"
              bg-color="input-bg"
              class="tech-input"
              :rules="[
                val => !!val || 'Este campo es requerido',
                val => val.length >= 8 || 'Mínimo 8 caracteres'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="vpn_key" color="grey-7" />
              </template>
            </q-input>

            <q-input
              v-model="passwordForm.confirm"
              type="password"
              label="Confirmar nueva contraseña"
              outlined
              dense
              color="primary"
              bg-color="input-bg"
              class="tech-input"
              :rules="[
                val => !!val || 'Este campo es requerido',
                val => val === passwordForm.new || 'Las contraseñas no coinciden'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="check_circle_outline" color="grey-7" />
              </template>
            </q-input>

            <div class="row justify-end q-mt-lg">
              <q-btn
                label="Cancelar"
                flat
                v-close-popup
                class="q-mr-md action-btn cancel-btn"
              />
              <q-btn
                label="Cambiar contraseña"
                type="submit"
                color="primary"
                :loading="loading"
                class="action-btn save-btn"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDeleteAccountDialog" class="tech-dialog">
      <q-card class="dialog-card">
        <q-card-section class="dialog-header">
          <q-avatar icon="warning" color="negative" text-color="white" class="q-mr-sm" />
          <div class="text-h5 text-negative">Eliminar cuenta</div>
          <q-btn icon="close" flat round dense v-close-popup class="q-ml-auto" />
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pt-md">
          <p class="dialog-message">¿Estás absolutamente seguro de que deseas eliminar tu cuenta? Esta acción **no se puede deshacer** y se perderán todos tus datos asociados.</p>
          <q-input
            v-model="deleteConfirmation"
            label="Para confirmar, escribe la palabra 'ELIMINAR'"
            outlined
            dense
            color="negative"
            bg-color="input-bg-negative"
            class="tech-input q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" v-close-popup class="action-btn cancel-btn" />
          <q-btn
            label="Eliminar cuenta"
            color="negative"
            :disable="deleteConfirmation !== 'ELIMINAR'"
            @click="deleteAccount"
            class="action-btn delete-confirm-btn"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../store/store';
import { postData, putData, getData } from '../services/apiClient';
import { useRouter } from 'vue-router'; // Importar useRouter

const $q = useQuasar();
const authStore = useAuthStore();
const router = useRouter(); // Inicializar router
const fileInput = ref(null);
const loading = ref(false);
const photoUrl = ref(null);
const showChangePasswordDialog = ref(false);
const showDeleteAccountDialog = ref(false);
const deleteConfirmation = ref('');

// Datos del usuario (para mostrar en el encabezado)
const userData = reactive({
  name: '',
  email: ''
});

// Formulario principal (para editar)
const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  language: 'es',
  theme: 'light',
  notifications: true,
  newsletter: true
});

// Formulario de contraseña
const passwordForm = reactive({
  current: '',
  new: '',
  confirm: ''
});

// Opciones para selects
const languageOptions = [
  { label: 'Español', value: 'es' },
  { label: 'English', value: 'en' }
];

const themeOptions = [
  { label: 'Claro', value: 'light' },
  { label: 'Oscuro', value: 'dark' }
];

// Cargar datos del usuario
onMounted(async () => {
  try {
    // Obtener datos del usuario desde el backend
    const response = await getData('usuarios/profile');
    const user = response;

    if (user) {
      // Actualizar datos del usuario para el encabezado
      userData.name = user.name || 'Usuario';
      userData.email = user.email || 'correo@example.com';

      // Separar nombre completo en nombre y apellido para el formulario
      const [firstName = '', ...lastNameParts] = user.name ? user.name.split(' ') : ['', ''];
      formData.firstName = firstName;
      formData.lastName = lastNameParts.join(' ');
      formData.email = user.email || '';
      formData.phone = user.phone || '';
      formData.address = user.address || '';
      formData.city = user.city || '';

      // Cargar preferencias
      if (user.preferences) {
        formData.language = user.preferences.language || 'es';
        formData.theme = user.preferences.theme || 'light';
        formData.notifications = user.preferences.notifications ?? true;
        formData.newsletter = user.preferences.newsletter ?? true;
      }

      // Si tiene una foto de perfil guardada
      if (user.photoUrl) {
        photoUrl.value = user.photoUrl;
      }
    }
  } catch (error) {
    console.error('Error al cargar datos del usuario:', error);
    showError('Error al cargar los datos del usuario. Por favor, intenta de nuevo.');
    // Podrías redirigir al login si el error es de autenticación
    if (error.response && error.response.status === 401) {
      authStore.logout();
      router.push('/login');
    }
  }
});

// Métodos para manejo de foto de perfil
const triggerFileUpload = () => {
  fileInput.value.click();
};

const onFileSelected = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validar tipo y tamaño
  if (!file.type.startsWith('image/')) {
    showError('Por favor selecciona un archivo de imagen válido (JPEG, PNG, GIF).');
    return;
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB
    showError('La imagen no debe superar los 5MB de tamaño.');
    return;
  }

  try {
    loading.value = true;

    // Crear FormData para enviar el archivo
    const form = new FormData();
    form.append('photo', file); // Asegúrate de que el nombre del campo coincida con lo que tu API espera

    // Aquí harías la petición a tu API para subir la foto
    // Asumiendo que tu API devuelve el photoUrl actualizado
    const response = await postData('usuarios/upload-photo', form);
    photoUrl.value = response.photoUrl; // Actualiza la URL de la foto en el frontend
    userData.photoUrl = response.photoUrl; // También actualiza en userData si lo usas en otros lugares

    showSuccess('Foto de perfil actualizada exitosamente.');
  } catch (error) {
    console.error('Error al subir la foto:', error);
    showError('No se pudo subir la foto de perfil. Intenta de nuevo.');
  } finally {
    loading.value = false;
    // Limpiar el input de archivo para permitir la selección del mismo archivo de nuevo
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
};

// Métodos para el formulario principal
const onSubmit = async () => {
  try {
    loading.value = true;

    // Preparar datos para enviar
    const updateData = {
      name: `${formData.firstName} ${formData.lastName}`.trim(), // Eliminar espacios extra
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      preferences: {
        language: formData.language,
        theme: formData.theme,
        notifications: formData.notifications,
        newsletter: formData.newsletter
      }
    };

    // Actualizar datos en el backend
    const response = await putData('usuarios/update-profile', updateData);

    // Actualizar userData para el encabezado
    userData.name = response.name;
    userData.email = response.email;

    // Actualizar store con los nuevos datos si es necesario para reactividad global
    authStore.setUser({
      ...authStore.user, // Mantener otros campos del usuario
      ...response // Sobrescribir con la respuesta del backend
    });

    showSuccess('¡Tus datos han sido actualizados correctamente!');
  } catch (error) {
    console.error('Error al actualizar datos:', error);
    const errorMessage = error.response?.data?.message || 'Hubo un problema al actualizar tus datos. Por favor, verifica la información e intenta de nuevo.';
    showError(errorMessage);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  // Recargar datos originales del usuario desde el store si es posible
  // O volver a cargar desde la API si la fuente de verdad es la API
  const user = authStore.user; // Usar el usuario del store para resetear

  if (user) {
    const [firstName = '', ...lastNameParts] = user.name ? user.name.split(' ') : ['', ''];
    formData.firstName = firstName;
    formData.lastName = lastNameParts.join(' ');
    formData.email = user.email || '';
    formData.phone = user.phone || '';
    formData.address = user.address || '';
    formData.city = user.city || '';
    formData.language = user.preferences?.language || 'es';
    formData.theme = user.preferences?.theme || 'light';
    formData.notifications = user.preferences?.notifications ?? true;
    formData.newsletter = user.preferences?.newsletter ?? true;
  } else {
    // Si no hay datos en el store, resetear a valores por defecto o vacíos
    formData.firstName = '';
    formData.lastName = '';
    formData.email = '';
    formData.phone = '';
    formData.address = '';
    formData.city = '';
    formData.language = 'es';
    formData.theme = 'light';
    formData.notifications = true;
    formData.newsletter = true;
  }
  $q.notify({
    message: 'Formulario restablecido a los valores originales.',
    color: 'info',
    position: 'top',
    timeout: 1500
  });
};

// Métodos para cambio de contraseña
const onChangePassword = async () => {
  if (passwordForm.new !== passwordForm.confirm) {
    showError('Las nuevas contraseñas no coinciden. Por favor, verifica.');
    return;
  }
  if (passwordForm.new.length < 8) {
    showError('La nueva contraseña debe tener al menos 8 caracteres.');
    return;
  }

  try {
    loading.value = true;
    await putData('account/change-password', { // Asegúrate que esta ruta y el payload sean correctos para tu backend
      currentPassword: passwordForm.current,
      newPassword: passwordForm.new
    });

    showSuccess('¡Contraseña actualizada correctamente! Por favor, inicia sesión con tu nueva contraseña.');
    showChangePasswordDialog.value = false;

    // Limpiar formulario y quizás forzar un re-login por seguridad
    passwordForm.current = '';
    passwordForm.new = '';
    passwordForm.confirm = '';
    // authStore.logout(); // Podrías forzar el logout aquí
    // router.push('/login');
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    const errorMessage = error.response?.data?.message || 'Error al cambiar la contraseña. Asegúrate de que tu contraseña actual sea correcta.';
    showError(errorMessage);
  } finally {
    loading.value = false;
  }
};

// Método para eliminar cuenta
const deleteAccount = async () => {
  if (deleteConfirmation.value !== 'ELIMINAR') {
    showError("Debes escribir 'ELIMINAR' para confirmar la eliminación de la cuenta.");
    return;
  }

  try {
    loading.value = true;
    // Asegúrate de que esta ruta sea la correcta para tu backend
    await postData('usuarios/delete-account', {}); // A veces se envía un objeto vacío, o la contraseña para confirmar

    showSuccess('Tu cuenta ha sido eliminada exitosamente. ¡Te extrañaremos!');
    showDeleteAccountDialog.value = false;

    // Cerrar sesión y redirigir
    authStore.logout();
    router.push('/login');

  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    const errorMessage = error.response?.data?.message || 'No se pudo eliminar la cuenta. Por favor, intenta de nuevo.';
    showError(errorMessage);
  } finally {
    loading.value = false;
    deleteConfirmation.value = ''; // Limpiar campo de confirmación
  }
};

// Utilidades para notificaciones (Quasar Notify)
const showSuccess = (message) => {
  $q.notify({
    type: 'positive',
    message,
    position: 'top',
    timeout: 2500,
    actions: [{ icon: 'close', color: 'white', round: true }]
  });
};

const showError = (message) => {
  $q.notify({
    type: 'negative',
    message,
    position: 'top',
    timeout: 3500,
    actions: [{ icon: 'close', color: 'white', round: true }]
  });
};
</script>

<style scoped>
/* Importa tus variables CSS y la fuente Montserrat */
@import '../css/variables.css';
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

/* === Estilos Globales de la Página === */
.account-page {
  background: linear-gradient(180deg, #e8f2fa 0%, #ffffff 100%); /* Degradado suave */
  min-height: calc(100vh - 50px); /* Ajusta a la altura del viewport menos la barra de navegación */
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  font-family: 'Montserrat', sans-serif;
  color: var(--q-color-text-dark);
}

.account-container {
  max-width: 900px; /* Aumenta el ancho máximo del contenedor */
  width: 100%;
  margin: 0 auto;
}

/* === Header de Perfil === */
.profile-header {
  text-align: center;
  margin-bottom: 50px; /* Más espacio */
  background: linear-gradient(135deg, var(--q-color-primary-blue), var(--q-color-dark-blue));
  padding: 40px 20px;
  border-radius: 20px; /* Bordes redondeados para el header */
  box-shadow: 0 15px 40px rgba(6, 143, 255, 0.2); /* Sombra azul profunda */
  color: white;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.profile-header::before {
  content: '';
  position: absolute;
  top: -50px;
  left: -50px;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: rotate(45deg);
  z-index: -1;
  animation: blob1 10s infinite alternate ease-in-out;
}

.profile-header::after {
  content: '';
  position: absolute;
  bottom: -70px;
  right: -70px;
  width: 250px;
  height: 250px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  transform: rotate(-30deg);
  z-index: -1;
  animation: blob2 12s infinite alternate-reverse ease-in-out;
}

@keyframes blob1 {
  0% { transform: translate(0, 0) scale(1) rotate(45deg); }
  50% { transform: translate(20px, 30px) scale(1.1) rotate(50deg); }
  100% { transform: translate(0, 0) scale(1) rotate(45deg); }
}

@keyframes blob2 {
  0% { transform: translate(0, 0) scale(1) rotate(-30deg); }
  50% { transform: translate(-30px, -20px) scale(1.05) rotate(-35deg); }
  100% { transform: translate(0, 0) scale(1) rotate(-30deg); }
}


.profile-photo-container {
  position: relative;
  display: inline-block;
  margin-bottom: 25px;
  transition: transform 0.3s ease;
}

.profile-photo-container:hover {
  transform: scale(1.05); /* Efecto de zoom al pasar el ratón */
}

.profile-photo {
  border: 7px solid white; /* Borde blanco más grueso */
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25); /* Sombra más pronunciada */
  background: var(--q-color-neutral-light);
  transition: all 0.3s ease;
}

.profile-photo img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.tech-gradient-border {
  /* Usar un pseudo-elemento para el borde de gradiente */
  position: relative;
  overflow: hidden; /* Asegura que el borde degradado se recorte con el avatar */
}

.tech-gradient-border::before {
  content: '';
  position: absolute;
  top: -10px; /* Extiende para cubrir el borde del avatar */
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: linear-gradient(45deg, var(--q-color-accent), var(--q-color-primary-blue-light)); /* Gradiente */
  z-index: -1; /* Detrás del contenido del avatar */
  border-radius: 50%; /* Para que el borde sea circular */
  padding: 10px; /* Crea el efecto de borde exterior */
  transition: all 0.3s ease;
}

.profile-photo-container:hover .tech-gradient-border::before {
  transform: rotate(360deg); /* Animación de rotación del borde al hover */
  background: linear-gradient(45deg, var(--q-color-dark-blue), var(--q-color-primary-blue)); /* Cambio de gradiente */
}

.photo-upload-overlay {
  position: absolute;
  bottom: 5px; /* Ajusta la posición para que no quede justo en la esquina */
  right: 5px;
  background: rgba(0, 0, 0, 0.7); /* Fondo más oscuro */
  border-radius: 50%;
  padding: 6px; /* Ajusta el padding */
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid white; /* Borde blanco para destacarlo */
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-upload-overlay:hover {
  background: var(--q-color-accent); /* Color primario al hover */
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
  transform: scale(1.1); /* Efecto sutil de zoom */
}

.profile-name {
  font-family: 'Montserrat', sans-serif;
  font-size: 2.5em; /* Más grande */
  font-weight: 700; /* Más negrita */
  margin: 15px 0 8px; /* Espaciado */
  color: white; /* Color blanco en el header */
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3); /* Sombra de texto sutil */
}

.profile-email {
  font-family: 'Montserrat', sans-serif;
  color: rgba(255, 255, 255, 0.9); /* Blanco más transparente */
  margin: 0;
  font-size: 1.1em;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* === Tarjetas (Formulario y Seguridad) === */
.account-card {
  background: #ffffff;
  border-radius: 15px; /* Más redondeado */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); /* Sombra más pronunciada */
  margin-bottom: 30px; /* Más espacio entre tarjetas */
  overflow: hidden; /* Asegura que nada se salga del borde */
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 25px; /* Más padding */
  background: var(--q-color-neutral-light); /* Fondo suave para el encabezado de la tarjeta */
  border-bottom: 1px solid var(--q-color-neutral-border);
}

.card-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.8em; /* Más grande */
  font-weight: 700;
  color: var(--q-color-dark-blue);
  letter-spacing: -0.5px;
}

.card-icon {
  font-size: 2.2em; /* Icono más grande */
  color: var(--q-color-primary-blue);
  opacity: 0.8;
}

/* === Inputs y Selects === */
.tech-input {
  /* Estilo general para inputs */
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  letter-spacing: 0.2px;
}

.tech-input .q-field__control {
  border-radius: 8px;
  background-color: var(--q-color-input-bg); /* Un color de fondo para inputs */
  border: 1px solid var(--q-color-input-border);
  transition: all 0.3s ease;
}

.tech-input.q-field--outlined .q-field__control:hover {
  border-color: var(--q-color-primary-blue);
}

.tech-input.q-field--focused .q-field__control {
  border-color: var(--q-color-primary-blue) !important;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.2); /* Sombra azul al enfocar */
}

.tech-input .q-field__marginal {
  color: var(--q-color-grey-7); /* Color de los iconos prepend */
}

/* === Secciones de Preferencias y Seguridad (Listas) === */
.preferences-section {
  padding-top: 30px;
  border-top: 1px dashed var(--q-color-neutral-border-dashed); /* Línea punteada */
}

.tech-list {
  background: var(--q-color-list-bg); /* Fondo suave para las listas */
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.toggle-item, .security-item {
  padding: 15px 20px; /* Más padding */
  border-bottom: 1px solid var(--q-color-list-border);
  transition: background-color 0.3s ease;
}

.toggle-item:last-child, .security-item:last-child {
  border-bottom: none;
}

.toggle-item:hover, .security-item:hover {
  background-color: var(--q-color-list-hover-bg); /* Color de hover */
}

.item-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.1em;
  font-weight: 600;
  color: var(--q-color-text-dark);
}

.item-caption {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.9em;
  color: var(--q-color-text-grey);
}

.security-item.delete-item {
  color: var(--q-color-negative); /* Resalta el texto de eliminar cuenta */
}

/* === Botones de Acción === */
.action-btn {
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  padding: 12px 25px; /* Más padding */
  border-radius: 10px; /* Más redondeado */
  transition: all 0.3s ease;
}

.save-btn {
  background: linear-gradient(45deg, var(--q-color-primary-blue), var(--q-color-accent));
  color: white;
  box-shadow: 0 5px 15px rgba(33, 150, 243, 0.3);
}

.save-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(33, 150, 243, 0.4);
}

.cancel-btn {
  color: var(--q-color-text-grey);
  background: var(--q-color-neutral-light);
  border: 1px solid var(--q-color-neutral-border);
}

.cancel-btn:hover {
  color: var(--q-color-dark-blue);
  background: var(--q-color-input-bg);
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

/* === Diálogos (Cambio de Contraseña, Eliminar Cuenta) === */
.tech-dialog .dialog-card {
  font-family: 'Montserrat', sans-serif;
  border-radius: 15px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  min-width: 400px;
  max-width: 90vw;
}

.tech-dialog .dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 25px;
  background: var(--q-color-neutral-light);
  border-bottom: 1px solid var(--q-color-neutral-border);
}

.tech-dialog .dialog-header .text-h5 {
  font-weight: 700;
  color: var(--q-color-dark-blue);
}

.tech-dialog .dialog-message {
  font-size: 1.1em;
  color: var(--q-color-text-dark);
  line-height: 1.6;
}

.tech-dialog .input-bg-negative {
  background-color: rgba(255, 0, 0, 0.05); /* Fondo suave para input de eliminar */
  border-color: rgba(255, 0, 0, 0.2);
}

.tech-dialog .input-bg-negative.q-field--focused .q-field__control {
  box-shadow: 0 0 0 3px rgba(255, 0, 0, 0.2);
}

.tech-dialog .delete-confirm-btn {
  background-color: var(--q-color-negative);
  color: white;
  box-shadow: 0 5px 15px rgba(255, 0, 0, 0.2);
}
.tech-dialog .delete-confirm-btn:hover {
  background-color: #d32f2f; /* Rojo más oscuro */
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 0, 0, 0.3);
}

/* === Animaciones === */
.account-card, .profile-header {
  animation: fadeInSlideUp 0.8s ease-out forwards;
  opacity: 0; /* Inicia invisible */
  transform: translateY(20px); /* Inicia ligeramente abajo */
}

/* Aplica un ligero retraso para cada tarjeta */
.profile-header { animation-delay: 0.1s; }
.personal-data-card { animation-delay: 0.2s; }
.security-card { animation-delay: 0.3s; }


@keyframes fadeInSlideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Media Queries para responsividad */
@media (max-width: 768px) {
  .account-page {
    padding: 20px 15px;
  }
  .profile-header {
    padding: 30px 15px;
    margin-bottom: 30px;
    border-radius: 15px;
  }
  .profile-photo {
    size: 120px;
  }
  .profile-name {
    font-size: 2em;
  }
  .profile-email {
    font-size: 1em;
  }
  .account-card {
    border-radius: 10px;
    margin-bottom: 20px;
  }
  .card-header {
    padding: 15px 20px;
  }
  .card-title {
    font-size: 1.5em;
  }
  .card-icon {
    font-size: 1.8em;
  }
  .action-btn {
    padding: 10px 20px;
    font-size: 0.9em;
  }
  .tech-dialog .dialog-card {
    min-width: unset;
    width: 95vw;
  }
}

@media (max-width: 480px) {
  .account-page {
    padding: 15px 10px;
  }
  .profile-header {
    padding: 25px 10px;
  }
  .profile-photo {
    size: 100px;
    border-width: 5px;
  }
  .photo-upload-overlay {
    bottom: 0px;
    right: 0px;
    padding: 4px;
  }
  .photo-upload-overlay .q-btn {
    size: sm;
  }
  .profile-name {
    font-size: 1.8em;
    margin: 10px 0 5px;
  }
  .profile-email {
    font-size: 0.9em;
  }
  .account-card {
    border-radius: 8px;
  }
  .card-header {
    padding: 12px 15px;
  }
  .card-title {
    font-size: 1.3em;
  }
  .card-icon {
    font-size: 1.6em;
  }
  .q-gutter-lg > div {
    gap: 15px !important;
  }
  .q-gutter-lg .q-input, .q-gutter-lg .q-select {
    padding-bottom: 0 !important;
  }
  .toggle-item, .security-item {
    padding: 12px 15px;
  }
  .item-title {
    font-size: 1em;
  }
  .item-caption {
    font-size: 0.8em;
  }
  .action-btn {
    padding: 8px 15px;
    font-size: 0.8em;
    border-radius: 8px;
  }
  .tech-dialog .dialog-card {
    border-radius: 10px;
  }
  .tech-dialog .dialog-header {
    padding: 15px 20px;
  }
  .tech-dialog .dialog-header .text-h5 {
    font-size: 1.4em;
  }
  .tech-dialog .dialog-message {
    font-size: 0.9em;
  }
}
</style>