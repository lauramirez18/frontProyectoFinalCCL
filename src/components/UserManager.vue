<template>
  <div class="user-manager">
    <Breadcrumbs 
      :items="breadcrumbs"
      class="q-mb-md"
      @navigate="handleBreadcrumbNavigate"
    />
    
    <div class="q-mb-md row justify-between items-center">
      <h5 class="q-my-none text-primary">
        <q-icon name="admin_panel_settings" size="md" class="q-mr-sm" />
        Gestión de Administradores
      </h5>
      <q-btn 
        color="primary" 
        icon="add" 
        label="Nuevo Administrador" 
        @click="abrirModalNuevoUsuario" 
        no-caps
        class="q-px-md"
      />
    </div>

    <!-- Tabla de usuarios administradores -->
    <q-card class="shadow-1 q-mb-lg">
      <q-table
        title="Administradores"
        :rows="listaUsuarios"
        :columns="columnasUsuarios"
        row-key="_id"
        :loading="cargandoTabla"
        :filter="filtroTabla"
        flat
        bordered
        :pagination="{ rowsPerPage: 10 }"
        :rows-per-page-options="[5, 10, 20]"
      >
        <template v-slot:top-right>
          <q-input
            v-model="filtroTabla"
            outlined
            dense
            debounce="300"
            placeholder="Buscar usuarios..."
            class="q-mb-sm"
            style="width: 300px"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>

        <template v-slot:body-cell-foto="props">
          <q-td :props="props" class="text-center">
            <q-avatar size="36px" class="shadow-3">
              <img :src="props.row.photoUrl || 'https://cdn.quasar.dev/img/avatar.png'" />
            </q-avatar>
          </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props" class="text-center">
            <q-badge 
              :color="props.row.estado ? 'positive' : 'negative'"
              :label="props.row.estado ? 'Activo' : 'Inactivo'"
              class="q-pa-sm"
            />
            <q-tooltip>{{ props.row.estado ? 'Desactivar usuario' : 'Activar usuario' }}</q-tooltip>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="q-gutter-x-sm">
            <q-btn
              flat
              round
              color="primary"
              icon="edit"
              size="sm"
              @click="abrirModalEditarUsuario(props.row)"
              class="q-mr-sm"
            >
              <q-tooltip>Editar usuario</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              :icon="props.row.estado ? 'toggle_on' : 'toggle_off'"
              :color="props.row.estado ? 'green' : 'grey'"
              @click="confirmarCambioEstado(props.row)"
            >
              <q-tooltip>{{ props.row.estado ? 'Desactivar' : 'Activar' }} usuario</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center text-grey-8 q-gutter-sm">
            <q-icon name="person_off" size="2em" />
            <span>No se encontraron usuarios administradores</span>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Modal para crear/editar usuario -->
    <q-dialog v-model="dialogoUsuario" persistent>
      <q-card style="min-width: 500px; max-width: 80vw; border-radius: 8px;">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon :name="modoEdicion ? 'edit' : 'person_add'" class="q-mr-sm" />
            {{ modoEdicion ? 'Editar Administrador' : 'Nuevo Administrador' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-lg">
          <q-form @submit.prevent="onSubmitUsuario" class="q-gutter-y-md">
            <!-- Sección de Foto de Perfil -->
            <div class="row justify-center q-mb-lg">
              <div class="column items-center">
                <div class="relative-position">
                  <q-avatar size="100px" class="shadow-5">
                    <img :src="formUsuario.photoUrl || 'https://cdn.quasar.dev/img/avatar.png'" />
                  </q-avatar>
                  <q-badge 
                    v-if="formUsuario.photoUrl"
                    floating 
                    color="red" 
                    class="cursor-pointer"
                    @click="eliminarFoto"
                    style="top: -10px; right: -10px;"
                  >
                    <q-icon name="close" size="12px" />
                  </q-badge>
                </div>
                
                <q-file
                  v-model="fotoFile"
                  label="Cambiar foto"
                  accept=".jpg, .jpeg, .png, .gif, .webp"
                  max-file-size="5242880"
                  style="width: 200px;"
                  @rejected="onFileRejected"
                  class="q-mt-md"
                  outlined
                  dense
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                  <template v-slot:file>
                    <div class="ellipsis">
                      {{ fotoFile ? fotoFile.name : 'Seleccionar archivo' }}
                    </div>
                  </template>
                </q-file>
                <div class="text-caption text-grey-7 q-mt-xs">
                  Formatos: JPG, PNG, GIF (máx. 5MB)
                </div>
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="formUsuario.name"
                  label="Nombre completo *"
                  outlined
                  dense
                  lazy-rules
                  :rules="[val => !!val || 'El nombre es requerido']"
                  class="q-mb-sm"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" color="primary" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="formUsuario.email"
                  label="Correo electrónico *"
                  type="email"
                  outlined
                  dense
                  lazy-rules
                  :rules="[
                    val => !!val || 'El correo es requerido', 
                    val => /\S+@\S+\.\S+/.test(val) || 'Correo no válido'
                  ]"
                  class="q-mb-sm"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" color="primary" />
                  </template>
                </q-input>
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="formUsuario.phone"
                  label="Teléfono"
                  outlined
                  dense
                  mask="(###) ###-####"
                  fill-mask="#"
                  class="q-mb-sm"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" color="primary" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                <q-select
                  filled
                  v-model="formUsuario.estado"
                  :options="[
                    { label: 'Activo', value: true },
                    { label: 'Inactivo', value: false }
                  ]"
                  label="Estado *"
                  emit-value
                  map-options
                  outlined
                  dense
                  class="q-mb-sm"
                />
              </div>
            </div>

            <q-input
              v-model="formUsuario.address"
              label="Dirección"
              outlined
              dense
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="home" color="primary" />
              </template>
            </q-input>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="formUsuario.city"
                  label="Ciudad"
                  outlined
                  dense
                  class="q-mb-sm"
                >
                  <template v-slot:prepend>
                    <q-icon name="location_city" color="primary" />
                  </template>
                </q-input>
              </div>
            </div>

            <div v-if="!modoEdicion" class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="formUsuario.password"
                  :type="mostrarPassword ? 'text' : 'password'"
                  label="Contraseña *"
                  outlined
                  dense
                  lazy-rules
                  :rules="[
                    val => !!val || 'La contraseña es requerida', 
                    val => val.length >= 6 || 'Mínimo 6 caracteres'
                  ]"
                  class="q-mb-sm"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" color="primary" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="mostrarPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="mostrarPassword = !mostrarPassword"
                    />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="confirmarPassword"
                  :type="mostrarPassword ? 'text' : 'password'"
                  label="Confirmar contraseña *"
                  outlined
                  dense
                  lazy-rules
                  :rules="[
                    val => !!val || 'Confirme la contraseña',
                    val => val === formUsuario.password || 'Las contraseñas no coinciden'
                  ]"
                  class="q-mb-sm"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" color="primary" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="mostrarPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="mostrarPassword = !mostrarPassword"
                    />
                  </template>
                </q-input>
              </div>
            </div>

            <div class="q-mt-lg q-mb-sm">
              <q-toggle
                v-model="formUsuario.estado"
                :label="formUsuario.estado ? 'Usuario activo' : 'Usuario inactivo'"
                :color="formUsuario.estado ? 'positive' : 'grey-6'"
                left-label
                checked-icon="check"
                unchecked-icon="close"
              />
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-2">
          <q-btn 
            flat 
            label="Cancelar" 
            color="grey-7" 
            v-close-popup 
            @click="cerrarModal" 
            class="q-px-lg"
          />
          <q-btn 
            :label="modoEdicion ? 'Actualizar' : 'Crear Usuario'" 
            color="primary" 
            @click="onSubmitUsuario"
            :loading="guardando"
            class="q-px-lg"
            :icon-right="modoEdicion ? 'update' : 'person_add'"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import Breadcrumbs from './ui/Breadcrumbs.vue';
