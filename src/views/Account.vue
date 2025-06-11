<template>
  <q-page class="account-page">
    <div class="account-container">
      <!-- Header con foto de perfil -->
      <div class="profile-header">
        <div class="profile-photo-container">
          <q-avatar size="150px" class="profile-photo">
            <img v-if="photoUrl" :src="photoUrl" alt="Foto de perfil">
            <q-icon v-else name="person" size="80px" />
          </q-avatar>
          <div class="photo-upload-overlay">
            <q-btn
              round
              flat
              color="white"
              icon="photo_camera"
              size="sm"
              @click="triggerFileUpload"
            />
          </div>
          <input
            type="file"
            ref="fileInput"
            accept="image/*"
            style="display: none"
            @change="onFileSelected"
          >
        </div>
        <h2 class="profile-name">{{ userData.name || 'Usuario' }}</h2>
        <p class="profile-email">{{ userData.email }}</p>
      </div>

      <!-- Formulario de datos personales -->
      <q-card class="account-form">
        <q-card-section>
          <div class="text-h6">Datos Personales</div>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.firstName"
                  label="Nombre"
                  :rules="[val => !!val || 'El nombre es requerido']"
                  outlined
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.lastName"
                  label="Apellidos"
                  :rules="[val => !!val || 'Los apellidos son requeridos']"
                  outlined
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
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
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <q-input
              v-model="formData.phone"
              label="Teléfono"
              mask="(###) ###-####"
              outlined
            >
              <template v-slot:prepend>
                <q-icon name="phone" />
              </template>
            </q-input>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.address"
                  label="Dirección"
                  outlined
                >
                  <template v-slot:prepend>
                    <q-icon name="home" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.city"
                  label="Ciudad"
                  outlined
                >
                  <template v-slot:prepend>
                    <q-icon name="location_city" />
                  </template>
                </q-input>
              </div>
            </div>

            <!-- Preferencias -->
            <div class="preferences-section q-mt-lg">
              <div class="text-h6 q-mb-md">Preferencias</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="formData.language"
                    :options="languageOptions"
                    label="Idioma"
                    outlined
                  >
                    <template v-slot:prepend>
                      <q-icon name="language" />
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="formData.theme"
                    :options="themeOptions"
                    label="Tema"
                    outlined
                  >
                    <template v-slot:prepend>
                      <q-icon name="palette" />
                    </template>
                  </q-select>
                </div>
              </div>

              <q-list class="q-mt-md">
                <q-item tag="label">
                  <q-item-section>
                    <q-item-label>Recibir notificaciones</q-item-label>
                    <q-item-label caption>
                      Mantente informado sobre ofertas y novedades
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="formData.notifications" color="primary" />
                  </q-item-section>
                </q-item>

                <q-item tag="label">
                  <q-item-section>
                    <q-item-label>Newsletter</q-item-label>
                    <q-item-label caption>
                      Recibe nuestro boletín mensual
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="formData.newsletter" color="primary" />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <!-- Botones de acción -->
            <div class="row justify-end q-mt-md">
              <q-btn
                label="Cancelar"
                type="reset"
                flat
                class="q-mr-sm"
                @click="resetForm"
              />
              <q-btn
                label="Guardar cambios"
                type="submit"
                color="primary"
                :loading="loading"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <!-- Sección de seguridad -->
      <q-card class="security-section q-mt-md">
        <q-card-section>
          <div class="text-h6">Seguridad</div>
          <q-list>
            <q-item clickable @click="showChangePasswordDialog = true">
              <q-item-section avatar>
                <q-icon name="lock" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Cambiar contraseña</q-item-label>
                <q-item-label caption>
                  Actualiza tu contraseña para mayor seguridad
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>

            <q-item clickable @click="showDeleteAccountDialog = true">
              <q-item-section avatar>
                <q-icon name="delete" color="negative" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-negative">Eliminar cuenta</q-item-label>
                <q-item-label caption>
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

    <!-- Diálogo de cambio de contraseña -->
    <q-dialog v-model="showChangePasswordDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Cambiar contraseña</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onChangePassword" class="q-gutter-md">
            <q-input
              v-model="passwordForm.current"
              type="password"
              label="Contraseña actual"
              outlined
              :rules="[val => !!val || 'Este campo es requerido']"
            />

            <q-input
              v-model="passwordForm.new"
              type="password"
              label="Nueva contraseña"
              outlined
              :rules="[
                val => !!val || 'Este campo es requerido',
                val => val.length >= 8 || 'Mínimo 8 caracteres'
              ]"
            />

            <q-input
              v-model="passwordForm.confirm"
              type="password"
              label="Confirmar nueva contraseña"
              outlined
              :rules="[
                val => !!val || 'Este campo es requerido',
                val => val === passwordForm.new || 'Las contraseñas no coinciden'
              ]"
            />

            <div class="row justify-end q-mt-md">
              <q-btn
                label="Cancelar"
                flat
                v-close-popup
                class="q-mr-sm"
              />
              <q-btn
                label="Cambiar contraseña"
                type="submit"
                color="primary"
                :loading="loading"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Diálogo de confirmación para eliminar cuenta -->
    <q-dialog v-model="showDeleteAccountDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm text-h6">Eliminar cuenta</span>
        </q-card-section>

        <q-card-section>
          <p>¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.</p>
          <q-input
            v-model="deleteConfirmation"
            label="Escribe 'ELIMINAR' para confirmar"
            outlined
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            flat
            label="Eliminar cuenta"
            color="negative"
            :disable="deleteConfirmation !== 'ELIMINAR'"
            @click="deleteAccount"
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