import useBreadcrumbs from '../composables/useBreadcrumbs';

const router = useRouter();
const { breadcrumbs } = useBreadcrumbs([
  { label: 'Administración', to: '/admin', icon: 'admin_panel_settings' },
  { label: 'Usuarios', to: '/admin/usuarios', icon: 'people', disabled: true }
]);

const handleBreadcrumbNavigate = (to) => {
  if (to) {
    router.push(to);
  }
};
import api from '../plugins/axios';
import { showNotification } from '../utils/notifications';

const $q = useQuasar();

// Estado del componente
const listaUsuarios = ref([]);
const cargandoTabla = ref(false);
const filtroTabla = ref('');
const dialogoUsuario = ref(false);
const modoEdicion = ref(false);
const guardando = ref(false);
const mostrarPassword = ref(false);
const confirmarPassword = ref('');
const fotoFile = ref(null);

// Columnas de la tabla
const columnasUsuarios = [
  {
    name: 'foto',
    label: 'Foto',
    field: 'photoUrl',
    align: 'center',
    sortable: false
  },
  {
    name: 'name',
    label: 'Nombre',
    field: 'name',
    align: 'left',
    sortable: true
  },
  {
    name: 'email',
    label: 'Correo',
    field: 'email',
    align: 'left',
    sortable: true
  },
  {
    name: 'phone',
    label: 'Teléfono',
    field: 'phone',
    align: 'left',
    sortable: true
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'center',
    sortable: true
  },
  {
    name: 'acciones',
    label: 'Acciones',
    field: 'acciones',
    align: 'center',
    sortable: false
  }
];