const $q = useQuasar();
const authStore = useAuthStore();
const fileInput = ref(null);
const loading = ref(false);
const photoUrl = ref(null);
const showChangePasswordDialog = ref(false);
const showDeleteAccountDialog = ref(false);
const deleteConfirmation = ref('');

// Datos del usuario
const userData = reactive({
  name: '',
  email: ''
});

// Formulario principal
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
      // Actualizar datos del usuario
      userData.name = user.name;
      userData.email = user.email;
      
      // Separar nombre completo en nombre y apellido
      const [firstName = '', ...lastNameParts] = user.name.split(' ');
      formData.firstName = firstName;
      formData.lastName = lastNameParts.join(' ');
      formData.email = user.email;
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
    showError('Error al cargar los datos del usuario');
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
    showError('Por favor selecciona una imagen');
    return;
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB
    showError('La imagen no debe superar los 5MB');
    return;
  }

  try {
    loading.value = true;
    
    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append('photo', file);

    // Aquí harías la petición a tu API para subir la foto
    const response = await postData('usuarios/upload-photo', formData);
    photoUrl.value = response.photoUrl;

    showSuccess('Foto de perfil actualizada');
  } catch (error) {
    console.error('Error al subir la foto:', error);
    showError('Error al subir la foto');
  } finally {
    loading.value = false;
  }
};

// Métodos para el formulario principal
const onSubmit = async () => {
  try {
    loading.value = true;

    // Preparar datos para enviar
    const updateData = {
      name: `${formData.firstName} ${formData.lastName}`,
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

    // Actualizar store con los nuevos datos
    authStore.setUser({
      ...authStore.user,
      ...updateData
    });

    showSuccess('Datos actualizados correctamente');
  } catch (error) {
    console.error('Error al actualizar datos:', error);
    showError('Error al actualizar los datos');
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  // Recargar datos originales del usuario
  const user = authStore.user;
  if (user) {
    const [firstName = '', ...lastNameParts] = user.name.split(' ');
    formData.firstName = firstName;
    formData.lastName = lastNameParts.join(' ');
    formData.email = user.email;
  }
};

// Métodos para cambio de contraseña
const onChangePassword = async () => {
  if (passwordForm.new !== passwordForm.confirm) {
    showError('Las contraseñas no coinciden');
    return;
  }

  try {
    loading.value = true;
    await putData('account/change-password', {
      currentPassword: passwordForm.current,
      newPassword: passwordForm.new
    });

    showSuccess('Contraseña actualizada correctamente');
    showChangePasswordDialog.value = false;
    
    // Limpiar formulario
    passwordForm.current = '';
    passwordForm.new = '';
    passwordForm.confirm = '';
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    showError('Error al cambiar la contraseña');
  } finally {
    loading.value = false;
  }
};

// Método para eliminar cuenta
const deleteAccount = async () => {
  try {
    loading.value = true;
    await postData('usuarios/delete-account');
    
    // Cerrar sesión y redirigir
    authStore.logout();
    router.push('/login');
    
    showSuccess('Cuenta eliminada correctamente');
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    showError('Error al eliminar la cuenta');
  } finally {
    loading.value = false;
    showDeleteAccountDialog.value = false;
  }
};

// Utilidades para notificaciones
const showSuccess = (message) => {
  $q.notify({
    type: 'positive',
    message,
    position: 'top',
    timeout: 2000
  });
};

const showError = (message) => {
  $q.notify({
    type: 'negative',
    message,
    position: 'top',
    timeout: 3000
  });
};
</script>

<style scoped>
.account-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.account-container {
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  text-align: center;
  margin-bottom: 40px;
}

.profile-photo-container {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.profile-photo {
  border: 4px solid white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  background: #f5f5f5;
}

.photo-upload-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.photo-upload-overlay:hover {
  background: rgba(0, 0, 0, 0.8);
}

.profile-name {
  font-size: 24px;
  font-weight: 600;
  margin: 10px 0 5px;
}

.profile-email {
  color: #666;
  margin: 0;
}

.account-form {
  margin-bottom: 20px;
}

.preferences-section {
  border-top: 1px solid #ddd;
  padding-top: 20px;
}

.security-section {
  margin-top: 20px;
}

/* Animaciones */
.account-form, .security-section {
  animation: slideUp 0.5s ease-out;
}

.profile-header {
  animation: fadeIn 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style> 