// Formulario de usuario
const formUsuario = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  role: 'admin',
  password: '',
  estado: true
});

// Cargar usuarios administradores
const cargarUsuarios = async () => {
  try {
    cargandoTabla.value = true;
    const response = await api.get('/usuarios/admins');
    listaUsuarios.value = response.data;
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    $q.notify({
      color: 'negative',
      message: 'Error al cargar la lista de administradores',
      icon: 'report_problem'
    });
  } finally {
    cargandoTabla.value = false;
  }
};

// Resetear formulario
const resetearFormulario = () => {
  formUsuario.value = {
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    role: 'admin',
    password: '',
    estado: true
  };
  confirmarPassword.value = '';
  fotoFile.value = null;
  modoEdicion.value = false;
};

// Abrir modal para nuevo usuario
const abrirModalNuevoUsuario = () => {
  resetearFormulario();
  dialogoUsuario.value = true;
};

// Abrir modal para editar usuario
const abrirModalEditarUsuario = (usuario) => {
  resetearFormulario();
  modoEdicion.value = true;
  
  // Copiar datos del usuario al formulario
  formUsuario.value = {
    _id: usuario._id,
    name: usuario.name,
    email: usuario.email,
    phone: usuario.phone || '',
    address: usuario.address || '',
    city: usuario.city || '',
    role: 'admin',
    estado: usuario.estado,
    photoUrl: usuario.photoUrl || ''
  };
  
  dialogoUsuario.value = true;
};

// Manejar rechazo de archivo
const onFileRejected = (rejectedEntries) => {
  $q.notify({
    type: 'negative',
    message: 'El archivo debe ser una imagen (JPG/PNG) y pesar menos de 2MB'
  });
};

// Subir foto de perfil
const subirFoto = async (file) => {
  try {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await api.post('/usuarios/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.photoUrl;
  } catch (error) {
    console.error('Error al subir la foto:', error);
    throw new Error('Error al subir la foto de perfil');
  }
};

// Guardar o actualizar usuario
const onSubmitUsuario = async () => {
  try {
    guardando.value = true;
    
    // Subir foto si se seleccionó una
    if (fotoFile.value) {
      const photoUrl = await subirFoto(fotoFile.value);
      formUsuario.value.photoUrl = photoUrl;
    }
    
    if (modoEdicion.value) {
      // Actualizar usuario existente
      const { _id, ...datosActualizacion } = formUsuario.value;
      await api.put(`/usuarios/${_id}`, datosActualizacion);
      
      $q.notify({
        color: 'positive',
        message: 'Administrador actualizado correctamente',
        icon: 'check'
      });
    } else {
      // Crear nuevo usuario
      await api.post('/usuarios/register', {
        ...formUsuario.value,
        role: 'admin' // Asegurarse de que sea admin
      });
      
      $q.notify({
        color: 'positive',
        message: 'Administrador creado correctamente',
        icon: 'check'
      });
    }
    
    // Recargar lista y cerrar diálogo
    await cargarUsuarios();
    dialogoUsuario.value = false;
    
  } catch (error) {
    console.error('Error al guardar el administrador:', error);
    
    let mensajeError = 'Error al guardar el administrador';
    if (error.response?.data?.message) {
      mensajeError = error.response.data.message;
    }
    
    $q.notify({
      color: 'negative',
      message: mensajeError,
      icon: 'report_problem'
    });
  } finally {
    guardando.value = false;
  }
};

// Confirmar cambio de estado
const confirmarCambioEstado = (usuario) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Estás seguro de ${usuario.estado ? 'desactivar' : 'activar'} este administrador?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.put(`/usuarios/${usuario._id}`, {
        estado: !usuario.estado
      });
      
      // Actualizar el estado en la lista
      const index = listaUsuarios.value.findIndex(u => u._id === usuario._id);
      if (index !== -1) {
        listaUsuarios.value[index].estado = !usuario.estado;
      }
      
      $q.notify({
        color: 'positive',
        message: `Administrador ${!usuario.estado ? 'activado' : 'desactivado'} correctamente`,
        icon: 'check'
      });
    } catch (error) {
      console.error('Error al cambiar el estado:', error);
      $q.notify({
        color: 'negative',
        message: 'Error al cambiar el estado del administrador',
        icon: 'report_problem'
      });
    }
  });
};

// Cargar datos al montar el componente
onMounted(() => {
  cargarUsuarios();
});
</script>
